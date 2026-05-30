import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname, basename, extname } from "path";
import { renderTemplate } from "../template.js";
import type { ParsedDocument, ConvertOptions } from "../types.js";

export async function convertToHtml(
  doc: ParsedDocument,
  options: ConvertOptions,
): Promise<string> {
  const templateName =
    options.template ?? doc.frontmatter.template ?? "default";
  const rendered = await renderTemplate(doc, templateName, {
    noHighlight: options.noHighlight,
    toc: options.toc,
  });

  const outputPath = resolveOutputPath(doc, options, "html");
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, rendered, "utf-8");

  return outputPath;
}

function resolveOutputPath(
  doc: ParsedDocument,
  options: ConvertOptions,
  ext: string,
): string {
  if (options.output) return resolve(options.output);

  const inputBase = basename(doc.filePath, extname(doc.filePath));
  return resolve(dirname(doc.filePath), `${inputBase}.${ext}`);
}
