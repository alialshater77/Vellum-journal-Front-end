import "server-only";

import { redirect, unstable_rethrow } from "next/navigation";

import { ApiError, getViewer } from "@/lib/api";
import type { Viewer } from "@/lib/types";

export async function readPress<T>(work: () => Promise<T>) {
  try {
    const data = await work();
    return { ok: true as const, data };
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof ApiError && error.status === 401) {
      redirect("/api/auth/clear?next=/login");
    }
    return {
      ok: false as const,
      message: error instanceof ApiError ? error.message : "The desk could not be opened.",
    };
  }
}

export async function requireViewer(): Promise<
  { status: "offline"; message: string } | { status: "ready"; user: Viewer }
> {
  const viewer = await getViewer();
  if (viewer.status === "guest") {
    redirect("/api/auth/clear?next=/login");
  }
  return viewer;
}
