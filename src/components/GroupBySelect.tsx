"use client";

import { useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { value: "analysisType", label: "By experiment type" },
  { value: "foodCategory", label: "By category" },
  { value: "instrument", label: "By instrument" },
];

export function GroupBySelect({ value }: { value: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <select
      value={value}
      onChange={(event) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("view", "tree");
        params.set("groupBy", event.target.value);
        router.push(`/?${params.toString()}`);
      }}
      className="rounded border border-black/10 bg-transparent px-2 py-1 text-xs text-zinc-700 dark:border-white/10 dark:text-zinc-300"
    >
      {OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
