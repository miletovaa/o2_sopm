"use client";

import { useState } from "react";
import { inputClass } from "@/components/AnalysisTypeFields";

export type TagOption = { id: string; label: string };

// Click an option to add it as a tag; click the × on a tag to remove it.
// Submits as multiple hidden inputs sharing `name`, so the server side reads
// it the same way as a native <select multiple> (formData.getAll(name)).
export function TagMultiSelect({
  name,
  options,
  initialSelectedIds = [],
  placeholder = "+ Add…",
}: {
  name: string;
  options: TagOption[];
  initialSelectedIds?: string[];
  placeholder?: string;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);

  const selectedOptions = selectedIds
    .map((id) => options.find((option) => option.id === id))
    .filter((option): option is TagOption => Boolean(option));
  const availableOptions = options.filter(
    (option) => !selectedIds.includes(option.id),
  );

  function addOption(id: string) {
    if (id && !selectedIds.includes(id)) {
      setSelectedIds((prev) => [...prev, id]);
    }
  }

  function removeOption(id: string) {
    setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
  }

  return (
    <div className="flex flex-col gap-2">
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <span
              key={option.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-zinc-200 py-1 pl-3 pr-2 text-xs text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100"
            >
              {option.label}
              <button
                type="button"
                onClick={() => removeOption(option.id)}
                aria-label={`Remove ${option.label}`}
                className="rounded-full text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                ×
              </button>
              <input type="hidden" name={name} value={option.id} />
            </span>
          ))}
        </div>
      )}

      {availableOptions.length > 0 && (
        <select
          value=""
          onChange={(event) => addOption(event.target.value)}
          className={inputClass}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {availableOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
