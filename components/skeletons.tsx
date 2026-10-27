export function HeaderFallback() {
  return <div className="h-[68px] border-b border-line bg-paper/90" aria-hidden="true" />;
}

export function FeedSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3" aria-hidden="true">
      <div className="sheet h-80 animate-pulse bg-paper-deep" />
      <div className="sheet h-80 animate-pulse bg-paper-deep" />
      <div className="sheet h-80 animate-pulse bg-paper-deep" />
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="grid gap-6" aria-hidden="true">
      <div className="sheet h-[28rem] animate-pulse bg-paper-deep" />
      <div className="sheet h-40 animate-pulse bg-paper-deep" />
    </div>
  );
}
