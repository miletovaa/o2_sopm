// A plain <iframe> pointed at a PDF is rendered by the browser's own native
// PDF viewer (Chrome/Firefox/Safari/Edge all ship one) — zoom, scroll,
// pagination, text search, and print all come for free and are
// pixel-accurate to the original document, unlike reflowing a .docx into
// custom HTML.
export function PdfViewer({ src }: { src: string }) {
  return (
    <iframe
      src={src}
      title="SOP document"
      className="h-[80vh] w-full rounded border border-black/10 bg-white dark:border-white/10"
    />
  );
}
