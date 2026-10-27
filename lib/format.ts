export const POSTS_PER_SHEET = 3;

export function parsePage(value: string | undefined) {
  const page = Number(value);
  if (!Number.isInteger(page) || page < 1 || page > 500) return 1;
  return page;
}

export function feedHref(page: number) {
  return page <= 1 ? "/feed" : `/feed?page=${page}`;
}

export function formatWhen(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function wasRevised(createdAt: string, updatedAt: string) {
  const created = new Date(createdAt).getTime();
  const updated = new Date(updatedAt).getTime();
  return Number.isFinite(created) && Number.isFinite(updated) && updated - created > 60_000;
}

export function personName(person: { firstName: string; lastName: string }) {
  return `${person.firstName} ${person.lastName}`.trim();
}

export function excerpt(text: string, max = 170) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trimEnd()}…`;
}

export const POST_ID = /^[a-f\d]{24}$/i;
