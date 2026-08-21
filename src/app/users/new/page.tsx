import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { assignableRoles } from "@/lib/roles";
import { NewUserForm } from "@/components/NewUserForm";

export default async function NewUserPage() {
  const session = await auth();
  const roles = assignableRoles(session?.user?.role);
  if (roles.length === 0) {
    redirect("/users");
  }

  return (
    <div className="mx-auto my-8 flex w-full max-w-3xl flex-1 flex-col gap-4 px-4">
      <h1 className="text-xl font-semibold text-heading">New user</h1>
      <div className="rounded-lg bg-white p-6 shadow-sm sm:p-8 dark:bg-zinc-900">
        <NewUserForm roles={roles} />
      </div>
    </div>
  );
}