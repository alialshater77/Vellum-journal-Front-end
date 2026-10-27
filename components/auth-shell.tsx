import type { ReactNode } from "react";

export function AuthShell({
  asideKicker,
  asideTitle,
  asideBody,
  children,
}: {
  asideKicker: string;
  asideTitle: string;
  asideBody: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto grid w-full max-w-6xl flex-1 items-stretch gap-6 px-4 py-8 md:grid-cols-[1.05fr_0.95fr] md:px-8 md:py-14">
      <section className="relative overflow-hidden rounded-[2rem] bg-pine px-7 py-10 text-paper md:px-10 md:py-14">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-copper/30" aria-hidden="true" />
        <div className="absolute bottom-8 left-8 h-24 w-24 rounded-full border border-paper/20" aria-hidden="true" />
        <p className="kicker text-paper/70">{asideKicker}</p>
        <h2 className="display mt-4 max-w-md text-5xl text-paper md:text-7xl">{asideTitle}</h2>
        <p className="mt-6 max-w-sm text-lg leading-8 text-paper/80">{asideBody}</p>
      </section>
      <section className="sheet p-6 md:p-8">{children}</section>
    </div>
  );
}
