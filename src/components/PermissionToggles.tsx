"use client";

import {
  CONTENT_ACTIONS,
  CONTENT_ACTION_LABELS,
  USERS_ACTIONS,
  USERS_ACTION_LABELS,
  type Permission,
} from "@/lib/roles";

export function PermissionToggles({
  permissions,
  onChange,
}: {
  permissions: Permission[];
  onChange: (next: Permission[]) => void;
}) {
  function toggle(permission: Permission) {
    onChange(
      permissions.includes(permission)
        ? permissions.filter((p) => p !== permission)
        : [...permissions, permission],
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          SOPs, reference &amp; safety materials
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <label className="inline-flex items-center gap-2 text-sm text-zinc-400 dark:text-zinc-500">
            <input
              type="checkbox"
              checked
              disabled
              className="rounded border-gray-300"
            />
            View (always available)
          </label>
          {CONTENT_ACTIONS.map((action) => {
            const permission: Permission = `content.${action}`;
            return (
              <label
                key={permission}
                className="inline-flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"
              >
                <input
                  type="checkbox"
                  checked={permissions.includes(permission)}
                  onChange={() => toggle(permission)}
                  className="rounded border-gray-300"
                />
                {CONTENT_ACTION_LABELS[action]}
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Users
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {USERS_ACTIONS.map((action) => {
            const permission: Permission = `users.${action}`;
            return (
              <label
                key={permission}
                className="inline-flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"
              >
                <input
                  type="checkbox"
                  checked={permissions.includes(permission)}
                  onChange={() => toggle(permission)}
                  className="rounded border-gray-300"
                />
                {USERS_ACTION_LABELS[action]}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}