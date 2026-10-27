"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";

import { ApiError, apiRequest, publicError, validationErrors } from "@/lib/api";
import { POST_ID } from "@/lib/format";
import type { FormState } from "@/lib/types";
import { asUpload, IMAGE_FIELD_MESSAGE, isStoredImage, readImage, validateDispatch } from "@/lib/validation";

function fail(error: unknown): FormState {
  return {
    error: publicError(error, "The press could not finish that."),
    fieldErrors: validationErrors(error),
  };
}

export async function createPost(_state: FormState, formData: FormData): Promise<FormState> {
  const title = String(formData.get("title") ?? "");
  const content = String(formData.get("content") ?? "");
  const image = formData.get("image");
  const fieldErrors = validateDispatch({
    title,
    content,
    image: readImage(image),
    imageRequired: true,
  });
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const body = new FormData();
  body.append("title", title.trim());
  body.append("content", content.trim());
  const upload = asUpload(image);
  if (!upload) return { fieldErrors: { image: IMAGE_FIELD_MESSAGE } };
  body.append("image", upload, upload.name || "dispatch.jpg");

  try {
    const result = await apiRequest<{ post?: { _id?: string } }>("/feed/post", {
      method: "POST",
      body,
      timeoutMs: 30_000,
    });
    const id = result.post?._id;
    revalidatePath("/feed");
    if (!id || !POST_ID.test(id)) {
      redirect("/feed");
    }
    redirect(`/feed/${id}`);
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof ApiError && error.status === 401) redirect("/api/auth/clear?next=/login");
    return fail(error);
  }
}

export async function updatePost(
  postId: string,
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!POST_ID.test(postId)) return { error: "That dispatch is not on the desk." };

  const title = String(formData.get("title") ?? "");
  const content = String(formData.get("content") ?? "");
  const existingImage = String(formData.get("existingImage") ?? "");
  const image = formData.get("image");
  const fieldErrors = validateDispatch({
    title,
    content,
    image: readImage(image),
    imageRequired: false,
  });
  const upload = asUpload(image);
  if (!upload && !isStoredImage(existingImage) && !fieldErrors.image) {
    fieldErrors.image = "Keep the current picture or choose a new PNG or JPEG.";
  }
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const body = new FormData();
  body.append("title", title.trim());
  body.append("content", content.trim());
  if (upload) body.append("image", upload, upload.name || "dispatch.jpg");
  else body.append("image", existingImage);

  try {
    await apiRequest(`/feed/post/${postId}`, {
      method: "PUT",
      body,
      timeoutMs: 30_000,
    });
    revalidatePath("/feed");
    revalidatePath(`/feed/${postId}`);
    redirect(`/feed/${postId}`);
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof ApiError && error.status === 401) redirect("/api/auth/clear?next=/login");
    return fail(error);
  }
}

export async function deletePost(
  postId: string,
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  void state;
  void formData;
  if (!POST_ID.test(postId)) return { error: "That dispatch is not on the desk." };

  try {
    await apiRequest(`/feed/post/${postId}`, { method: "DELETE" });
    revalidatePath("/feed");
    revalidatePath(`/feed/${postId}`);
    redirect("/feed");
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof ApiError && error.status === 401) redirect("/api/auth/clear?next=/login");
    return fail(error);
  }
}
