import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { Prisma } from "@/generated/prisma/client";

type SopWithRelations = Prisma.SopGetPayload<{
  include: { analysisType: true; foodCategory: true; versions: true };
}>;

function groupByAnalysisAndFood(sops: SopWithRelations[]) {
  const grouped = new Map<string, Map<string, SopWithRelations[]>>();
  for (const sop of sops) {
    const analysisName = sop.analysisType.name;
    const foodName = sop.foodCategory.name;
    if (!grouped.has(analysisName)) grouped.set(analysisName, new Map());
    const foodMap = grouped.get(analysisName)!;
    if (!foodMap.has(foodName)) foodMap.set(foodName, []);
    foodMap.get(foodName)!.push(sop);
  }
  return grouped;
}

function SopTree({ sops }: { sops: SopWithRelations[] }) {
  const grouped = groupByAnalysisAndFood(sops);
  return (
    <div className="flex flex-col gap-2">
      {[...grouped.entries()].map(([analysisName, foodMap]) => (
        <details
          key={analysisName}
          open
          className="rounded border border-black/10 dark:border-white/10"
        >
          <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium text-black dark:text-zinc-50">
            {analysisName}
          </summary>
          <div className="flex flex-col gap-1 px-3 pb-3 pl-5">
            {[...foodMap.entries()].map(([foodName, sopsForFood]) => (
              <details
                key={foodName}
                open
                className="rounded border border-black/5 dark:border-white/5"
              >
                <summary className="cursor-pointer select-none px-2 py-1 text-sm text-zinc-700 dark:text-zinc-300">
                  {foodName}
                </summary>
                <ul className="flex flex-col gap-1 py-1 pl-5">
                  {sopsForFood.map((sop) => (
                    <li key={sop.id}>
                      <Link
                        href={`/sops/${sop.id}`}
                        className="text-sm text-black hover:underline dark:text-zinc-50"
                      >
                        {sop.title}
                      </Link>
                      <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                        v{sop.versions[0]?.versionNumber ?? "-"}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

function SopList({ sops }: { sops: SopWithRelations[] }) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-black/10 text-xs uppercase text-zinc-500 dark:border-white/10 dark:text-zinc-400">
          <th className="py-2 pr-4">Title</th>
          <th className="py-2 pr-4">Analysis type</th>
          <th className="py-2 pr-4">Food category</th>
          <th className="py-2 pr-4">Version</th>
          <th className="py-2">Last updated</th>
        </tr>
      </thead>
      <tbody>
        {sops.map((sop) => {
          const current = sop.versions[0];
          return (
            <tr
              key={sop.id}
              className="border-b border-black/5 dark:border-white/5"
            >
              <td className="py-2 pr-4">
                <Link
                  href={`/sops/${sop.id}`}
                  className="font-medium text-black hover:underline dark:text-zinc-50"
                >
                  {sop.title}
                </Link>
              </td>
              <td className="py-2 pr-4 text-zinc-700 dark:text-zinc-300">
                {sop.analysisType.name}
              </td>
              <td className="py-2 pr-4 text-zinc-700 dark:text-zinc-300">
                {sop.foodCategory.name}
              </td>
              <td className="py-2 pr-4 text-zinc-700 dark:text-zinc-300">
                {current ? `v${current.versionNumber}` : "-"}
              </td>
              <td className="py-2 text-zinc-700 dark:text-zinc-300">
                {current ? current.uploadedAt.toLocaleDateString() : "-"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view: viewParam } = await searchParams;
  const view = viewParam === "list" ? "list" : "tree";

  const [session, sops] = await Promise.all([
    auth(),
    prisma.sop.findMany({
      include: {
        analysisType: true,
        foodCategory: true,
        versions: { orderBy: { versionNumber: "desc" }, take: 1 },
      },
      orderBy: [
        { analysisType: { name: "asc" } },
        { foodCategory: { name: "asc" } },
        { title: "asc" },
      ],
    }),
  ]);

  const isEmployee = session?.user?.role === "EMPLOYEE";

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          Standard Operating Procedures
        </h1>
        {isEmployee && (
          <Link
            href="/sops/new"
            className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Upload new SOP
          </Link>
        )}
      </div>

      <div className="flex gap-2 text-sm">
        <Link
          href="/?view=tree"
          className={`rounded px-3 py-1 ${
            view === "tree"
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "border border-black/10 text-zinc-700 dark:border-white/10 dark:text-zinc-300"
          }`}
        >
          Tree view
        </Link>
        <Link
          href="/?view=list"
          className={`rounded px-3 py-1 ${
            view === "list"
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "border border-black/10 text-zinc-700 dark:border-white/10 dark:text-zinc-300"
          }`}
        >
          List view
        </Link>
      </div>

      {sops.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No SOPs have been uploaded yet.
        </p>
      ) : view === "tree" ? (
        <SopTree sops={sops} />
      ) : (
        <SopList sops={sops} />
      )}
    </div>
  );
}
