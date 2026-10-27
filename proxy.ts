import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "vellum_session";

function sessionIsLive(token: string | undefined) {
  if (!token) return false;
  const segment = token.split(".")[1];
  if (!segment) return false;
  try {
    const padded = segment
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(segment.length / 4) * 4, "=");
    const payload = JSON.parse(atob(padded)) as { exp?: unknown; userId?: unknown };
    return (
      typeof payload.exp === "number" &&
      payload.exp * 1000 > Date.now() &&
      typeof payload.userId === "string" &&
      payload.userId.length > 0
    );
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const live = sessionIsLive(token);
  const isStudio =
    pathname.startsWith("/feed") || pathname.startsWith("/compose") || pathname.startsWith("/account");
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (isStudio && !live) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", `${pathname}${search}`);
    const response = NextResponse.redirect(url);
    if (token) response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  if (isAuthPage && live) {
    const url = request.nextUrl.clone();
    url.pathname = "/feed";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  if (token && !live) response.cookies.delete(SESSION_COOKIE);
  return response;
}

export const config = {
  matcher: ["/feed/:path*", "/compose", "/account", "/login", "/signup"],
};
