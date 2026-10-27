"use client";

import { useEffect, useState } from "react";

import { PRESS_WAKING } from "@/lib/press-copy";

function HintClock() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setShow(true), 3000);
    return () => window.clearTimeout(id);
  }, []);

  if (!show) return null;
  return (
    <p className="text-sm leading-6 text-muted" role="status">
      {PRESS_WAKING}
    </p>
  );
}

export function SlowHint({ pending }: { pending: boolean }) {
  if (!pending) return null;
  return <HintClock />;
}
