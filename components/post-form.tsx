"use client";

import { useActionState, useEffect, useState } from "react";

import { SlowHint } from "@/components/slow-hint";
import type { FormState } from "@/lib/types";
import {
  IMAGE_FIELD_MESSAGE,
  type FieldErrors,
  readImage,
  validateDispatch,
} from "@/lib/validation";

const FIELD_ORDER = ["title", "content", "image"] as const;

export function PostForm({
  action,
  submitLabel,
  pendingLabel,
  post,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  pendingLabel: string;
  post?: {
    title: string;
    content: string;
    imageUrl: string;
    imageSrc: string | null;
  };
}) {
  const [state, formAction, pending] = useActionState(action, {} as FormState);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const [preview, setPreview] = useState<string | null>(post?.imageSrc ?? null);
  const imageRequired = !post;

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function clearField(name: keyof FieldErrors) {
    setClientErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  const titleError = clientErrors.title || state.fieldErrors?.title;
  const contentError = clientErrors.content || state.fieldErrors?.content;
  const imageErrorMessage = clientErrors.image || state.fieldErrors?.image;

  return (
    <form
      action={formAction}
      className="grid gap-5"
      noValidate
      onSubmit={(event) => {
        const form = event.currentTarget;
        const data = new FormData(form);
        const errors = validateDispatch({
          title: String(data.get("title") ?? ""),
          content: String(data.get("content") ?? ""),
          image: readImage(data.get("image")),
          imageRequired,
        });

        if (Object.keys(errors).length > 0) {
          event.preventDefault();
          setClientErrors(errors);
          const firstInvalid = FIELD_ORDER.find((name) => errors[name]);
          if (firstInvalid) form.querySelector<HTMLElement>(`#${firstInvalid}`)?.focus();
          return;
        }

        setClientErrors({});
      }}
    >
      {post ? <input type="hidden" name="existingImage" value={post.imageUrl} /> : null}
      {state.error ? (
        <p className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="grid gap-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          name="title"
          maxLength={140}
          defaultValue={post?.title}
          className="field"
          aria-invalid={titleError ? true : undefined}
          aria-describedby={titleError ? "title-error" : undefined}
          onChange={() => clearField("title")}
        />
        {titleError ? (
          <p id="title-error" className="field-error">
            {titleError}
          </p>
        ) : null}
      </div>
      <div className="grid gap-2">
        <label htmlFor="content" className="text-sm font-medium">
          Dispatch
        </label>
        <textarea
          id="content"
          name="content"
          maxLength={8000}
          defaultValue={post?.content}
          className="field"
          aria-invalid={contentError ? true : undefined}
          aria-describedby={contentError ? "content-error" : undefined}
          onChange={() => clearField("content")}
        />
        {contentError ? (
          <p id="content-error" className="field-error">
            {contentError}
          </p>
        ) : null}
      </div>
      <div className="grid gap-2">
        <label htmlFor="image" className="text-sm font-medium">
          Picture
        </label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/png,image/jpeg,.png,.jpg,.jpeg"
          className="field file:mr-3 file:rounded-full file:border-0 file:bg-pine file:px-3 file:py-1.5 file:text-sm file:text-paper"
          aria-invalid={imageErrorMessage ? true : undefined}
          aria-describedby={imageErrorMessage ? "image-error" : "image-hint"}
          onChange={(event) => {
            const selected = event.target.files?.[0] ?? null;
            const message = validateDispatch({
              title: "valid title",
              content: "valid content",
              image: readImage(selected),
              imageRequired,
            }).image;
            setClientErrors((current) => {
              const next = { ...current };
              if (message) next.image = message;
              else delete next.image;
              return next;
            });
            setPreview((current) => {
              if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
              if (!selected || message) return post?.imageSrc ?? null;
              return URL.createObjectURL(selected);
            });
          }}
        />
        <p id="image-hint" className="text-sm text-muted">
          {IMAGE_FIELD_MESSAGE}{" "}
          {post ? "Leave this empty to keep the current picture." : "A picture is required."}
        </p>
        {imageErrorMessage ? (
          <p id="image-error" className="field-error" role="alert">
            {imageErrorMessage}
          </p>
        ) : null}
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="mt-2 aspect-[16/9] w-full rounded-2xl object-cover" />
        ) : null}
      </div>
      <SlowHint pending={pending} />
      <button className="btn btn-copper justify-self-start" type="submit" disabled={pending || Boolean(clientErrors.image)}>
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
