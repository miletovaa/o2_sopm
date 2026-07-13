"use client";

import { useState } from "react";

const TREE_CONTAINER_ID = "sop-tree";

export { TREE_CONTAINER_ID };

export function FoldTreeButton() {
  const [isFolded, setIsFolded] = useState(false);

  function handleClick() {
    const nextFolded = !isFolded;
    document
      .querySelectorAll<HTMLDetailsElement>(`#${TREE_CONTAINER_ID} details`)
      .forEach((details) => {
        details.open = !nextFolded;
      });
    setIsFolded(nextFolded);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded border border-black/10 px-3 py-1 text-xs text-zinc-700 hover:bg-black/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10"
    >
      {isFolded ? "Unfold all" : "Fold all"}
    </button>
  );
}
