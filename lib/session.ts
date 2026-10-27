import "server-only";

import { cookies } from "next/headers";

export const SESSION_COOKIE = "vellum_session";

type TokenPayload = {
  userId?: string;
  exp?: number;
};

function payloadOf(token: string): TokenPayload | null {
  const segment = token.split(".");
  if (segment.length !== 3 || !segment[1]) return null;
  try {
    const json = Buffer.from(segment[1], "base64url").toString("utf8");
    const data = JSON.parse(json) as TokenPayload;
    if (!data || typeof data !== "object") return null;
    return data;
  } catch {
    return null;
  }
}

export function safeNext(value: string | null | undefined, fallback = "/feed") {
  if (!value) return fallback;

  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return fallback;
  }

  if (
    !decoded.startsWith("/") ||
    decoded.startsWith("//") ||
    decoded.startsWith("/\\") ||
    decoded.includes("\\") ||
    decoded.includes("://") ||
    decoded.includes("\n") ||
    decoded.includes("\r") ||
    decoded.includes("\0")
  ) {
    return fallback;
  }

  return decoded;
}

export async function readSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = payloadOf(token);
  if (!payload?.userId || typeof payload.exp !== "number") return null;
  if (payload.exp * 1000 <= Date.now()) return null;
  return { token, userId: payload.userId };
}

export async function createSession(token: string) {
  const payload = payloadOf(token);
  if (!payload?.userId || typeof payload.exp !== "number") {
    throw new Error("The press returned a session that could not be read.");
  }
  const maxAge = payload.exp - Math.floor(Date.now() / 1000);
  if (maxAge <= 0) {
    throw new Error("The press returned a session that was already closed.");
  }

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
