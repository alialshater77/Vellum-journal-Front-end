"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { DeskNote } from "@/components/desk-note";
import { SheetPager } from "@/components/pagination";
import { PostCard } from "@/components/post-card";
import { useRealtime } from "@/components/realtime";
import { personName, POSTS_PER_SHEET } from "@/lib/format";
import type { Post } from "@/lib/types";

export function FeedBoard({
  posts,
  page,
  totalItems,
  viewerId,
  viewer,
  status,
}: {
  posts: Post[];
  page: number;
  totalItems: number;
  viewerId: string;
  viewer: { firstName: string; lastName: string };
  status: string;
}) {
  const seed = `${page}:${totalItems}:${posts.map((post) => `${post.id}:${post.updatedAt}`).join("|")}`;
  return <FeedSheet key={seed} posts={posts} page={page} totalItems={totalItems} viewerId={viewerId} viewer={viewer} status={status} />;
}

function FeedSheet({
  posts,
  page,
  totalItems,
  viewerId,
  viewer,
  status,
}: {
  posts: Post[];
  page: number;
  totalItems: number;
  viewerId: string;
  viewer: { firstName: string; lastName: string };
  status: string;
}) {
  const [items, setItems] = useState(posts);
  const [count, setCount] = useState(totalItems);
  const { subscribe } = useRealtime();

  useEffect(() => {
    return subscribe((event) => {
      if (event.post.author.id === viewerId) return;

      if (event.action === "create") {
        setCount((current) => current + 1);
        if (page !== 1) return;
        setItems((current) => {
          if (current.some((item) => item.id === event.post.id)) return current;
          return [event.post, ...current].slice(0, POSTS_PER_SHEET);
        });
        return;
      }

      if (event.action === "update") {
        setItems((current) => current.map((item) => (item.id === event.post.id ? event.post : item)));
        return;
      }

      setCount((current) => Math.max(0, current - 1));
      setItems((current) => current.filter((item) => item.id !== event.post.id));
    });
  }, [page, subscribe, viewerId]);

  const totalPages = Math.max(1, Math.ceil(count / POSTS_PER_SHEET));

  return (
    <section>
      <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="kicker">
            Sheet {Math.min(page, totalPages)} of {totalPages}
          </p>
          <h1 className="display mt-2 text-6xl md:text-7xl">The desk</h1>
          <p className="mt-3 max-w-xl text-lg text-muted">
            {personName(viewer)} · {status}
          </p>
          <p className="mt-1 text-sm text-muted">
            {count} {count === 1 ? "dispatch" : "dispatches"} · three to a sheet
          </p>
        </div>
        <Link href="/compose" className="btn btn-copper">
          New dispatch
        </Link>
      </header>

      {count === 0 ? (
        <DeskNote
          kicker="Blank sheet"
          title="Nothing is printed yet."
          message="The first dispatch sets the tone for the whole desk."
          action={{ href: "/compose", label: "Print the first one" }}
        />
      ) : items.length === 0 ? (
        <DeskNote
          kicker="Blank sheet"
          title="This sheet is empty."
          message="The later pages have not been printed."
          action={{ href: "/feed", label: "Back to the latest sheet" }}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {items.map((post, index) => (
            <PostCard key={post.id} post={post} featured={index === 0} owner={post.author.id === viewerId} />
          ))}
        </div>
      )}
      <SheetPager page={page} totalPages={totalPages} />
    </section>
  );
}
