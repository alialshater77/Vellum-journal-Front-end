import Link from "next/link";

import { feedHref } from "@/lib/format";

export function SheetPager({ page, totalPages }: { page: number; totalPages: number }) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Sheets" className="mt-10 flex items-center justify-between gap-3">
      {page > 1 ? (
        <Link className="btn btn-ghost" href={feedHref(page - 1)} rel="prev">
          Newer ink
        </Link>
      ) : (
        <span />
      )}
      <p className="text-sm text-muted">
        Sheet {page} / {totalPages}
      </p>
      {page < totalPages ? (
        <Link className="btn btn-ghost" href={feedHref(page + 1)} rel="next">
          Older ink
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
