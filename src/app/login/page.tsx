import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;

  async function loginAction(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", formData);
    } catch (err) {
      if (err instanceof AuthError) {
        redirect(
          `/login?error=CredentialsSignin${callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`,
        );
      }
      throw err;
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <form
        action={loginAction}
        className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-black/10 bg-white p-8 dark:border-white/10 dark:bg-zinc-950"
      >
        <h1 className="text-xl font-semibold text-heading">
          SOP Management System
        </h1>
        <input type="hidden" name="redirectTo" value={callbackUrl ?? "/"} />
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          Username
          <input
            name="username"
            type="text"
            required
            autoFocus
            className="rounded border border-black/10 bg-transparent px-3 py-2 text-black outline-none focus:border-black/40 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/40"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          Password
          <input
            name="password"
            type="password"
            required
            className="rounded border border-black/10 bg-transparent px-3 py-2 text-black outline-none focus:border-black/40 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/40"
          />
          <span className="text-xs text-zinc-500">
            First time signing in? Enter the password you&apos;d like to use — it
            will be set as your password.
          </span>
        </label>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            Invalid username or password (at least 8 characters if this is your
            first time signing in).
          </p>
        )}
        <button
          type="submit"
          className="mt-2 rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
