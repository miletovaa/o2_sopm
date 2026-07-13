import { TagMultiSelect } from "@/components/TagMultiSelect";

export function ReferenceMaterialSelect({
  referenceMaterials,
  initialSelectedIds = [],
}: {
  referenceMaterials: { id: string; name: string }[];
  initialSelectedIds?: string[];
}) {
  if (referenceMaterials.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
      Reference materials (optional)
      <TagMultiSelect
        name="referenceMaterialIds"
        options={referenceMaterials.map((material) => ({
          id: material.id,
          label: material.name,
        }))}
        initialSelectedIds={initialSelectedIds}
        placeholder="+ Add reference material…"
      />
    </div>
  );
}
