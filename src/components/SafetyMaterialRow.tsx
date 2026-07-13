"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SafetyMaterialRow({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRename() {
    const nextName = window.prompt("Rename safety material", name);
    if (!nextName || !nextName.trim() || nextName.trim() === name) return;

    setIsBusy(true);
    setError(null);
    const response = await fetch(`/api/safety-materials/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nextName.trim() }),
    });
    if (response.ok) {
      router.refresh();
    } else {
      const body = await response.json().catch(() => ({}));
      setError(body.error ?? "Failed to rename.");
    }
    setIsBusy(false);
  }

  async function handleDelete() {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

    setIsBusy(true);
    setError(null);
    const response = await fetch(`/api/safety-materials/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      router.refresh();
    } else {
      const body = await response.json().catch(() => ({}));
      setError(body.error ?? "Failed to delete.");
      setIsBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <span className="text-xs text-red-600 dark:text-red-400">
          {error}
        </span>
      )}
      <button
        type="button"
        onClick={handleRename}
        disabled={isBusy}
        className="rounded border border-black/10 px-3 py-1 text-xs font-medium text-black hover:bg-black/5 disabled:opacity-50 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/10"
      >
        Rename
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isBusy}
        className="rounded border border-red-600 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-950"
      >
        Delete
      </button>
    </div>
  );
}
