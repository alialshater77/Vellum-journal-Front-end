"use client";

import { useActionState, useState } from "react";

import { SlowHint } from "@/components/slow-hint";
import type { FormState } from "@/lib/types";

export function DeletePost({
  action,
  title,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(action, {} as FormState);

  return (
    <>
      <button type="button" className="btn btn-ghost" onClick={() => setOpen(true)}>
        Pull from the press
      </button>
      {open ? (
        <div className="fixed inset-0 z-[70] grid place-items-end bg-ink/60 p-4 sm:place-items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="sheet sheet-solid w-full max-w-md p-6"
          >
            <p className="kicker">Remove</p>
            <h2 id="delete-title" className="display mt-2 text-4xl">
              Pull this dispatch?
            </h2>
            <p className="mt-3 text-muted">{title} leaves every open desk.</p>
            {state.error ? (
              <p className="mt-3 text-sm text-danger" role="alert">
                {state.error}
              </p>
            ) : null}
            <SlowHint pending={pending} />
            <form action={formAction} className="mt-6 flex flex-wrap gap-3">
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)} autoFocus>
                Keep it
              </button>
              <button className="btn btn-copper" type="submit" disabled={pending}>
                {pending ? "Pulling…" : "Delete"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
