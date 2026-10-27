import type { Metadata } from "next";

import { LoginForm } from "@/components/auth-forms";
import { AuthShell } from "@/components/auth-shell";
import { safeNext } from "@/lib/session";

export const metadata: Metadata = {
  title: "Enter",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; joined?: string }>;
}) {
  const query = await searchParams;

  return (
    <AuthShell
      asideKicker="A sitting"
      asideTitle="The lock knows your name."
      asideBody="Come back to the desk you already cut. New dispatches are waiting on the latest sheet."
    >
      <LoginForm next={safeNext(query.next)} joined={query.joined === "1"} />
    </AuthShell>
  );
}
