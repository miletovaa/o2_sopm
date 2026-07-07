import mammoth from "mammoth";

export async function extractDocx(buffer: Buffer) {
  const [htmlResult, textResult] = await Promise.all([
    mammoth.convertToHtml({ buffer }),
    mammoth.extractRawText({ buffer }),
  ]);

  return { html: htmlResult.value, text: textResult.value };
}
