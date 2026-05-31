/**
 * HTML Converter Module - Markdown to HTML Output Generation
 *
 * This module handles the conversion of parsed markdown documents to HTML format.
 *
 * Process:
 * 1. Determine template name (CLI option > frontmatter > default)
 * 2. Render template with document context
 * 3. Apply syntax highlighting if enabled
 * 4. Resolve output path (custom output > input directory)
 * 5. Create output directories (recursive)
 * 6. Write HTML file to disk
 *
 * Features:
 * - Template-based rendering with Nunjucks
 * - Optional syntax highlighting via Shiki
 * - Optional table of contents generation
 * - Automatic output directory creation
 * - Flexible output path resolution
 *
 * Output path priority:
 * 1. options.output: Explicit path from CLI
 * 2. Same directory as input file with .html extension
 * Example: input.md → input.html (in same directory)
 *
 * The HTML output includes:
 * - Full HTML document structure from template
 * - Markdown content converted to semantic HTML
 * - Syntax-highlighted code blocks (Shiki format)
 * - Table of contents (optional)
 * - Author and date metadata
 */

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
