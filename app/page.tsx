import Link from "next/link";

import { Mark } from "@/components/mark";

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-4 py-10 md:px-8 md:py-16">
      <section className="grid items-end gap-10 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <p className="kicker">A shared desk</p>
          <h1 className="display mt-4 max-w-4xl text-[clamp(3.4rem,8vw,7.1rem)]">
            Short notes,
            <span className="block text-copper">seen as</span>
            they are printed.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted md:text-xl">
            Vellum is a small journal for pictured dispatches. You write a note, set a picture beside
            it, and it takes a place on the desk. Anyone else who has the desk open sees that note
            arrive, change, or leave while they are still reading.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-copper">
              Join the desk
            </Link>
            <Link href="/login" className="btn btn-ghost">
              I already write here
            </Link>
          </div>
        </div>

        <aside className="sheet relative overflow-hidden p-6 md:p-7" aria-hidden="true">
          <div className="absolute right-5 top-5 text-pine">
            <Mark className="h-10 w-10" />
          </div>
          <p className="kicker">On the desk</p>
          <p className="mt-8 font-serif text-3xl leading-tight">Three notes to a sheet. A picture on every one.</p>
          <div className="mt-6 grid gap-2">
            <span className="h-2 w-4/5 rounded-full bg-paper-deep" />
            <span className="h-2 w-full rounded-full bg-paper-deep" />
            <span className="h-2 w-2/3 rounded-full bg-copper/40" />
          </div>
          <p className="mt-8 text-sm text-muted">Signed with your name, and passed across the room.</p>
        </aside>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Your name on it", "A dispatch stays with the person who printed it. Only they can revise the words or take it down."],
          ["A picture on every note", "The desk does not keep a blank page. Each dispatch carries a picture of its own."],
          ["While you are reading", "You do not refresh the page. A new note appears, a revision replaces it, and a removed note leaves a notice you can open."],
        ].map(([title, body]) => (
          <article key={title} className="sheet p-6">
            <h2 className="font-serif text-3xl">{title}</h2>
            <p className="mt-3 leading-7 text-muted">{body}</p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-[2rem] bg-pine px-6 py-10 text-paper md:px-12 md:py-14">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div>
            <p className="kicker text-paper/70">In the same moment</p>
            <h2 className="display mt-3 text-5xl md:text-6xl">Leave the desk open.</h2>
            <p className="mt-4 max-w-lg text-lg leading-8 text-paper/80">
              When another writer prints, the new dispatch takes the top of the first sheet. When they
              revise, the card in front of you changes. When they pull a note from the press, it leaves
              the desk, and a notice remains so you can still read what was there.
            </p>
          </div>
          <ol className="grid gap-3 text-paper/90">
            {[
              "Open the desk and leave it beside your work",
              "Watch a new note take its place",
              "Open a notice to read a note that was pulled",
            ].map((step, index) => (
              <li key={step} className="flex items-center gap-4 rounded-2xl bg-white/5 px-4 py-3">
                <span className="font-serif text-2xl text-copper">0{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-2xl text-center">
        <p className="kicker">A quiet room</p>
        <h2 className="display mt-3 text-4xl md:text-5xl">The first person back may wait.</h2>
        <p className="mt-4 text-lg leading-8 text-muted">
          The press rests when the room has been empty. Waking it can take about a minute. Stay on the
          page — it continues on its own, and the rest of the sitting is quick.
        </p>
      </section>
    </div>
  );
}
