"use client";

import { useEffect, useRef, useState } from "react";
import { renderAsync } from "docx-preview";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.1;

// Renders the original .docx in the browser (via docx-preview), rather than
// a server-side HTML/PDF conversion — no extra server dependency, and it's
// always rendering the exact bytes that were uploaded.
export function DocxViewer({ src }: { src: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

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
    setZoom(1);
    return () => {
      cancelled = true;
    };
  }, [src]);

  function zoomOut() {
    setZoom((z) => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2)));
  }

  function zoomIn() {
    setZoom((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2)));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-end gap-1 text-xs text-zinc-600 dark:text-zinc-400">
        <button
          type="button"
          onClick={zoomOut}
          disabled={zoom <= MIN_ZOOM}
          aria-label="Zoom out"
          className="rounded border border-black/10 px-2 py-1 hover:bg-black/5 disabled:opacity-40 dark:border-white/10 dark:hover:bg-white/10"
        >
          −
        </button>
        <button
          type="button"
          onClick={() => setZoom(1)}
          aria-label="Reset zoom"
          className="w-14 rounded border border-black/10 px-2 py-1 text-center hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          onClick={zoomIn}
          disabled={zoom >= MAX_ZOOM}
          aria-label="Zoom in"
          className="rounded border border-black/10 px-2 py-1 hover:bg-black/5 disabled:opacity-40 dark:border-white/10 dark:hover:bg-white/10"
        >
          +
        </button>
      </div>

      {/*
        Deliberately always a white "page", regardless of site theme: the
        document's own text color comes from the .docx (assumes a white page,
        same as Word/Google Docs/PDF viewers do) — a dark container here would
        make black document text unreadable. Fixed height + overflow-auto
        gives a bounded, scrollable frame like a browser's native PDF viewer;
        the zoom buttons scale the rendered content via CSS transform, which
        overflow-auto accounts for automatically.
      */}
      <div className="h-[75vh] overflow-auto rounded border border-black/10 bg-white text-black dark:border-white/10">
        {error ? (
          <p className="p-6 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : (
          <div
            ref={containerRef}
            className="p-6"
            style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
          />
        )}
      </div>
    </div>
  );
}
