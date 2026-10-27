"use client";

import Link from "next/link";
import { useActionState } from "react";

import { login, signup } from "@/app/actions/auth";
import { SlowHint } from "@/components/slow-hint";
import type { FormState } from "@/lib/types";

function Errors({ message, id }: { message?: string; id: string }) {
  if (!message) return null;
  return (
    <p id={id} className="field-error">
      {message}
    </p>
  );
}

export function LoginForm({ next, joined }: { next: string; joined: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(login, {});

  return (
    <form action={action} className="grid gap-5" noValidate>
      <input type="hidden" name="next" value={next} />
      <div>
        <p className="kicker">Enter</p>
        <h1 className="display mt-2 text-5xl">Open your desk</h1>
        <p className="mt-3 text-muted">The sitting lasts one hour, then the lock turns again.</p>
      </div>
      {joined ? (
        <p className="rounded-2xl bg-pine/10 px-4 py-3 text-sm text-pine" role="status">
          Your desk is cut. Sign in to open it.
        </p>
      ) : null}
      {state.error ? (
        <p className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
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
          required
          className="field"
          aria-invalid={state.fieldErrors?.email ? true : undefined}
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
        />
        <Errors id="email-error" message={state.fieldErrors?.email} />
      </div>
      <div className="grid gap-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="field"
          aria-invalid={state.fieldErrors?.password ? true : undefined}
          aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
        />
        <Errors id="password-error" message={state.fieldErrors?.password} />
      </div>
      <SlowHint pending={pending} />
      <button className="btn btn-copper" type="submit" disabled={pending}>
        {pending ? "Checking the lock…" : "Enter"}
      </button>
      <p className="text-sm text-muted">
        New here?{" "}
        <Link href="/signup" className="font-medium text-ink underline decoration-copper underline-offset-4">
          Cut a key
        </Link>
      </p>
    </form>
  );
}

export function SignupForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(signup, {});

  return (
    <form action={action} className="grid gap-5" noValidate>
      <div>
        <p className="kicker">Join</p>
        <h1 className="display mt-2 text-5xl">Cut a key</h1>
        <p className="mt-3 text-muted">Your first and last name, an email, and a password of at least 8 characters.</p>
      </div>
      {state.error ? (
        <p className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
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
            className="field"
            aria-invalid={state.fieldErrors?.firstName ? true : undefined}
            aria-describedby={state.fieldErrors?.firstName ? "firstName-error" : undefined}
          />
          <Errors id="firstName-error" message={state.fieldErrors?.firstName} />
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
            className="field"
            aria-invalid={state.fieldErrors?.lastName ? true : undefined}
            aria-describedby={state.fieldErrors?.lastName ? "lastName-error" : undefined}
          />
          <Errors id="lastName-error" message={state.fieldErrors?.lastName} />
        </div>
      </div>
      <div className="grid gap-2">
        <label htmlFor="signup-email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          spellCheck={false}
          required
          className="field"
          aria-invalid={state.fieldErrors?.email ? true : undefined}
          aria-describedby={state.fieldErrors?.email ? "signup-email-error" : undefined}
        />
        <Errors id="signup-email-error" message={state.fieldErrors?.email} />
      </div>
      <div className="grid gap-2">
        <label htmlFor="signup-password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={72}
          className="field"
          aria-invalid={state.fieldErrors?.password ? true : undefined}
          aria-describedby="signup-password-hint signup-password-error"
        />
        <p id="signup-password-hint" className="text-sm text-muted">
          8–72 characters. It is hashed before it is stored.
        </p>
        <Errors id="signup-password-error" message={state.fieldErrors?.password} />
      </div>
      <SlowHint pending={pending} />
      <button className="btn btn-pine" type="submit" disabled={pending}>
        {pending ? "Setting your name…" : "Cut a key"}
      </button>
      <p className="text-sm text-muted">
        Already printed here?{" "}
        <Link href="/login" className="font-medium text-ink underline decoration-copper underline-offset-4">
          Enter
        </Link>
      </p>
    </form>
  );
}
