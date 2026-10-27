import Link from "next/link";

export function DeskNote({
  kicker = "The press",
  title,
  message,
  action,
}: {
  kicker?: string;
  title: string;
  message: string;
  action?: { href: string; label: string };
}) {
  return (
    <section className="sheet mx-auto max-w-xl px-6 py-12 text-center md:px-10">
      <p className="kicker">{kicker}</p>
      <h1 className="display mt-3 text-5xl">{title}</h1>
      <p className="mt-4 text-lg leading-7 text-muted">{message}</p>
      {action ? (
        <Link href={action.href} className="btn btn-copper mt-8">
          {action.label}
        </Link>
      ) : null}
    </section>
  );
}
