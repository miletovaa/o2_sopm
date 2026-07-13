"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Hidden on "/" since the SOP list page already shows its own copy of this
// button. Needs usePathname (client-side, reactive to route changes) rather
// than a server-computed pathname — this button lives in the root layout,
// which Next.js does not re-render on client-side <Link> navigation, so a
// server-side check would only ever reflect the pathname at the last full
// page load.
export function UploadSopButton({ isEmployee }: { isEmployee: boolean }) {
  const pathname = usePathname();

  if (!isEmployee || pathname === "/") {
    return null;
  }

  return (
    <Link
      href="/sops/new"
      className="mr-4 mt-1 font-bold hover:underline dark:text-zinc-50"
    >
      Upload new SOP
    </Link>
  );
}
