import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { Prisma } from "@/generated/prisma/client";
import { GroupBySelect } from "@/components/GroupBySelect";
import { FoldTreeButton, TREE_CONTAINER_ID } from "@/components/FoldTreeButton";
import { SearchInput } from "@/components/SearchInput";
import { canManageContent } from "@/lib/roles";

type SopWithRelations = Prisma.SopGetPayload<{
  include: {
    analysisType: { include: { parent: { include: { parent: true } } } };
    foodCategory: true;
    instrument: true;
    versions: { include: { uploadedBy: { select: { username: true } } } };
  };
}>;

type TreeGroupBy = "analysisType" | "foodCategory" | "instrument";
type ListSort = "date-asc" | "date-desc";

function sortedEntries<V>(map: Map<string, V>) {
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

// Walks up to the root (up to 3 levels: e.g. Isotope Analysis > BSIA > CN).
function analysisTypePath(
  analysisType: SopWithRelations["analysisType"],
): string[] {
  const path: string[] = [];
  if (analysisType.parent?.parent) path.push(analysisType.parent.parent.name);
  if (analysisType.parent) path.push(analysisType.parent.name);
  path.push(analysisType.name);
  return path;
}

function pathForGroupBy(sop: SopWithRelations, groupBy: TreeGroupBy): string[] {
  switch (groupBy) {
    case "foodCategory":
      return [sop.foodCategory.name, ...analysisTypePath(sop.analysisType)];
    case "instrument":
      return [sop.instrument?.name ?? "No instrument specified"];
    case "analysisType":
    default:
      return [...analysisTypePath(sop.analysisType), sop.foodCategory.name];
  }
}

function matchesQuery(sop: SopWithRelations, query: string): boolean {
  const haystack = [
    sop.title,
    ...analysisTypePath(sop.analysisType),
    sop.foodCategory.name,
    sop.instrument?.name ?? "",
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

type TreeNode = {
  children: Map<string, TreeNode>;
  sops: SopWithRelations[];
};

function buildTree(
  sops: SopWithRelations[],
  pathFor: (sop: SopWithRelations) => string[],
): TreeNode {
  const root: TreeNode = { children: new Map(), sops: [] };
  for (const sop of sops) {
    let node = root;
    for (const segment of pathFor(sop)) {
      if (!node.children.has(segment)) {
        node.children.set(segment, { children: new Map(), sops: [] });
      }
      node = node.children.get(segment)!;
    }
    node.sops.push(sop);
  }
  return root;
}

function TreeNodeView({ node }: { node: TreeNode }) {
  return (
    <div className="flex flex-col gap-1">
      {sortedEntries(node.children).map(([label, child]) => (
        <details
          key={label}
          open
          className="rounded border border-black/10 dark:border-white/10"
        >
          <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium text-black dark:text-zinc-50">
            {label}
          </summary>
          <div className="flex flex-col gap-1 px-3 pb-3 pl-10">
            <TreeNodeView node={child} />
          </div>
        </details>
      ))}
      {node.sops.length > 0 && (
        <ul className="flex flex-col gap-1 py-1 pl-10">
          {node.sops.map((sop) => (
            <li key={sop.id}>
              <Link
                href={`/sops/${sop.id}`}
                className="text-sm text-heading hover:underline"
              >
                {sop.title}
              </Link>
              <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                v{sop.versions[0]?.versionNumber ?? "-"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SopList({
  sops,
  sort,
  querySuffix,
}: {
  sops: SopWithRelations[];
  sort: ListSort;
  querySuffix: string;
}) {
  const nextSort: ListSort = sort === "date-desc" ? "date-asc" : "date-desc";
  const sorted = [...sops].sort((a, b) => {
    const aTime = a.versions[0]?.uploadedAt.getTime() ?? 0;
    const bTime = b.versions[0]?.uploadedAt.getTime() ?? 0;
    return sort === "date-asc" ? aTime - bTime : bTime - aTime;
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead>
          <tr className="border-b border-black/10 text-xs uppercase text-zinc-500 dark:border-white/10 dark:text-zinc-400">
            <th className="py-2 pr-4">Title</th>
            <th className="py-2 pr-4">Experiment type</th>
            <th className="py-2 pr-4">category</th>
            <th className="py-2 pr-4">Instrument</th>
            <th className="py-2 pr-4">Version</th>
            <th className="py-2 pr-4">
              <Link
                href={`/?view=list&sort=${nextSort}${querySuffix}`}
                className="inline-flex items-center gap-1 hover:underline"
              >
                Last&nbsp;updated&nbsp;{sort === "date-desc" ? "▼" : "▲"}
              </Link>
            </th>
            <th className="py-2">Updated&nbsp;by</th>
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
                    className="font-medium text-heading hover:underline"
                  >
                    {sop.title}
                  </Link>
                </td>
                <td className="py-2 pr-4 text-zinc-700 dark:text-zinc-300">
                  {analysisTypePath(sop.analysisType).join(" > ")}
                </td>
                <td className="py-2 pr-4 text-zinc-700 dark:text-zinc-300">
                  {sop.foodCategory.name}
                </td>
                <td className="py-2 pr-4 text-zinc-700 dark:text-zinc-300">
                  {sop.instrument?.name ?? "-"}
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
    </div>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string;
    groupBy?: string;
    sort?: string;
    q?: string;
  }>;
}) {
  const {
    view: viewParam,
    groupBy: groupByParam,
    sort: sortParam,
    q: qParam,
  } = await searchParams;
  const view = viewParam === "list" ? "list" : "tree";
  const groupBy: TreeGroupBy =
    groupByParam === "foodCategory" || groupByParam === "instrument"
      ? groupByParam
      : "analysisType";
  const sort: ListSort = sortParam === "date-asc" ? "date-asc" : "date-desc";
  const q = (qParam ?? "").trim();
  const querySuffix = q ? `&q=${encodeURIComponent(q)}` : "";

  const [session, allSops] = await Promise.all([
    auth(),
    prisma.sop.findMany({
      include: {
        analysisType: { include: { parent: { include: { parent: true } } } },
        foodCategory: true,
        instrument: true,
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

  const isEmployee = canManageContent(session?.user?.role);
  const normalizedQuery = q.toLowerCase();
  const sops = normalizedQuery
    ? allSops.filter((sop) => matchesQuery(sop, normalizedQuery))
    : allSops;

  return (
    <div className="mx-auto my-8 flex w-full max-w-5xl flex-1 flex-col gap-4 px-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-heading">
          Standard Operating Procedures
        </h1>
        {isEmployee && (
          <Link
            href="/sops/new"
            className="rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          >
            Upload new SOP
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-6 rounded-lg bg-white p-6 shadow-sm sm:p-8 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2 text-sm">
            <Link
              href={`/?view=tree${querySuffix}`}
              className={`rounded px-3 py-1 ${
                view === "tree"
                  ? "bg-accent text-white"
                  : "border border-black/10 text-zinc-700 dark:border-white/10 dark:text-zinc-300"
              }`}
            >
              Tree view
            </Link>
            <Link
              href={`/?view=list${querySuffix}`}
              className={`rounded px-3 py-1 ${
                view === "list"
                  ? "bg-accent text-white"
                  : "border border-black/10 text-zinc-700 dark:border-white/10 dark:text-zinc-300"
              }`}
            >
              List view
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <SearchInput defaultValue={q} />
            {view === "tree" && (
              <>
                <GroupBySelect value={groupBy} />
                <FoldTreeButton />
              </>
            )}
          </div>
        </div>

        {sops.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {allSops.length === 0
              ? "No SOPs have been uploaded yet."
              : "No SOPs match your search."}
          </p>
        ) : view === "tree" ? (
          <div id={TREE_CONTAINER_ID}>
            <TreeNodeView
              node={buildTree(sops, (sop) => pathForGroupBy(sop, groupBy))}
            />
          </div>
        ) : (
          <SopList sops={sops} sort={sort} querySuffix={querySuffix} />
        )}
      </div>
    </div>
  );
}
