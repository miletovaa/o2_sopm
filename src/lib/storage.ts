import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const UPLOADS_DIR = process.env.UPLOADS_DIR ?? "./uploads";

// Files are stored under UPLOADS_DIR using a path derived only from the SOP
// id and version number (never from the uploaded filename), so there is no
// user-controlled input in the path and nothing to sanitize against
// traversal. filePath is stored in the DB relative to UPLOADS_DIR so it stays
// valid across environments (dev machine vs. the deployed container).
export async function saveSopVersionFile(
  sopId: string,
  versionNumber: number,
  buffer: Buffer,
): Promise<string> {
  const relativePath = path.join("sops", sopId, `v${versionNumber}.docx`);
  const absolutePath = resolveUploadPath(relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, buffer);
  return relativePath;
}

// Stored as a sibling of the .docx (same id/version, .pdf extension) rather
// than a separate DB column — the path is always derivable from filePath via
// pdfPathFor, so there's nothing extra to keep in sync.
export async function saveSopVersionPdf(
  sopId: string,
  versionNumber: number,
  buffer: Buffer,
): Promise<string> {
  const relativePath = path.join("sops", sopId, `v${versionNumber}.pdf`);
  const absolutePath = resolveUploadPath(relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, buffer);
  return relativePath;
}

export function pdfPathFor(docxRelativePath: string): string {
  return docxRelativePath.replace(/\.docx$/, ".pdf");
}

// Reference materials can be any file type (xlsx, pdf, docx, ...) and are
// never parsed or converted — just stored and served back for download. The
// on-disk name is fixed ("file", no extension derived from user input); the
// real filename is kept in the DB (originalFilename) and only ever used in
// the Content-Disposition header, never as part of a filesystem path.
export async function saveReferenceMaterialFile(
  referenceMaterialId: string,
  buffer: Buffer,
): Promise<string> {
  const relativePath = path.join(
    "reference-materials",
    referenceMaterialId,
    "file",
  );
  const absolutePath = resolveUploadPath(relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, buffer);
  return relativePath;
}

export function resolveUploadPath(relativePath: string): string {
  return path.join(/* turbopackIgnore: true */ process.cwd(), UPLOADS_DIR, relativePath);
}
