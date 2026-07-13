// HTTP header values must be Latin-1 (ISO-8859-1) bytes — filenames with
// non-ASCII characters (e.g. "REFERENČNI MATERIAL.xlsx") throw at the
// runtime level ("Cannot convert argument to a ByteString") if used directly
// in `filename="..."`. RFC 6266 / RFC 5987 fix this with a UTF-8-encoded
// `filename*` parameter alongside an ASCII-only `filename` fallback for
// older clients.
export function contentDisposition(
  type: "attachment" | "inline",
  filename: string,
): string {
  const asciiFallback = filename.replace(/[^\x20-\x7e]/g, "_").replace(/"/g, "'");
  return `${type}; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}
