import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { assignableRoles, canManageUserWithRole } from "@/lib/roles";
import { EditUserForm } from "@/components/EditUserForm";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [session, user] = await Promise.all([
    auth(),
    prisma.user.findUnique({ where: { id } }),
  ]);

  if (!user) {
    notFound();
  }
  if (!canManageUserWithRole(session?.user?.role, user.role)) {
    redirect("/users");
  }

  return (
    <div className="mx-auto my-8 flex w-full max-w-3xl flex-1 flex-col gap-4 px-4">
      <h1 className="text-xl font-semibold text-heading">
        Edit user — {user.username}
      </h1>
      <div className="rounded-lg bg-white p-6 shadow-sm sm:p-8 dark:bg-zinc-900">
        <EditUserForm
          id={user.id}
          initialUsername={user.username}
          initialRole={user.role}
          roles={assignableRoles(session?.user?.role)}
          isSelf={user.id === session?.user?.id}
        />
      </div>
    </div>
  );
}