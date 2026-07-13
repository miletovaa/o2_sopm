"use client";

import { useRef, useState } from "react";
import { inputClass } from "@/components/AnalysisTypeFields";
import { TagMultiSelect } from "@/components/TagMultiSelect";

function stripExtension(filename: string): string {
  return filename.replace(/\.[^./\\]+$/, "");
}

export function NewReferenceMaterialForm({
  sops,
}: {
  sops: { id: string; title: string }[];
}) {
  const [name, setName] = useState("");
  const isNameAutoFilled = useRef(true);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file && isNameAutoFilled.current) {
      setName(stripExtension(file.name));
    }
  }

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    isNameAutoFilled.current = false;
    setName(event.target.value);
  }

  return (
    <form
      action="/api/reference-materials"
      method="post"
      encType="multipart/form-data"
      className="flex flex-col gap-4"
    >
      <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
        Name
        <input
          name="name"
          type="text"
          required
          value={name}
          onChange={handleNameChange}
          className={inputClass}
        />
        <span className="text-xs text-zinc-500">
          Defaults to the file name — edit freely.
        </span>
      </label>

      <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
        File (any type — PDF, Word, Excel, etc.)
        <input
          name="file"
          type="file"
          required
          onChange={handleFileChange}
          className={inputClass}
        />
      </label>

      <div className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
        Attach to SOPs (optional)
        <TagMultiSelect
          name="sopIds"
          options={sops.map((sop) => ({ id: sop.id, label: sop.title }))}
          placeholder="+ Add SOP…"
        />
        <span className="text-xs text-zinc-500">
          Can also be attached later from each SOP&rsquo;s edit page.
        </span>
      </div>

      <button
        type="submit"
        className="mt-2 self-start rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
      >
        Upload
      </button>
    </form>
  );
}
