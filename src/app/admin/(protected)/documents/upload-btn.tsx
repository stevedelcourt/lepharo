"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconUpload } from "@/components/icons";

export default function UploadButton({ docId }: { docId: number }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("id", String(docId));
      formData.append("file", file);
      const res = await fetch("/api/documents", { method: "PUT", body: formData });
      if (res.ok) router.refresh();
    } catch {}
    setUploading(false);
  }

  return (
    <>
      <input ref={ref} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" style={{ display: "none" }} onChange={handleFile} />
      <button onClick={() => ref.current?.click()} disabled={uploading} className="btn-ghost btn-sm" type="button" style={{ fontSize: "0.8125rem", padding: "2px 6px" }}>
        <IconUpload size={14} /> {uploading ? "..." : "Upload"}
      </button>
    </>
  );
}
