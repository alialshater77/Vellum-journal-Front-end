"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";

import { ApiError, apiRequest, publicError, validationErrors } from "@/lib/api";
import { clearSession, createSession, safeNext } from "@/lib/session";
import type { FormState } from "@/lib/types";
import { normalizeEmail, validateLogin, validateProfile, validateSignup } from "@/lib/validation";

export async function login(_state: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? "/feed"));
  const fieldErrors = validateLogin(email, password);
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  try {
    const result = await apiRequest<{ token?: string }>("/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify({
        email: normalizeEmail(email),
        password: password.trim(),
      }),
    });
    if (!result.token) return { error: "The press did not open a session." };
    await createSession(result.token);
    redirect(next);
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof ApiError && error.status === 401) {
      return { error: "Email or password does not match." };
    }
    if (error instanceof Error && error.message.startsWith("The press returned")) {
      return { error: error.message };
    }
    return { error: publicError(error, "The lock did not turn. Try again.") };
  }
}

export async function signup(_state: FormState, formData: FormData): Promise<FormState> {
  const firstName = String(formData.get("firstName") ?? "");
  const lastName = String(formData.get("lastName") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fieldErrors = validateSignup(firstName, lastName, email, password);
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const cleanEmail = normalizeEmail(email);
  const cleanPassword = password.trim();

  try {
    await apiRequest("/auth/signup", {
      method: "PUT",
      auth: false,
      body: JSON.stringify({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: cleanEmail,
        password: cleanPassword,
      }),
    });
  } catch (error) {
    unstable_rethrow(error);
    return {
      error: publicError(error, "The desk could not be cut."),
      fieldErrors: validationErrors(error),
    };
  }

  try {
    const result = await apiRequest<{ token?: string }>("/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
    });
    if (!result.token) redirect("/login?joined=1");
    await createSession(result.token);
    redirect("/feed");
  } catch (error) {
    unstable_rethrow(error);
    return { error: "Your desk is cut. Sign in to open it." };
  }
}

export async function updateProfile(_state: FormState, formData: FormData): Promise<FormState> {
  const firstName = String(formData.get("firstName") ?? "");
  const lastName = String(formData.get("lastName") ?? "");
  const email = String(formData.get("email") ?? "");
  const status = String(formData.get("status") ?? "");
  const password = String(formData.get("password") ?? "");
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const currentEmail = String(formData.get("currentEmail") ?? "");
  const fieldErrors = validateProfile({
    firstName,
    lastName,
    email,
    status,
    password,
    currentPassword,
    currentEmail,
  });
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const nextPassword = password.trim();

  try {
    await apiRequest("/auth/user", {
      method: "PATCH",
      body: JSON.stringify({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizeEmail(email),
        status: status.trim(),
        password: nextPassword,
        currentPassword,
      }),
    });
    revalidatePath("/account");
    revalidatePath("/feed");
    revalidatePath("/", "layout");
    return { success: "Profile saved." };
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof ApiError && error.status === 401) redirect("/api/auth/clear?next=/login");
    return {
      error: publicError(error, "The profile did not save."),
      fieldErrors: validationErrors(error),
    };
  }
}

export async function logout() {
  await clearSession();
  redirect("/");
}
