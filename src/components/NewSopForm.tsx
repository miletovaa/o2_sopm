"use client";

import { useRef, useState } from "react";
import {
  AnalysisTypeFields,
  inputClass,
  type AnalysisTypeNode,
} from "@/components/AnalysisTypeFields";
import { ReferenceMaterialSelect } from "@/components/ReferenceMaterialSelect";

export type { AnalysisTypeNode };

function stripExtension(filename: string): string {
  return filename.replace(/\.[^./\\]+$/, "");
}

export function NewSopForm({
  analysisTypes,
  foodCategories,
  instruments,
  referenceMaterials,
}: {
  analysisTypes: AnalysisTypeNode[];
  foodCategories: string[];
  instruments: string[];
  referenceMaterials: { id: string; name: string }[];
}) {
  const [title, setTitle] = useState("");
  // Tracks whether the title is still the auto-derived one, so picking a
  // file fills it in, but once the user types their own title we stop
  // overwriting it on subsequent file changes.
  const isTitleAutoFilled = useRef(true);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file && isTitleAutoFilled.current) {
      setTitle(stripExtension(file.name));
    }
  }

  function handleTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
    isTitleAutoFilled.current = false;
    setTitle(event.target.value);
  }

  return (
    <form
      action="/api/sops"
      method="post"
      encType="multipart/form-data"
      className="flex flex-col gap-4"
    >
      <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
        Title
        <input
          name="title"
          type="text"
          required
          value={title}
          onChange={handleTitleChange}
          className={inputClass}
        />
        <span className="text-xs text-zinc-500">
          Defaults to the file name — edit freely.
        </span>
      </label>

      <AnalysisTypeFields analysisTypes={analysisTypes} />

      <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
        Category
        <input
          name="foodCategory"
          type="text"
          list="food-category-options"
          required
          placeholder="e.g. Meat"
          className={inputClass}
        />
        <datalist id="food-category-options">
          {foodCategories.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <span className="text-xs text-zinc-500">
          Pick an existing category or type a new one to create it.
        </span>
      </label>

      <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
        Instrument (optional)
        <input
          name="instrument"
          type="text"
          list="instrument-options"
          placeholder="e.g. IRMS"
          className={inputClass}
        />
        <datalist id="instrument-options">
          {instruments.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <span className="text-xs text-zinc-500">
          Pick an existing instrument or type a new one to create it.
        </span>
      </label>

      <ReferenceMaterialSelect referenceMaterials={referenceMaterials} />

      <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
        Word document (.docx)
        <input
          name="file"
          type="file"
          accept=".docx"
          required
          onChange={handleFileChange}
          className={inputClass}
        />
      </label>
      <button
        type="submit"
        className="mt-2 rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        Upload
      </button>
    </form>
  );
}
