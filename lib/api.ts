import "server-only";

import { cache } from "react";
import { unstable_rethrow } from "next/navigation";

import { POSTS_PER_SHEET } from "@/lib/format";
import { PRESS_WAKING } from "@/lib/press-copy";
import { mapPost } from "@/lib/map-post";
import { postImageSrc } from "@/lib/media";
import { readSession } from "@/lib/session";
import type { FeedPage, FormState, Post, Viewer, ViewerState } from "@/lib/types";

export { postImageSrc };

const API_URL = (process.env.API_URL || "http://127.0.0.1:8080").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type RequestOptions = {
  method?: string;
  body?: BodyInit;
  auth?: boolean;
  timeoutMs?: number;
};

async function readBody(response: Response) {
  const text = await response.text();
  if (!text) return {};
  try {
    const data: unknown = JSON.parse(text);
    return data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  } catch {
    return { message: "The press sent a reply that could not be read." };
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers();
  headers.set("Accept", "application/json");
  if (typeof options.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth !== false) {
    const session = await readSession();
    if (!session) throw new ApiError("Not authenticated.", 401);
    headers.set("Authorization", `Bearer ${session.token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body,
      cache: "no-store",
      signal: AbortSignal.timeout(options.timeoutMs ?? 20_000),
    });
  } catch (error) {
    if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
      throw new ApiError(PRESS_WAKING, 504);
    }
    throw new ApiError(PRESS_WAKING, 503);
  }

  const data = await readBody(response);
  if (!response.ok) {
    if (response.status === 502 || response.status === 503 || response.status === 504) {
      throw new ApiError(PRESS_WAKING, response.status);
    }
    const message = typeof data.message === "string" ? data.message : "The press could not complete that.";
    throw new ApiError(message, response.status, data.data);
  }
  return data as T;
}

export function publicError(error: unknown, fallback = "Something went wrong. Try again.") {
  if (error instanceof ApiError && error.message) return error.message;
  return fallback;
}

export function validationErrors(error: unknown): FormState["fieldErrors"] {
  if (!(error instanceof ApiError) || !Array.isArray(error.details)) return undefined;
  const fieldErrors: NonNullable<FormState["fieldErrors"]> = {};
  for (const item of error.details) {
    if (!item || typeof item !== "object") continue;
    const record = item as { path?: unknown; msg?: unknown };
    const path = typeof record.path === "string" ? record.path : "";
    const msg = typeof record.msg === "string" ? record.msg : "";
    if (!path || fieldErrors[path as keyof typeof fieldErrors]) continue;
    if (
      path === "firstName" ||
      path === "lastName" ||
      path === "email" ||
      path === "password" ||
      path === "currentPassword" ||
      path === "title" ||
      path === "content" ||
      path === "image" ||
      path === "status"
    ) {
      fieldErrors[path] = msg && msg !== "Invalid value" ? msg : "Check this field.";
    }
  }
  return Object.keys(fieldErrors).length ? fieldErrors : undefined;
}

export const getViewer = cache(async (): Promise<ViewerState> => {
  const session = await readSession();
  if (!session) return { status: "guest" };

  try {
    const data = await apiRequest<{ user?: Partial<Viewer> }>("/auth/user");
    const user = data.user;
    if (!user?.id || !user.firstName || !user.lastName || !user.email) {
      return { status: "offline", message: "The press returned an empty profile." };
    }
    return {
      status: "ready",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status || "I am new!",
      },
    };
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof ApiError && (error.status === 401 || error.status === 404)) {
      return { status: "guest" };
    }
    return {
      status: "offline",
      message: publicError(error, "The press is offline."),
    };
  }
});

export const getFeed = cache(async (page: number): Promise<FeedPage> => {
  const data = await apiRequest<{ posts?: unknown; totalItems?: unknown }>(
    `/feed/posts?page=${page}`,
  );
  const totalItems = typeof data.totalItems === "number" ? data.totalItems : 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / POSTS_PER_SHEET));
  const posts = Array.isArray(data.posts)
    ? data.posts.map(mapPost).filter((post): post is Post => post !== null)
    : [];
  return { posts, totalItems, page, totalPages };
});

export const getPostById = cache(async (id: string): Promise<Post | null> => {
  try {
    const data = await apiRequest<{ post?: unknown }>(`/feed/post/${encodeURIComponent(id)}`);
    return mapPost(data.post);
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
});
