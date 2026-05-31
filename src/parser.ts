/**
 * Parser Module - Markdown File Parsing and YAML Frontmatter Extraction
 *
 * This module is responsible for:
 * - Reading and parsing markdown files
 * - Extracting and validating YAML frontmatter using Zod schemas
 * - Converting markdown to HTML using markdown-it
 * - Handling errors for missing files, invalid formats, and malformed frontmatter
 *
 * Frontmatter fields supported:
 * - title: Document title
 * - author: Document author
 * - date: Publication date (string or Date object)
 * - template: Template name for rendering
 * - format: Output format (pdf, docx, html, slides)
 * - output: Custom output path
 * - margin: Print margin (CSS units)
 * - toc: Generate table of contents
 *
 * The markdown-it parser is configured with:
 * - HTML passthrough enabled (html: true)
 * - Link detection enabled (linkify: true)
 * - Typography rules enabled (typographer: true)
 */

import MarkdownIt from "markdown-it";
import matter from "gray-matter";
import { readFileSync, existsSync, statSync } from "fs";
import { resolve, extname } from "path";
import { z } from "zod";
import type { ParsedDocument, Frontmatter } from "./types.js";

const FrontmatterSchema = z.object({
  title: z.string().optional(),
  author: z.string().optional(),
  date: z.union([z.string(), z.date()]).optional(),
  template: z.string().optional(),
  format: z.enum(["pdf", "docx", "html", "slides"]).optional(),
  output: z.string().optional(),
  margin: z.string().optional(),
  toc: z.boolean().optional(),
});

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

export function parseMarkdownFile(filePath: string): ParsedDocument {
  const absolutePath = resolve(filePath);

  if (!existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  const stat = statSync(absolutePath);
  if (stat.isDirectory()) {
    throw new Error(`Expected a file but got a directory: ${absolutePath}`);
  }

  if (extname(absolutePath) !== ".md") {
    throw new Error(`File must be a .md file: ${absolutePath}`);
  }

  const raw = readFileSync(absolutePath, "utf-8");
  const { data, content } = matter(raw);

  const result = FrontmatterSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Invalid frontmatter: ${result.error.message}`);
  }

  const frontmatter: Frontmatter = {
    ...result.data,
    date:
      result.data.date instanceof Date
        ? result.data.date.toISOString().slice(0, 10)
        : result.data.date,
  };
  const html = md.render(content);

  return {
    frontmatter,
    content,
    html,
    filePath: absolutePath,
  };
}
