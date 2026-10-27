import { NextResponse } from "next/server";

import { clearSession, safeNext } from "@/lib/session";

export async function GET(request: Request) {
  await clearSession();
  const next = safeNext(new URL(request.url).searchParams.get("next"), "/login");
  return NextResponse.redirect(new URL(next, request.url));
}
