/** Shared by the form, the server action, and the API upload limit. */
export const MAX_IMAGE_BYTES = 1 * 1024 * 1024;

export const IMAGE_FIELD_MESSAGE = "Use a PNG or JPEG no larger than 1 MB.";

const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/jpg"]);
const IMAGE_NAME = /\.(png|jpe?g)$/i;

export type ImageFile = {
  name: string;
  type: string;
  size: number;
};

export type FieldErrors = Partial<
  Record<"firstName" | "lastName" | "email" | "password" | "currentPassword" | "title" | "content" | "image" | "status", string>
>;

/**
 * Match express-validator's normalizeEmail so signup and login hit the same record.
 * Gmail dots and plus-tags are removed; other common providers drop plus-tags.
 */
export function normalizeEmail(value: string) {
  const trimmed = value.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at <= 0) return trimmed;

  let local = trimmed.slice(0, at);
  let domain = trimmed.slice(at + 1);
  if (domain === "googlemail.com") domain = "gmail.com";

  const stripPlus =
    domain === "gmail.com" ||
    domain === "outlook.com" ||
    domain === "hotmail.com" ||
    domain === "live.com" ||
    domain === "yahoo.com" ||
    domain === "icloud.com" ||
    domain === "me.com";

  const plus = local.indexOf("+");
  if (stripPlus && plus > 0) local = local.slice(0, plus);
  if (domain === "gmail.com") local = local.replace(/\./g, "");
  return `${local}@${domain}`;
}

export function isStoredImage(path: string) {
  if (!path || path.length > 240) return false;
  if (path.includes("..") || path.includes("\\") || path.includes("\0")) return false;
  return /^images\/[^/]+$/.test(path);
}

export function readImage(value: FormDataEntryValue | File | null | undefined): ImageFile | null {
  if (!value || typeof value !== "object") return null;
  if (!("size" in value) || !("type" in value) || !("name" in value)) return null;
  const file = value as File;
  if (file.size <= 0) return null;
  return { name: file.name, type: file.type, size: file.size };
}

export function asUpload(value: FormDataEntryValue | null) {
  return isUpload(value) ? value : null;
}

function isUpload(value: FormDataEntryValue | null): value is File {
  return readImage(value) !== null && typeof value === "object" && value !== null && "arrayBuffer" in value;
}

export function imageError(file: ImageFile | null, required: boolean) {
  if (!file) return required ? IMAGE_FIELD_MESSAGE : null;
  const typeAllowed = IMAGE_TYPES.has(file.type);
  const nameAllowed = IMAGE_NAME.test(file.name);
  if (!typeAllowed || !nameAllowed || file.size > MAX_IMAGE_BYTES) return IMAGE_FIELD_MESSAGE;
  return null;
}

export function validateDispatch(input: {
  title: string;
  content: string;
  image: ImageFile | null;
  imageRequired: boolean;
}): FieldErrors {
  const errors = validatePost(input.title, input.content);
  const picture = imageError(input.image, input.imageRequired);
  if (picture) errors.image = picture;
  return errors;
}

export function validateLogin(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Enter a valid email.";
  }
  if (!password.trim()) errors.password = "Enter your password.";
  return errors;
}

export function validateSignup(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
): FieldErrors {
  const errors: FieldErrors = {};
  const cleanFirst = firstName.trim();
  const cleanLast = lastName.trim();
  if (!cleanFirst) errors.firstName = "Enter your first name.";
  else if (cleanFirst.length > 80) errors.firstName = "Keep your first name under 80 characters.";
  if (!cleanLast) errors.lastName = "Enter your last name.";
  else if (cleanLast.length > 80) errors.lastName = "Keep your last name under 80 characters.";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Enter a valid email.";
  }

  const cleanPassword = password.trim();
  if (cleanPassword.length < 8) errors.password = "Use at least 8 characters.";
  else if (cleanPassword.length > 72) errors.password = "Passwords stop being stronger after 72 characters.";
  return errors;
}

export function validatePost(title: string, content: string): FieldErrors {
  const errors: FieldErrors = {};
  const cleanTitle = title.trim();
  const cleanContent = content.trim();
  if (cleanTitle.length < 5) errors.title = "Title needs at least 5 characters.";
  else if (cleanTitle.length > 140) errors.title = "Keep the title under 140 characters.";
  if (cleanContent.length < 5) errors.content = "Write at least 5 characters.";
  else if (cleanContent.length > 8000) errors.content = "Keep the dispatch under 8,000 characters.";
  return errors;
}

export function validateStatus(status: string): FieldErrors {
  const clean = status.trim();
  if (!clean) return { status: "Status cannot be empty." };
  if (clean.length > 140) return { status: "Keep the status under 140 characters." };
  return {};
}

export function validateProfile(input: {
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  password: string;
  currentPassword: string;
  currentEmail: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  const cleanFirst = input.firstName.trim();
  const cleanLast = input.lastName.trim();
  if (!cleanFirst) errors.firstName = "Enter your first name.";
  else if (cleanFirst.length > 80) errors.firstName = "Keep your first name under 80 characters.";
  if (!cleanLast) errors.lastName = "Enter your last name.";
  else if (cleanLast.length > 80) errors.lastName = "Keep your last name under 80 characters.";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    errors.email = "Enter a valid email.";
  }

  const statusErrors = validateStatus(input.status);
  if (statusErrors.status) errors.status = statusErrors.status;

  const nextPassword = input.password.trim();
  if (nextPassword.length > 0 && nextPassword.length < 8) errors.password = "Use at least 8 characters.";
  else if (nextPassword.length > 72) errors.password = "Passwords stop being stronger after 72 characters.";

  const emailChanged = normalizeEmail(input.email) !== normalizeEmail(input.currentEmail);
  if ((emailChanged || nextPassword) && !input.currentPassword.trim()) {
    errors.currentPassword = "Enter your current password to change your email or password.";
  }
  return errors;
}
