import type { ReactNode } from "react";
import { Suspense } from "react";

import { RealtimeProvider } from "@/components/realtime";
import { FeedSkeleton } from "@/components/skeletons";
import { getViewer } from "@/lib/api";

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-8 md:py-12">
          <FeedSkeleton />
        </div>
      }
    >
      <StudioFrame>{children}</StudioFrame>
    </Suspense>
  );
}

async function StudioFrame({ children }: { children: ReactNode }) {
  const viewer = await getViewer();
  const userId = viewer.status === "ready" ? viewer.user.id : "";

  return (
    <RealtimeProvider userId={userId}>
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-8 md:py-12">{children}</div>
    </RealtimeProvider>
  );
}
