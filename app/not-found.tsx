import { DeskNote } from "@/components/desk-note";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-16">
      <DeskNote
        kicker="Missing sheet"
        title="This page was never printed."
        message="The desk is still there. The address is not."
        action={{ href: "/", label: "Back to the door" }}
      />
    </div>
  );
}
