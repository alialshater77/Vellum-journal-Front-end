import type { Metadata } from "next";

import { SignupForm } from "@/components/auth-forms";
import { AuthShell } from "@/components/auth-shell";

export const metadata: Metadata = {
  title: "Join",
};

export default function SignupPage() {
  return (
    <AuthShell
      asideKicker="First sheet"
      asideTitle="Leave a name on the press."
      asideBody="No dispatch goes out unsigned. The picture, the line, and the byline travel together."
    >
      <SignupForm />
    </AuthShell>
  );
}
