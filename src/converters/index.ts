import { convertToHtml } from "./html.js";
import { convertToPdf } from "./pdf.js";
import { convertToDocx } from "./docx.js";
import { convertToSlides } from "./slides.js";
import type { ParsedDocument, ConvertOptions } from "../types.js";

export async function convert(
  doc: ParsedDocument,
  options: ConvertOptions,
): Promise<string> {
  const format = options.format ?? doc.frontmatter.format ?? "html";

  switch (format) {
    case "html":
      return await convertToHtml(doc, options);
    case "slides":
      return await convertToSlides(doc, options);
    case "pdf":
      return await convertToPdf(doc, options);
    case "docx":
      return await convertToDocx(doc, options);
    default:
      throw new Error(
        `Unknown format "${format}". Valid options: html, pdf, docx, slides`,
      );
  }
}
