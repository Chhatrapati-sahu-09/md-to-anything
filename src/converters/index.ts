import { convertToHtml } from "./html.js";
import { convertToPdf } from "./pdf.js";
import type { ParsedDocument, ConvertOptions } from "../types.js";

export async function convert(
  doc: ParsedDocument,
  options: ConvertOptions,
): Promise<string> {
  const format = options.format ?? doc.frontmatter.format ?? "html";

  switch (format) {
    case "html":
      return convertToHtml(doc, options);
    case "pdf":
      return await convertToPdf(doc, options);
    case "docx":
      throw new Error("DOCX support coming in Day 3.");
    default:
      throw new Error(`Unknown format: ${format}`);
  }
}
