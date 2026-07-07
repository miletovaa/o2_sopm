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

export function resolveUploadPath(relativePath: string): string {
  return path.join(/* turbopackIgnore: true */ process.cwd(), UPLOADS_DIR, relativePath);
}
