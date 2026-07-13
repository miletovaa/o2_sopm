"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AnalysisTypeFields,
  inputClass,
  type AnalysisTypeNode,
} from "@/components/AnalysisTypeFields";
import { ReferenceMaterialSelect } from "@/components/ReferenceMaterialSelect";

export function EditSopForm({
  sopId,
  sopTitle,
  analysisTypes,
  foodCategories,
  instruments,
  referenceMaterials,
  initialTitle,
  initialAnalysisTypeLevel1,
  initialAnalysisTypeLevel2,
  initialAnalysisTypeLevel3,
  initialFoodCategory,
  initialInstrument,
  initialReferenceMaterialIds,
}: {
  sopId: string;
  sopTitle: string;
  analysisTypes: AnalysisTypeNode[];
  foodCategories: string[];
  instruments: string[];
  referenceMaterials: { id: string; name: string }[];
  initialTitle: string;
  initialAnalysisTypeLevel1: string;
  initialAnalysisTypeLevel2: string;
  initialAnalysisTypeLevel3: string;
  initialFoodCategory: string;
  initialInstrument: string;
  initialReferenceMaterialIds: string[];
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete() {
    if (
      !confirm(
        `Delete "${sopTitle}" permanently? This removes every version and file. This cannot be undone.`,
      )
    ) {
      return;
    }
    setIsDeleting(true);
    setDeleteError(null);
    const response = await fetch(`/api/sops/${sopId}`, { method: "DELETE" });
    if (response.ok) {
      router.push("/");
    } else {
      const body = await response.json().catch(() => ({}));
      setDeleteError(body.error ?? "Failed to delete SOP.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        action={`/api/sops/${sopId}`}
        method="post"
        className="flex flex-col gap-4"
      >
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          Title
          <input
            name="title"
            type="text"
            required
            defaultValue={initialTitle}
            className={inputClass}
          />
        </label>

        <AnalysisTypeFields
          analysisTypes={analysisTypes}
          initialLevel1={initialAnalysisTypeLevel1}
          initialLevel2={initialAnalysisTypeLevel2}
          initialLevel3={initialAnalysisTypeLevel3}
        />

        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          Category
          <input
            name="foodCategory"
            type="text"
            list="food-category-options"
            required
            defaultValue={initialFoodCategory}
            className={inputClass}
          />
          <datalist id="food-category-options">
            {foodCategories.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          Instrument (optional)
          <input
            name="instrument"
            type="text"
            list="instrument-options"
            defaultValue={initialInstrument}
            className={inputClass}
          />
          <datalist id="instrument-options">
            {instruments.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </label>

        <ReferenceMaterialSelect
          referenceMaterials={referenceMaterials}
          initialSelectedIds={initialReferenceMaterialIds}
        />

        <button
          type="submit"
          className="mt-2 self-start rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Save changes
        </button>
      </form>

      <div className="flex flex-col gap-2 rounded border border-red-200 p-3 dark:border-red-900">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Deleting removes this SOP, all of its versions, and the underlying
          files. This cannot be undone.
        </p>
        {deleteError && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {deleteError}
          </p>
        )}
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="self-start rounded border border-red-600 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-950"
        >
          {isDeleting ? "Deleting…" : "Delete SOP"}
        </button>
      </div>
    </div>
  );
}
