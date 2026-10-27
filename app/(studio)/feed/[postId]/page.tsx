import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { DeletePost } from "@/components/delete-post";
import { DeskNote } from "@/components/desk-note";
import { DetailSkeleton } from "@/components/skeletons";
import { deletePost } from "@/app/actions/posts";
import { getPostById, postImageSrc } from "@/lib/api";
import { formatWhen, personName, POST_ID, wasRevised } from "@/lib/format";
import { readPress, requireViewer } from "@/lib/guards";

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ postId: string }>;
}): Promise<Metadata> {
  const { postId } = await params;
  if (!POST_ID.test(postId)) return { title: "Missing dispatch" };
  try {
    const post = await getPostById(postId);
    return { title: post?.title ?? "Missing dispatch" };
  } catch {
    return { title: "Dispatch" };
  }
}

export default function PostPage({ params }: { params: Promise<{ postId: string }> }) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <Dispatch params={params} />
    </Suspense>
  );
}

async function Dispatch({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  if (!POST_ID.test(postId)) notFound();

  const viewer = await requireViewer();
  if (viewer.status === "offline") {
    return <DeskNote kicker="Offline" title="The press is quiet" message={viewer.message} />;
  }

  const result = await readPress(() => getPostById(postId));
  if (!result.ok) {
    return (
      <DeskNote
        kicker="Offline"
        title="The dispatch did not arrive"
        message={result.message}
        action={{ href: "/feed", label: "Back to the desk" }}
      />
    );
  }
  if (!result.data) notFound();

  const post = result.data;
  const src = postImageSrc(post.imageUrl);
  const owner = post.author.id === viewer.user.id;

  return (
    <article>
      <p className="kicker">
        <Link href="/feed" className="hover:text-ink">
          The desk
        </Link>
      </p>
      <header className="mt-4 max-w-3xl">
        <h1 className="display text-5xl md:text-7xl">{post.title}</h1>
        <p className="mt-4 text-lg text-muted">
          {personName(post.author)} · {formatWhen(post.createdAt)}
          {wasRevised(post.createdAt, post.updatedAt) ? ` · Revised ${formatWhen(post.updatedAt)}` : ""}
        </p>
      </header>

      <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-[1.75rem] bg-pine">
        {src ? (
          <Image src={src} alt="" fill priority sizes="(min-width: 1152px) 1100px, 100vw" className="object-cover" />
        ) : (
          <div className="grid h-full place-items-center font-serif text-7xl text-paper">{post.title.slice(0, 1)}</div>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,42rem)_16rem] lg:items-start">
        <div className="whitespace-pre-wrap font-serif text-xl leading-9 md:text-2xl md:leading-10">{post.content}</div>
        {owner ? (
          <aside className="sheet grid gap-3 p-5">
            <p className="kicker">Your plate</p>
            <p className="text-sm leading-6 text-muted">Revise the words, or pull the sheet from every desk.</p>
            <Link href={`/feed/${post.id}/edit`} className="btn btn-pine">
              Revise
            </Link>
            <DeletePost action={deletePost.bind(null, post.id)} title={post.title} />
          </aside>
        ) : (
          <aside className="sheet p-5">
            <p className="kicker">Byline</p>
            <p className="mt-2 font-serif text-3xl">{personName(post.author)}</p>
          </aside>
        )}
      </div>
    </article>
  );
}
