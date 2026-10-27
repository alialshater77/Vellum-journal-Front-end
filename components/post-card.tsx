import Image from "next/image";
import Link from "next/link";

import { excerpt, formatWhen, personName } from "@/lib/format";
import { postImageSrc } from "@/lib/media";
import type { Post } from "@/lib/types";

function Plate({ src, title, priority }: { src: string | null; title: string; priority?: boolean }) {
  if (!src) {
    return (
      <div className="grid h-full min-h-56 place-items-center bg-pine font-serif text-6xl text-paper">
        {title.slice(0, 1)}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt=""
      fill
      priority={priority}
      sizes="(min-width: 1024px) 33vw, 100vw"
      className="plate object-cover motion-safe:transition motion-safe:duration-500 motion-safe:group-hover:scale-[1.03]"
    />
  );
}

export function PostCard({ post, featured = false, owner = false }: { post: Post; featured?: boolean; owner?: boolean }) {
  const src = postImageSrc(post.imageUrl);
  const href = `/feed/${post.id}`;

  return (
    <article className="sheet group flex h-full flex-col overflow-hidden">
      <Link href={href} className="relative block aspect-[16/10] bg-pine">
        <Plate src={src} title={post.title} priority={featured} />
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <Link href={href} className="block">
          <p className="kicker">{formatWhen(post.createdAt) || "Undated"}</p>
          <h2 className="display mt-3 text-4xl">{post.title}</h2>
          <p className="mt-4 leading-7 text-muted">{excerpt(post.content, 140)}</p>
          <p className="mt-5 text-sm">
            By <span className="font-medium">{personName(post.author)}</span>
          </p>
        </Link>
        <div className="mt-auto flex items-center justify-between gap-3">
          <Link href={href} className="text-sm font-medium text-copper-deep">
            Read the sheet
          </Link>
          {owner ? (
            <Link href={`/feed/${post.id}/edit`} className="text-sm font-medium">
              Revise
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
