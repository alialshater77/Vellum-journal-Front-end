import type { Metadata } from "next";
import { Suspense } from "react";

import { DeskNote } from "@/components/desk-note";
import { ProfileForm } from "@/components/profile-form";
import { personName } from "@/lib/format";
import { requireViewer } from "@/lib/guards";

export const metadata: Metadata = {
  title: "Profile",
};

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="sheet h-64 animate-pulse bg-paper-deep" />}>
      <Desk />
    </Suspense>
  );
}

async function Desk() {
  const viewer = await requireViewer();
  if (viewer.status === "offline") {
    return <DeskNote kicker="Offline" title="The press is quiet" message={viewer.message} />;
  }

  return (
    <section className="mx-auto grid max-w-2xl gap-6">
      <div>
        <p className="kicker">Your profile</p>
        <h1 className="display mt-2 text-5xl md:text-6xl">{personName(viewer.user)}</h1>
        <p className="mt-3 text-muted">{viewer.user.email}</p>
      </div>
      <div className="sheet p-5 md:p-8">
        <ProfileForm user={viewer.user} />
      </div>
      <p className="text-sm leading-6 text-muted">
        This sitting lasts until the token expires, about an hour. After that, the lock turns and you enter again.
        The token stays in an httpOnly cookie and is never read by page script.
      </p>
    </section>
  );
}
