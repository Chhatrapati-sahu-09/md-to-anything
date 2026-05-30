import MarkdownIt from "markdown-it";
import { mkdirSync, writeFileSync } from "fs";
import { resolve, dirname, basename, extname } from "path";
import type { ParsedDocument, ConvertOptions } from "../types.js";

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

export function convertToSlides(
  doc: ParsedDocument,
  options: ConvertOptions,
): string {
  const slides = doc.content
    .split(/\n---\n/)
    .map((slide) => `<section>${md.render(slide)}</section>`)
    .join("\n");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${doc.frontmatter.title ?? "Slides"}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js/dist/reveal.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js/dist/theme/white.css">
</head>
<body>
  <div class="reveal"><div class="slides">${slides}</div></div>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js/dist/reveal.js"></script>
  <script>Reveal.initialize();</script>
</body>
</html>`;

  const outputPath = resolveOutputPath(doc, options, "html");
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, html, "utf-8");

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
