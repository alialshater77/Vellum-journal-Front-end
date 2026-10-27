export function Mark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <path d="M5 7.5h14.2L27 15.2V26H5V7.5z" fill="currentColor" />
      <path d="M19.2 7.5v7.7H27" fill="none" stroke="#f3eee4" strokeWidth="1.6" />
    </svg>
  );
}
