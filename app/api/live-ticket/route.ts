import { connection } from "next/server";
import { NextResponse } from "next/server";

import { apiRequest } from "@/lib/api";
import { readSession } from "@/lib/session";

export async function GET() {
  await connection();
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  try {
    const data = await apiRequest<{ token?: string }>("/auth/live-ticket", { method: "POST" });
    if (!data.token) {
      return NextResponse.json({ message: "The live desk is not open yet." }, { status: 503 });
    }
    return NextResponse.json({ token: data.token });
  } catch {
    return NextResponse.json({ message: "The live desk is not open yet." }, { status: 503 });
  }
}
