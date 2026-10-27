import { SlowHint } from "@/components/slow-hint";
import { FeedSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="grid gap-6">
      <SlowHint pending />
      <FeedSkeleton />
    </div>
  );
}
