import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { updatePost } from "@/app/actions/posts";
import { DeskNote } from "@/components/desk-note";
import { PostForm } from "@/components/post-form";
import { getPostById, postImageSrc } from "@/lib/api";
import { POST_ID } from "@/lib/format";
import { readPress, requireViewer } from "@/lib/guards";

export const instant = false;

export const metadata: Metadata = {
  title: "Revise",
};

export default function EditPage({ params }: { params: Promise<{ postId: string }> }) {
  return (
    <Suspense fallback={<div className="sheet h-96 animate-pulse bg-paper-deep" />}>
      <Revise params={params} />
    </Suspense>
  );
}

async function Revise({ params }: { params: Promise<{ postId: string }> }) {
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
        title="The plate could not be opened"
        message={result.message}
        action={{ href: "/feed", label: "Back to the desk" }}
      />
    );
  }
  if (!result.data) notFound();

  const post = result.data;
  if (post.author.id !== viewer.user.id) {
    return (
      <DeskNote
        kicker="Signed"
        title="This sheet belongs to someone else."
        message="Only the author can revise a dispatch."
        action={{ href: `/feed/${post.id}`, label: "Read it instead" }}
      />
    );
  }

  return (
    <section className="mx-auto grid max-w-3xl gap-6">
      <div>
        <p className="kicker">Revise</p>
        <h1 className="display mt-2 text-5xl md:text-6xl">Correct the plate</h1>
        <p className="mt-3 text-muted">A new picture replaces the old one. Leave it empty to keep the current plate.</p>
      </div>
      <div className="sheet p-5 md:p-8">
        <PostForm
          action={updatePost.bind(null, post.id)}
          submitLabel="Save the revision"
          pendingLabel="Inking the plate…"
          post={{
            title: post.title,
            content: post.content,
            imageUrl: post.imageUrl,
            imageSrc: postImageSrc(post.imageUrl),
          }}
        />
      </div>
    </section>
  );
}
