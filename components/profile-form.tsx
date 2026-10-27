"use client";

import { useActionState, useRef, useState } from "react";

import { updateProfile } from "@/app/actions/auth";
import { SlowHint } from "@/components/slow-hint";
import type { FormState, Viewer } from "@/lib/types";
import { type FieldErrors, validateProfile } from "@/lib/validation";

const FIELD_ORDER = ["firstName", "lastName", "email", "status", "password", "currentPassword"] as const;

function Errors({ message, id }: { message?: string; id: string }) {
  if (!message) return null;
  return (
    <p id={id} className="field-error">
      {message}
    </p>
  );
}

export function ProfileForm({ user }: { user: Viewer }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const [state, formAction, pending] = useActionState<FormState, FormData>(async (previous, formData) => {
    const result = await updateProfile(previous, formData);
    if (result.success) {
      formRef.current?.querySelectorAll<HTMLInputElement>('input[type="password"]').forEach((input) => {
        input.value = "";
      });
    }
    return result;
  }, {});

  function clearField(name: keyof FieldErrors) {
    setClientErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  const firstNameError = clientErrors.firstName || state.fieldErrors?.firstName;
  const lastNameError = clientErrors.lastName || state.fieldErrors?.lastName;
  const emailError = clientErrors.email || state.fieldErrors?.email;
  const statusError = clientErrors.status || state.fieldErrors?.status;
  const passwordError = clientErrors.password || state.fieldErrors?.password;
  const currentPasswordError = clientErrors.currentPassword || state.fieldErrors?.currentPassword;

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid gap-5"
      noValidate
      onSubmit={(event) => {
        const form = event.currentTarget;
        const data = new FormData(form);
        const errors = validateProfile({
          firstName: String(data.get("firstName") ?? ""),
          lastName: String(data.get("lastName") ?? ""),
          email: String(data.get("email") ?? ""),
          status: String(data.get("status") ?? ""),
          password: String(data.get("password") ?? ""),
          currentPassword: String(data.get("currentPassword") ?? ""),
          currentEmail: user.email,
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
      <input type="hidden" name="currentEmail" value={user.email} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="firstName" className="text-sm font-medium">
            First name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            maxLength={80}
            defaultValue={user.firstName}
            className="field"
            aria-invalid={firstNameError ? true : undefined}
            aria-describedby={firstNameError ? "firstName-error" : undefined}
            onChange={() => clearField("firstName")}
          />
          <Errors id="firstName-error" message={firstNameError} />
        </div>
        <div className="grid gap-2">
          <label htmlFor="lastName" className="text-sm font-medium">
            Last name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            maxLength={80}
            defaultValue={user.lastName}
            className="field"
            aria-invalid={lastNameError ? true : undefined}
            aria-describedby={lastNameError ? "lastName-error" : undefined}
            onChange={() => clearField("lastName")}
          />
          <Errors id="lastName-error" message={lastNameError} />
        </div>
      </div>
      <div className="grid gap-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          spellCheck={false}
          defaultValue={user.email}
          className="field"
          aria-invalid={emailError ? true : undefined}
          aria-describedby={emailError ? "email-error" : undefined}
          onChange={() => clearField("email")}
        />
        <Errors id="email-error" message={emailError} />
      </div>
      <div className="grid gap-2">
        <label htmlFor="status" className="text-sm font-medium">
          Status
        </label>
        <input
          id="status"
          name="status"
          maxLength={140}
          defaultValue={user.status}
          className="field"
          aria-invalid={statusError ? true : undefined}
          aria-describedby={statusError ? "status-error" : "status-hint"}
          onChange={() => clearField("status")}
        />
        <p id="status-hint" className="text-sm text-muted">
          A short line other writers see with your name.
        </p>
        <Errors id="status-error" message={statusError} />
      </div>
      <div className="grid gap-2">
        <label htmlFor="password" className="text-sm font-medium">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          maxLength={72}
          className="field"
          aria-invalid={passwordError ? true : undefined}
          aria-describedby="password-hint password-error"
          onChange={() => clearField("password")}
        />
        <p id="password-hint" className="text-sm text-muted">
          Leave this blank to keep your current password. A new one needs 8–72 characters.
        </p>
        <Errors id="password-error" message={passwordError} />
      </div>
      <div className="grid gap-2">
        <label htmlFor="currentPassword" className="text-sm font-medium">
          Current password
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          className="field"
          aria-invalid={currentPasswordError ? true : undefined}
          aria-describedby="current-password-hint current-password-error"
          onChange={() => clearField("currentPassword")}
        />
        <p id="current-password-hint" className="text-sm text-muted">
          Required only when you change your email or password.
        </p>
        <Errors id="current-password-error" message={currentPasswordError} />
      </div>
      {state.error ? (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-pine" role="status">
          {state.success}
        </p>
      ) : null}
      <SlowHint pending={pending} />
      <button className="btn btn-pine justify-self-start" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
