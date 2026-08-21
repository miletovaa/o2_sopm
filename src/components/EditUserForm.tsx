"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inputClass } from "@/components/AnalysisTypeFields";
import { ROLE_LABELS } from "@/lib/roles";
import type { Role } from "@/generated/prisma/enums";

export function EditUserForm({
  id,
  initialUsername,
  initialRole,
  roles,
  isSelf,
}: {
  id: string;
  initialUsername: string;
  initialRole: Role;
  roles: Role[];
  isSelf: boolean;
}) {
  const router = useRouter();
  const [username, setUsername] = useState(initialUsername);
  const [role, setRole] = useState<Role>(initialRole);
  const [password, setPassword] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsBusy(true);
    setError(null);

    const response = await fetch(`/api/users/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username.trim(),
        role,
        ...(password ? { password } : {}),
      }),
    });

    if (response.ok) {
      router.push("/users");
      router.refresh();
    } else {
      const body = await response.json().catch(() => ({}));
      setError(body.error ?? "Failed to save changes.");
      setIsBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
        Username
        <input
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
        New password (optional)
        <input
          type="password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        <span className="text-xs text-zinc-500">
          Leave blank to keep the current password.
        </span>
      </label>

      <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
        Role
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className={inputClass}
        >
          {roles.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
        {isSelf && initialRole === "ADMIN" && (
          <span className="text-xs text-zinc-500">
            You can&apos;t remove your own admin role.
          </span>
        )}
      </label>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={isBusy}
        className="mt-2 self-start rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
      >
        {isBusy ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}