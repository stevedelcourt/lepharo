"use client";

import { useRouter } from "next/navigation";
import { IconCheck } from "@/components/icons";

export default function DismissWarningButton({ id }: { id: number }) {
  const router = useRouter();

  async function dismiss() {
    await fetch("/api/warnings/dismiss", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  return (
    <button onClick={dismiss} className="btn-ghost btn-sm" type="button" style={{ fontSize: "0.75rem", padding: "4px 10px", flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 4 }}>
      <IconCheck size={12} /> OK
    </button>
  );
}
