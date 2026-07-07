import mammoth from "mammoth";

// Only plain text is extracted server-side (for future full-text search).
// The document itself is rendered client-side from the original .docx via
// docx-preview, so no HTML conversion is needed here.
export async function extractDocxText(buffer: Buffer): Promise<string> {
  const { value } = await mammoth.extractRawText({ buffer });
  return value;
}
