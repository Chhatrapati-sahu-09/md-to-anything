import nunjucks from "nunjucks";
import { existsSync, readFileSync } from "fs";
import { resolve, join } from "path";
import type { ParsedDocument } from "./types.js";

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
): string {
  const templatePath = findTemplatePath(templateName);
  const templateSrc = readFileSync(templatePath, "utf-8");

  nunjucks.configure({ autoescape: true });

  return nunjucks.renderString(templateSrc, {
    title: doc.frontmatter.title ?? "",
    author: doc.frontmatter.author ?? "",
    date: doc.frontmatter.date ?? "",
    content: doc.html,
  });
}
