"use client";

import { IconTrash } from "@/components/icons";

export default function DeleteButton({ table, id }: { table: string; id: number }) {
  async function handleDelete() {
    if (!confirm("Supprimer cet élément ?")) return;
    await fetch(`/api/delete?table=${table}&id=${id}`, { method: "DELETE" });
    window.location.reload();
  }

  return (
    <button onClick={handleDelete} className="btn-danger" type="button">
      <IconTrash size={14} /> Supprimer
    </button>
  );
}
