const IMAGE_PATH = /^images\/[^/]+$/;

export function postImageSrc(imageUrl: string) {
  const clean = imageUrl.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!IMAGE_PATH.test(clean) || clean.includes("..")) return null;
  const base = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080").replace(/\/$/, "");
  return `${base}/${clean}`;
}
