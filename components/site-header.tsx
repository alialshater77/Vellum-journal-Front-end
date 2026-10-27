import Link from "next/link";

import { logout } from "@/app/actions/auth";
import { Mark } from "@/components/mark";
import { MobileMenu, NavLinks } from "@/components/nav-links";
import { getViewer } from "@/lib/api";
import { personName } from "@/lib/format";

const memberLinks = [
  { href: "/feed", label: "The desk" },
  { href: "/compose", label: "Write" },
  { href: "/account", label: "Profile" },
];

const guestLinks = [
  { href: "/login", label: "Enter" },
  { href: "/signup", label: "Join" },
];

function SignOut() {
  return (
    <form action={logout}>
      <button type="submit" className="nav-link w-full justify-start">
        Sign out
      </button>
    </form>
  );
}

export async function SiteHeader() {
  const viewer = await getViewer();
  const links = viewer.status === "ready" ? memberLinks : guestLinks;

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        <Link href={viewer.status === "ready" ? "/feed" : "/"} className="flex items-center gap-2">
          <Mark className="h-8 w-8 text-pine" />
          <span className="font-serif text-2xl tracking-tight">Vellum</span>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <NavLinks items={links} />
          {viewer.status === "ready" ? (
            <p className="hidden max-w-40 truncate text-sm text-muted lg:block" title={viewer.user.status}>
              {personName(viewer.user)}
            </p>
          ) : null}
          {viewer.status === "offline" ? (
            <p className="text-sm text-copper-deep">Press offline</p>
          ) : null}
          {viewer.status !== "guest" ? <SignOut /> : null}
        </div>

        <MobileMenu>
          <NavLinks items={links} className="grid" />
          {viewer.status === "ready" ? (
            <p className="px-3 text-sm text-muted">{personName(viewer.user)}</p>
          ) : null}
          {viewer.status === "offline" ? <p className="px-3 text-sm text-copper-deep">Press offline</p> : null}
          {viewer.status !== "guest" ? <SignOut /> : null}
        </MobileMenu>
      </div>
    </header>
  );
}
