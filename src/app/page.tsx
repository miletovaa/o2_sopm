import { auth, signOut } from "@/auth";

export default async function Home() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-zinc-50 px-4 dark:bg-black">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
        SOP Management System
      </h1>
      {user && (
        <p className="text-zinc-700 dark:text-zinc-300">
          Signed in as <span className="font-medium">{user.name}</span> (
          {user.role})
        </p>
      )}
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <button
          type="submit"
          className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
