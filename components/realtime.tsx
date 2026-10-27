"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";

import { usePressReady } from "@/components/press-wake";
import { personName } from "@/lib/format";
import { mapPost } from "@/lib/map-post";
import { postImageSrc } from "@/lib/media";
import type { Post } from "@/lib/types";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://127.0.0.1:8080";

export type LiveAction = "create" | "update" | "delete";

export type LiveEvent = {
  action: LiveAction;
  post: Post;
};

type Listener = (event: LiveEvent) => void;

type Notice = LiveEvent & { key: string };

const RealtimeContext = createContext<{ subscribe: (listener: Listener) => () => void } | null>(null);

export function useRealtime() {
  const value = use(RealtimeContext);
  if (!value) {
    throw new Error("Feed updates are only available inside the desk.");
  }
  return value;
}

export function RealtimeProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const listeners = useRef(new Set<Listener>());
  const pathname = usePathname();
  const router = useRouter();
  const pathnameRef = useRef(pathname);
  const refreshRef = useRef(router.refresh);

  useEffect(() => {
    pathnameRef.current = pathname;
    refreshRef.current = router.refresh;
  }, [pathname, router]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [removed, setRemoved] = useState<Post | null>(null);
  const titleId = useId();
  const ready = usePressReady();

  const subscribe = useCallback((listener: Listener) => {
    listeners.current.add(listener);
    return () => {
      listeners.current.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (!ready || !userId) return;

    const socket: Socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: false,
      reconnectionAttempts: 8,
      reconnectionDelay: 2000,
      auth: (callback) => {
        fetch("/api/live-ticket", { cache: "no-store" })
          .then(async (response) => {
            if (!response.ok) {
              callback({ token: "" });
              return;
            }
            const data = (await response.json()) as { token?: string };
            callback({ token: data.token || "" });
          })
          .catch(() => callback({ token: "" }));
      },
    });

    const onPosts = (payload: { action?: string; post?: unknown }) => {
      const action = payload?.action;
      if (action !== "create" && action !== "update" && action !== "delete") return;
      const post = mapPost(payload.post);
      if (!post || post.author.id === userId) return;

      const event: LiveEvent = { action, post };
      listeners.current.forEach((listener) => listener(event));
      setNotices((current) => [{ ...event, key: `${action}-${post.id}-${Date.now()}` }, ...current].slice(0, 4));
      if (action === "update" && pathnameRef.current === `/feed/${post.id}`) {
        refreshRef.current();
      }
    };

    socket.on("posts", onPosts);
    return () => {
      socket.off("posts", onPosts);
      socket.disconnect();
    };
  }, [ready, userId]);

  useEffect(() => {
    if (notices.length === 0) return;
    const timer = window.setTimeout(() => {
      setNotices((current) => current.slice(0, -1));
    }, 10000);
    return () => window.clearTimeout(timer);
  }, [notices]);

  return (
    <RealtimeContext value={{ subscribe }}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col gap-3 sm:left-auto sm:w-96" aria-live="polite">
        {notices.map((notice) => (
          <NoticeCard
            key={notice.key}
            notice={notice}
            onOpen={() => {
              setNotices((current) => current.filter((item) => item.key !== notice.key));
              if (notice.action === "delete") setRemoved(notice.post);
            }}
            onDismiss={() => setNotices((current) => current.filter((item) => item.key !== notice.key))}
          />
        ))}
      </div>
      {removed ? (
        <div className="fixed inset-0 z-[70] grid place-items-end bg-ink/60 p-4 sm:place-items-center">
          <article role="dialog" aria-modal="true" aria-labelledby={titleId} className="sheet sheet-solid max-h-[85vh] w-full max-w-lg overflow-auto p-6">
            <p className="kicker">Pulled from the press</p>
            <h2 id={titleId} className="display mt-2 text-4xl">
              {removed.title}
            </h2>
            <p className="mt-2 text-sm text-muted">By {personName(removed.author)}</p>
            <RemovedPlate post={removed} />
            <p className="mt-4 whitespace-pre-wrap leading-7">{removed.content}</p>
            <button type="button" className="btn btn-ghost mt-6" onClick={() => setRemoved(null)} autoFocus>
              Close
            </button>
          </article>
        </div>
      ) : null}
    </RealtimeContext>
  );
}

function NoticeCard({
  notice,
  onOpen,
  onDismiss,
}: {
  notice: Notice;
  onOpen: () => void;
  onDismiss: () => void;
}) {
  const router = useRouter();
  const who = personName(notice.post.author);
  const label =
    notice.action === "create"
      ? `${who} printed “${notice.post.title}”.`
      : notice.action === "update"
        ? `${who} revised “${notice.post.title}”.`
        : `${who} pulled “${notice.post.title}”.`;

  const open = () => {
    onOpen();
    if (notice.action === "create") router.push(`/feed/${notice.post.id}`);
  };

  return (
    <div className="pointer-events-auto sheet sheet-solid flex items-start gap-3 p-4">
      {notice.action === "update" ? (
        <p className="flex-1 text-sm leading-6">{label}</p>
      ) : (
        <button type="button" className="flex-1 text-left text-sm leading-6" onClick={open}>
          <span className="block font-medium">{label}</span>
          <span className="mt-1 block text-copper-deep">
            {notice.action === "create" ? "Open the dispatch" : "See what was pulled"}
          </span>
        </button>
      )}
      <button type="button" className="text-sm text-muted" onClick={onDismiss} aria-label="Dismiss notification">
        Close
      </button>
    </div>
  );
}

function RemovedPlate({ post }: { post: Post }) {
  const src = postImageSrc(post.imageUrl);
  if (!src) return null;
  return (
    // The file may already be gone from the press; the words above still stand.
    // eslint-disable-next-line @next/next/no-img-element
    <img
        src={src}
        alt=""
        className="mt-4 aspect-[16/9] w-full rounded-2xl object-cover"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
  );
}
