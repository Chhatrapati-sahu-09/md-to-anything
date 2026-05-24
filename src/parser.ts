import MarkdownIt from "markdown-it";
import matter from "gray-matter";
import { readFileSync, existsSync } from "fs";
import { resolve, extname } from "path";
import { z } from "zod";
import type { ParsedDocument, Frontmatter } from "./types.js";

const FrontmatterSchema = z.object({
  title: z.string().optional(),
  author: z.string().optional(),
  date: z.string().optional(),
  template: z.string().optional(),
  format: z.enum(["pdf", "docx", "html"]).optional(),
  output: z.string().optional(),
  margin: z.string().optional(),
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

  if (extname(absolutePath) !== ".md") {
    throw new Error(`File must be a .md file: ${absolutePath}`);
  }

  const raw = readFileSync(absolutePath, "utf-8");
  const { data, content } = matter(raw);

  const result = FrontmatterSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Invalid frontmatter: ${result.error.message}`);
  }

  const frontmatter: Frontmatter = result.data;
  const html = md.render(content);

  return {
    frontmatter,
    content,
    html,
    filePath: absolutePath,
  };
}
