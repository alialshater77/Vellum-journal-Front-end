import type { Author, Post } from "@/lib/types";

function text(value: unknown) {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return "";
}

export function mapAuthor(creator: unknown): Author {
  if (creator && typeof creator === "object") {
    const record = creator as {
      _id?: unknown;
      firstName?: unknown;
      lastName?: unknown;
      name?: unknown;
    };
    let firstName = text(record.firstName);
    let lastName = text(record.lastName);
    if (!firstName || !lastName) {
      const parts = text(record.name).split(/\s+/).filter(Boolean);
      if (!firstName) firstName = parts.shift() || "Member";
      if (!lastName) lastName = parts.join(" ") || "Member";
    }
    return {
      id: text(record._id),
      firstName,
      lastName,
    };
  }
  return { id: text(creator), firstName: "Member", lastName: "Member" };
}

export function mapPost(value: unknown): Post | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const id = text(record._id);
  const title = text(record.title);
  const content = text(record.content);
  const imageUrl = text(record.imageUrl).replace(/\\/g, "/");
  if (!id || !title || !content || !imageUrl) return null;
  return {
    id,
    title,
    content,
    imageUrl,
    createdAt: text(record.createdAt),
    updatedAt: text(record.updatedAt),
    author: mapAuthor(record.creator),
  };
}
