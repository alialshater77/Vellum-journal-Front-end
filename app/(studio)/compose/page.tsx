import type { Metadata } from "next";
import { Suspense } from "react";

import { createPost } from "@/app/actions/posts";
import { DeskNote } from "@/components/desk-note";
import { PostForm } from "@/components/post-form";
import { requireViewer } from "@/lib/guards";

export const metadata: Metadata = {
  title: "Write",
};

export default function ComposePage() {
  return (
    <Suspense fallback={<div className="sheet h-96 animate-pulse bg-paper-deep" />}>
      <ComposeDesk />
    </Suspense>
  );
}

async function ComposeDesk() {
  const viewer = await requireViewer();
  if (viewer.status === "offline") {
    return <DeskNote kicker="Offline" title="The press is quiet" message={viewer.message} />;
  }

  return (
    <section className="mx-auto grid max-w-3xl gap-6">
      <div>
        <p className="kicker">New dispatch</p>
        <h1 className="display mt-2 text-5xl md:text-6xl">Set the type, {viewer.user.firstName}.</h1>
        <p className="mt-3 max-w-xl text-muted">
          Five characters is the shortest title the press will take. Bring a picture. Every open desk will see it.
        </p>
      </div>
      <div className="sheet p-5 md:p-8">
        <PostForm action={createPost} submitLabel="Print it" pendingLabel="Inking the plate…" />
      </div>
    </section>
  );
}
