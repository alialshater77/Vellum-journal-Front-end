import type { Metadata } from "next";
import { Suspense } from "react";

import { DeskNote } from "@/components/desk-note";
import { FeedBoard } from "@/components/feed-board";
import { FeedSkeleton } from "@/components/skeletons";
import { getFeed } from "@/lib/api";
import { parsePage } from "@/lib/format";
import { readPress, requireViewer } from "@/lib/guards";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const query = await searchParams;
  const page = parsePage(query.page);
  return { title: page > 1 ? `The desk, sheet ${page}` : "The desk" };
}

export default function FeedPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  return (
    <Suspense fallback={<FeedSkeleton />}>
      <FeedResults searchParams={searchParams} />
    </Suspense>
  );
}

async function FeedResults({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const query = await searchParams;
  const page = parsePage(query.page);
  const viewer = await requireViewer();
  if (viewer.status === "offline") {
    const waking = viewer.message.includes("waking");
    return (
      <DeskNote
        kicker={waking ? "Waking" : "Offline"}
        title={waking ? "The press is waking" : "The press is quiet"}
        message={viewer.message}
      />
    );
  }

  const result = await readPress(() => getFeed(page));
  if (!result.ok) {
    const waking = result.message.includes("waking");
    return (
      <DeskNote
        kicker={waking ? "Waking" : "Offline"}
        title={waking ? "The press is waking" : "The sheet did not load"}
        message={result.message}
      />
    );
  }

  const feed = result.data;
  return (
    <FeedBoard
      posts={feed.posts}
      page={page}
      totalItems={feed.totalItems}
      viewerId={viewer.user.id}
      viewer={viewer.user}
      status={viewer.user.status}
    />
  );
}
