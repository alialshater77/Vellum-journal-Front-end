"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, use, useEffect, useRef, useState, type ReactNode } from "react";

const PressReadyContext = createContext(false);

export function usePressReady() {
  return use(PressReadyContext);
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080").replace(/\/$/, "");

export function PressWake({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const refreshRef = useRef(router.refresh);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    pathnameRef.current = pathname;
    refreshRef.current = router.refresh;
  }, [pathname, router]);

  useEffect(() => {
    let gone = false;
    const started = Date.now();

    async function ping() {
      const deadline = started + 90_000;
      while (!gone && Date.now() < deadline) {
        try {
          const response = await fetch(`${API_URL}/health`, {
            cache: "no-store",
            signal: AbortSignal.timeout(15_000),
          });
          if (response.ok) {
            const data = (await response.json()) as { ready?: boolean };
            if (data.ready) {
              const path = pathnameRef.current;
              const studio =
                path.startsWith("/feed") || path.startsWith("/compose") || path === "/account";
              if (Date.now() - started > 2500 && studio) refreshRef.current();
              if (!gone) setReady(true);
              return;
            }
          }
        } catch {
          // The process is still opening its doors.
        }
        await new Promise((resolve) => window.setTimeout(resolve, 2000));
      }
    }

    void ping();
    return () => {
      gone = true;
    };
  }, []);

  return <PressReadyContext value={ready}>{children}</PressReadyContext>;
}
