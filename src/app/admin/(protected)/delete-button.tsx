"use client";

export default function DeleteButton({ table, id }: { table: string; id: number }) {
  async function handleDelete() {
    if (!confirm("Supprimer cet élément ?")) return;
    await fetch(`/api/delete?table=${table}&id=${id}`, { method: "DELETE" });
    window.location.reload();
  }

  return (
    <button onClick={handleDelete} className="btnDanger" type="button">
      Supprimer
    </button>
  );
}
