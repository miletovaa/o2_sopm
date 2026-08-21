import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { SafetyMaterialRow } from "@/components/SafetyMaterialRow";
import { canManageContent } from "@/lib/roles";

export default async function SafetyMaterialsPage() {
  const [session, safetyMaterials] = await Promise.all([
    auth(),
    prisma.safetyMaterial.findMany({ orderBy: { name: "asc" } }),
  ]);

  const isEmployee = canManageContent(session?.user?.role);

  return (
    <div className="mx-auto my-8 flex w-full max-w-5xl flex-1 flex-col gap-4 px-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-heading">
          Safety materials
        </h1>
        {isEmployee && (
          <Link
            href="/safety-materials/new"
            className="rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          >
            Upload new safety material
          </Link>
        )}
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm sm:p-8 dark:bg-zinc-900">
        {safetyMaterials.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No safety materials have been uploaded yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {safetyMaterials.map((material) => (
              <li
                key={material.id}
                className="flex items-center justify-between rounded border border-black/10 px-3 py-2 dark:border-white/10"
              >
                <span className="text-sm text-black dark:text-zinc-50">
                  {material.name}
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={`/api/safety-materials/${material.id}/file`}
                    className="rounded border border-black/10 px-3 py-1 text-xs font-medium text-black hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/10"
                  >
                    Download
                  </a>
                  {isEmployee && (
                    <SafetyMaterialRow id={material.id} name={material.name} />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
