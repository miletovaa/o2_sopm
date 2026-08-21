import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ROLE_LABELS, assignableRoles, canManageUserWithRole } from "@/lib/roles";
import { UserRow } from "@/components/UserRow";

export default async function UsersPage() {
  const [session, users] = await Promise.all([
    auth(),
    prisma.user.findMany({ orderBy: { username: "asc" } }),
  ]);

  const actorRole = session?.user?.role;
  const canCreate = assignableRoles(actorRole).length > 0;

  return (
    <div className="mx-auto my-8 flex w-full max-w-3xl flex-1 flex-col gap-4 px-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-heading">Users</h1>
        {canCreate && (
          <Link
            href="/users/new"
            className="rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          >
            New user
          </Link>
        )}
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm sm:p-8 dark:bg-zinc-900">
        <ul className="flex flex-col gap-2">
          {users.map((user) => (
            <li
              key={user.id}
              className="flex items-center justify-between rounded border border-black/10 px-3 py-2 dark:border-white/10"
            >
              <span className="text-sm text-black dark:text-zinc-50">
                {user.username}{" "}
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  ({ROLE_LABELS[user.role]})
                </span>
                {user.id === session?.user?.id && (
                  <span className="ml-1 text-xs text-zinc-400">— you</span>
                )}
              </span>
              {canManageUserWithRole(actorRole, user.role) && (
                <UserRow
                  id={user.id}
                  username={user.username}
                  isSelf={user.id === session?.user?.id}
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}