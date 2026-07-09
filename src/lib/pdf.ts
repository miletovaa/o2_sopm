import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

// LibreOffice headless does the actual .docx -> .pdf conversion. This is
// what gives pixel-accurate rendering (page breaks, margins, headers,
// complex layouts) — the browser then renders the PDF with its own native
// viewer, so zoom/scroll/pagination/search/print all come for free instead
// of being reimplemented.
const SOFFICE_PATH = process.env.SOFFICE_PATH || "soffice";

export async function convertDocxToPdf(buffer: Buffer): Promise<Buffer> {
  const workDir = await mkdtemp(
    path.join(/* turbopackIgnore: true */ tmpdir(), "sopm-docx2pdf-"),
  );
  const inputPath = path.join(workDir, "input.docx");

  try {
    await writeFile(inputPath, buffer);

    await new Promise<void>((resolve, reject) => {
      const proc = spawn(SOFFICE_PATH, [
        "--headless",
        "--norestore",
        "--convert-to",
        "pdf",
        "--outdir",
        workDir,
        inputPath,
      ]);

      let stderr = "";
      proc.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });
      proc.on("error", (err) => {
        reject(
          new Error(
            `Failed to launch soffice (is LibreOffice installed and on PATH?): ${err.message}`,
          ),
        );
      });
      proc.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`soffice exited with code ${code}: ${stderr}`));
        }
      });
    });

    return await readFile(path.join(workDir, "input.pdf"));
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}
