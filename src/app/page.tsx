import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { Prisma } from "@/generated/prisma/client";

type SopWithRelations = Prisma.SopGetPayload<{
  include: {
    analysisType: true;
    foodCategory: true;
    versions: { include: { uploadedBy: { select: { username: true } } } };
  };
}>;

type TreeGroupBy = "analysisType" | "foodCategory";
type ListSort = "date-asc" | "date-desc";

function sortedEntries<V>(map: Map<string, V>) {
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

function groupSops(sops: SopWithRelations[], groupBy: TreeGroupBy) {
  const outerKey = (sop: SopWithRelations) =>
    groupBy === "foodCategory" ? sop.foodCategory.name : sop.analysisType.name;
  const innerKey = (sop: SopWithRelations) =>
    groupBy === "foodCategory" ? sop.analysisType.name : sop.foodCategory.name;

  const grouped = new Map<string, Map<string, SopWithRelations[]>>();
  for (const sop of sops) {
    const outer = outerKey(sop);
    const inner = innerKey(sop);
    if (!grouped.has(outer)) grouped.set(outer, new Map());
    const innerMap = grouped.get(outer)!;
    if (!innerMap.has(inner)) innerMap.set(inner, []);
    innerMap.get(inner)!.push(sop);
  }
  return grouped;
}

function SopTree({
  sops,
  groupBy,
}: {
  sops: SopWithRelations[];
  groupBy: TreeGroupBy;
}) {
  const grouped = groupSops(sops, groupBy);
  return (
    <div className="flex flex-col gap-2">
      {sortedEntries(grouped).map(([outerName, innerMap]) => (
        <details
          key={outerName}
          open
          className="rounded border border-black/10 dark:border-white/10"
        >
          <summary className="cursor-pointer select-none px-3 py-2 text-sm font-bold text-black dark:text-zinc-50">
            {outerName}
          </summary>
          <div className="flex flex-col gap-1 px-3 pb-3 pl-10">
            {sortedEntries(innerMap).map(([innerName, sopsForGroup]) => (
              <details
                key={innerName}
                open
                className="rounded border border-black/5 dark:border-white/5"
              >
                <summary className="cursor-pointer select-none px-2 py-1 text-sm text-zinc-700 dark:text-zinc-300">
                  {innerName}
                </summary>
                <ul className="flex flex-col gap-1 py-1 pl-10">
                  {sopsForGroup.map((sop) => (
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

function SopList({ sops, sort }: { sops: SopWithRelations[]; sort: ListSort }) {
  const nextSort: ListSort = sort === "date-desc" ? "date-asc" : "date-desc";
  const sorted = [...sops].sort((a, b) => {
    const aTime = a.versions[0]?.uploadedAt.getTime() ?? 0;
    const bTime = b.versions[0]?.uploadedAt.getTime() ?? 0;
    return sort === "date-asc" ? aTime - bTime : bTime - aTime;
  });

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-black/10 text-xs uppercase text-zinc-500 dark:border-white/10 dark:text-zinc-400">
          <th className="py-2 pr-4">Title</th>
          <th className="py-2 pr-4">Analysis type</th>
          <th className="py-2 pr-4">Food category</th>
          <th className="py-2 pr-4">Version</th>
          <th className="py-2 pr-4">
            <Link
              href={`/?view=list&sort=${nextSort}`}
              className="inline-flex items-center gap-1 hover:underline"
            >
              Last updated {sort === "date-desc" ? "▼" : "▲"}
            </Link>
          </th>
          <th className="py-2">Updated by</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((sop) => {
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
              <td className="py-2 pr-4 text-zinc-700 dark:text-zinc-300">
                {current ? current.uploadedAt.toLocaleDateString() : "-"}
              </td>
              <td className="py-2 text-zinc-700 dark:text-zinc-300">
                {current?.uploadedBy.username ?? "-"}
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
  searchParams: Promise<{ view?: string; groupBy?: string; sort?: string }>;
}) {
  const {
    view: viewParam,
    groupBy: groupByParam,
    sort: sortParam,
  } = await searchParams;
  const view = viewParam === "list" ? "list" : "tree";
  const groupBy: TreeGroupBy =
    groupByParam === "foodCategory" ? "foodCategory" : "analysisType";
  const sort: ListSort = sortParam === "date-asc" ? "date-asc" : "date-desc";

  const [session, sops] = await Promise.all([
    auth(),
    prisma.sop.findMany({
      include: {
        analysisType: true,
        foodCategory: true,
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
          include: { uploadedBy: { select: { username: true } } },
        },
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

      <div className="flex flex-wrap items-center justify-between gap-2">
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

        {view === "tree" && (
          <div className="flex gap-2 text-xs">
            <Link
              href="/?view=tree&groupBy=analysisType"
              className={`rounded px-2 py-1 ${
                groupBy === "analysisType"
                  ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black"
                  : "border border-black/10 text-zinc-600 dark:border-white/10 dark:text-zinc-400"
              }`}
            >
              By analysis type
            </Link>
            <Link
              href="/?view=tree&groupBy=foodCategory"
              className={`rounded px-2 py-1 ${
                groupBy === "foodCategory"
                  ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black"
                  : "border border-black/10 text-zinc-600 dark:border-white/10 dark:text-zinc-400"
              }`}
            >
              By food category
            </Link>
          </div>
        )}
      </div>

      {sops.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No SOPs have been uploaded yet.
        </p>
      ) : view === "tree" ? (
        <SopTree sops={sops} groupBy={groupBy} />
      ) : (
        <SopList sops={sops} sort={sort} />
      )}
    </div>
  );
}
