"use client";

import { useRouter } from "next/navigation";

const OPTIONS = [
  { value: "analysisType", label: "By experiment type" },
  { value: "foodCategory", label: "By food category" },
  { value: "instrument", label: "By instrument" },
];

export function GroupBySelect({ value }: { value: string }) {
  const router = useRouter();

  return (
    <select
      value={value}
      onChange={(event) => router.push(`/?view=tree&groupBy=${event.target.value}`)}
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
