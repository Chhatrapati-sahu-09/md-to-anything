import nunjucks from "nunjucks";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { buildHighlighter, applyHighlighting } from "./highlight.js";
import { generateTOC } from "./toc.js";
import type { ParsedDocument, ConvertOptions } from "./types.js";

function findTemplatePath(templateName: string): string {
  const candidates = [
    resolve(process.cwd(), "templates", `${templateName}.html`),
    resolve(process.cwd(), "templates", templateName),
    new URL(`../templates/${templateName}.html`, import.meta.url).pathname,
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }

  throw new Error(
    `Template not found: "${templateName}". Looked in templates/${templateName}.html`,
  );
}

export function renderTemplate(
  doc: ParsedDocument,
  templateName = "default",
  options: Pick<ConvertOptions, "noHighlight" | "toc"> = {},
): Promise<string> {
  const templatePath = findTemplatePath(templateName);
  const templateSrc = readFileSync(templatePath, "utf-8");
  const { toc, html } =
    options.toc || doc.frontmatter.toc
      ? generateTOC(doc.html)
      : { toc: "", html: doc.html };

  nunjucks.configure({ autoescape: true });

  const rendered = nunjucks.renderString(templateSrc, {
    title: doc.frontmatter.title ?? "",
    author: doc.frontmatter.author ?? "",
    date: doc.frontmatter.date ?? "",
    content: `${toc}${html}`,
  });

  if (options.noHighlight) {
    return Promise.resolve(rendered);
  }

  return buildHighlighter().then((highlighter) =>
    applyHighlighting(rendered, highlighter),
  );
}
