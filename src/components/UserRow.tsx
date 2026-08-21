"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function UserRow({
  id,
  username,
  isSelf,
}: {
  id: string;
  username: string;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm(`Delete "${username}"? This cannot be undone.`)) return;

    setIsBusy(true);
    setError(null);
    const response = await fetch(`/api/users/${id}`, { method: "DELETE" });
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
        <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
      )}
      <Link
        href={`/users/${id}/edit`}
        className="rounded border border-black/10 px-3 py-1 text-xs font-medium text-black hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/10"
      >
        Edit
      </Link>
      {!isSelf && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={isBusy}
          className="rounded border border-red-600 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-950"
        >
          Delete
        </button>
      )}
    </div>
  );
}