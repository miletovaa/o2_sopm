import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { SafetyMaterialRow } from "@/components/SafetyMaterialRow";

export default async function SafetyMaterialsPage() {
  const [session, safetyMaterials] = await Promise.all([
    auth(),
    prisma.safetyMaterial.findMany({ orderBy: { name: "asc" } }),
  ]);

  const isEmployee = session?.user?.role === "EMPLOYEE";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          Safety materials
        </h1>
        {isEmployee && (
          <Link
            href="/safety-materials/new"
            className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Upload new safety material
          </Link>
        )}
      </div>

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
  );
}
