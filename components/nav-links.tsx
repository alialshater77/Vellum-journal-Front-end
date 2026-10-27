"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function NavLinks({
  items,
  className = "flex items-center gap-1",
}: {
  items: { href: string; label: string }[];
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav className={className} aria-label="Primary">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="nav-link"
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileMenu({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <details key={pathname} className="relative md:hidden">
      <summary className="btn btn-ghost btn-small">Menu</summary>
      <div className="absolute right-0 z-50 mt-2 grid w-64 gap-2 rounded-3xl border border-line bg-paper p-3 shadow-xl">
        {children}
      </div>
    </details>
  );
}
