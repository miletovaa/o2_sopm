import type { AnalysisTypeNode } from "@/components/AnalysisTypeFields";

export function buildAnalysisTypeTree(
  flat: { id: string; name: string; parentId: string | null }[],
): AnalysisTypeNode[] {
  const nodesById = new Map<string, AnalysisTypeNode>(
    flat.map((row) => [row.id, { name: row.name, children: [] }]),
  );
  const roots: AnalysisTypeNode[] = [];

  for (const row of flat) {
    const node = nodesById.get(row.id)!;
    if (row.parentId) {
      nodesById.get(row.parentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
