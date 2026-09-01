"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inputClass } from "@/components/AnalysisTypeFields";
import { PermissionToggles } from "@/components/PermissionToggles";
import { ROLE_LABELS, type Permission } from "@/lib/roles";
import type { Role } from "@/generated/prisma/enums";

export function NewUserForm({ canAssignAdmin }: { canAssignAdmin: boolean }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("USER");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsBusy(true);
    setError(null);

    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username.trim(),
        password,
        role,
        permissions: role === "ADMIN" ? [] : permissions,
      }),
    });

    if (response.ok) {
      router.push("/users");
      router.refresh();
    } else {
      const body = await response.json().catch(() => ({}));
      setError(body.error ?? "Failed to create user.");
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
        Password
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        <span className="text-xs text-zinc-500">At least 8 characters.</span>
      </label>

      {canAssignAdmin && (
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          Role
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className={inputClass}
          >
            {(["USER", "ADMIN"] as Role[]).map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </label>
      )}

      {role === "ADMIN" ? (
        <p className="rounded border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
          Admins always have full access — the permission toggles below don&apos;t apply.
        </p>
      ) : (
        <PermissionToggles permissions={permissions} onChange={setPermissions} />
      )}

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={isBusy}
        className="mt-2 self-start rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
      >
        {isBusy ? "Creating…" : "Create user"}
      </button>
    </form>
  );
}