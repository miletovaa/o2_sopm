"use client";

import { useState } from "react";

export type AnalysisTypeNode = {
  name: string;
  children: AnalysisTypeNode[];
};

export const inputClass =
  "rounded border border-black/10 bg-transparent px-3 py-2 text-black outline-none focus:border-black/40 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/40";

// Progressive-disclosure picker for the (up to 3-level) Analysis Type
// hierarchy, e.g. Isotope Analysis > BSIA > CN. Used by both the new-SOP
// form and the edit-SOP form (initial values differ; the picker logic is
// identical).
export function AnalysisTypeFields({
  analysisTypes,
  initialLevel1 = "",
  initialLevel2 = "",
  initialLevel3 = "",
}: {
  analysisTypes: AnalysisTypeNode[];
  initialLevel1?: string;
  initialLevel2?: string;
  initialLevel3?: string;
}) {
  const [level1, setLevel1] = useState(initialLevel1);
  const [level2, setLevel2] = useState(initialLevel2);
  const [level3, setLevel3] = useState(initialLevel3);
  const [showLevel2, setShowLevel2] = useState(initialLevel2 !== "");
  const [showLevel3, setShowLevel3] = useState(initialLevel3 !== "");

  const level1Node = analysisTypes.find(
    (n) => n.name.toLowerCase() === level1.trim().toLowerCase(),
  );
  const level2Options = level1Node?.children ?? [];

  const level2Node = level2Options.find(
    (n) => n.name.toLowerCase() === level2.trim().toLowerCase(),
  );
  const level3Options = level2Node?.children ?? [];

  return (
    <div className="flex flex-col gap-2 rounded border border-black/10 p-3 dark:border-white/10">
      <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
        Analysis type
        <input
          name="analysisTypeLevel1"
          type="text"
          list="analysis-type-level1-options"
          required
          value={level1}
          onChange={(e) => setLevel1(e.target.value)}
          placeholder="e.g. Isotope Analysis"
          className={inputClass}
        />
        <datalist id="analysis-type-level1-options">
          {analysisTypes.map((node) => (
            <option key={node.name} value={node.name} />
          ))}
        </datalist>
      </label>

      {showLevel2 ? (
        <label className="flex flex-col gap-1 pl-4 text-sm text-zinc-700 dark:text-zinc-300">
          Subtype
          <input
            name="analysisTypeLevel2"
            type="text"
            list="analysis-type-level2-options"
            value={level2}
            onChange={(e) => setLevel2(e.target.value)}
            placeholder="e.g. BSIA"
            className={inputClass}
          />
          <datalist id="analysis-type-level2-options">
            {level2Options.map((node) => (
              <option key={node.name} value={node.name} />
            ))}
          </datalist>
        </label>
      ) : (
        <button
          type="button"
          onClick={() => setShowLevel2(true)}
          className="self-start text-xs font-medium text-black hover:underline dark:text-zinc-50"
        >
          + Add subtype
        </button>
      )}

      {showLevel2 &&
        (showLevel3 ? (
          <label className="flex flex-col gap-1 pl-8 text-sm text-zinc-700 dark:text-zinc-300">
            Sub-subtype
            <input
              name="analysisTypeLevel3"
              type="text"
              list="analysis-type-level3-options"
              value={level3}
              onChange={(e) => setLevel3(e.target.value)}
              placeholder="e.g. CN"
              className={inputClass}
            />
            <datalist id="analysis-type-level3-options">
              {level3Options.map((node) => (
                <option key={node.name} value={node.name} />
              ))}
            </datalist>
          </label>
        ) : (
          <button
            type="button"
            onClick={() => setShowLevel3(true)}
            className="self-start pl-4 text-xs font-medium text-black hover:underline dark:text-zinc-50"
          >
            + Add subtype
          </button>
        ))}

      <span className="text-xs text-zinc-500">
        Pick an existing type or type a new one to create it. Use &ldquo;+ Add
        subtype&rdquo; for nested types like Isotope Analysis → BSIA → CN.
      </span>
    </div>
  );
}
