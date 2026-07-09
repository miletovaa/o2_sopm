"use client";

import { useRef, useState } from "react";

function stripExtension(filename: string): string {
  return filename.replace(/\.[^./\\]+$/, "");
}

export function NewSopForm({
  analysisTypes,
  foodCategories,
}: {
  analysisTypes: string[];
  foodCategories: string[];
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
          className="rounded border border-black/10 bg-transparent px-3 py-2 text-black outline-none focus:border-black/40 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/40"
        />
        <span className="text-xs text-zinc-500">
          Defaults to the file name — edit freely.
        </span>
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
        Analysis type
        <input
          name="analysisType"
          type="text"
          list="analysis-type-options"
          required
          placeholder="e.g. Isotope Analysis"
          className="rounded border border-black/10 bg-transparent px-3 py-2 text-black outline-none focus:border-black/40 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/40"
        />
        <datalist id="analysis-type-options">
          {analysisTypes.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <span className="text-xs text-zinc-500">
          Pick an existing type or type a new one to create it.
        </span>
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
        Category
        <input
          name="foodCategory"
          type="text"
          list="food-category-options"
          required
          placeholder="e.g. Meat"
          className="rounded border border-black/10 bg-transparent px-3 py-2 text-black outline-none focus:border-black/40 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/40"
        />
        <datalist id="food-category-options" className="border-none">
          {foodCategories.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <span className="text-xs text-zinc-500">
          Pick an existing category or type a new one to create it.
        </span>
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
        Word document (.docx)
        <input
          name="file"
          type="file"
          accept=".docx"
          required
          onChange={handleFileChange}
          className="rounded border border-black/10 bg-transparent px-3 py-2 text-black outline-none focus:border-black/40 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/40"
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
