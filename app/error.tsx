"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 items-center px-4 py-16">
      <section className="sheet w-full px-6 py-12 text-center">
        <p className="kicker">Torn sheet</p>
        <h1 className="display mt-3 text-5xl">The page did not hold.</h1>
        <p className="mt-4 text-muted">Something unexpected happened. Your sitting is still on the desk.</p>
        <button type="button" className="btn btn-copper mt-8" onClick={reset}>
          Try the page again
        </button>
      </section>
    </div>
  );
}
