"use client";

import { useEffect, useRef, useState } from "react";
import { renderAsync } from "docx-preview";

// Renders the original .docx in the browser (via docx-preview), rather than
// a server-side HTML/PDF conversion — no extra server dependency, and it's
// always rendering the exact bytes that were uploaded.
export function DocxViewer({ src }: { src: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      const container = containerRef.current;
      if (!container) return;
      setError(null);
      try {
        const response = await fetch(src);
        if (!response.ok) {
          throw new Error(`Failed to load document (${response.status})`);
        }
        const blob = await response.blob();
        if (cancelled || !containerRef.current) return;
        containerRef.current.innerHTML = "";
        await renderAsync(blob, containerRef.current, undefined, {
          inWrapper: false,
          ignoreWidth: false,
          ignoreHeight: true,
        });
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to render document",
          );
        }
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <div className="overflow-auto rounded border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : (
        <div ref={containerRef} />
      )}
    </div>
  );
}
