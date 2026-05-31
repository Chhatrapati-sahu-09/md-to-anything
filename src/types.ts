/**
 * Types Module - TypeScript Type Definitions for md-to
 *
 * This module defines all core type interfaces used throughout the application:
 *
 * Frontmatter:
 * - YAML metadata at the top of markdown files
 * - Optional fields: title, author, date, template, format, output, margin, lang, toc
 * - Extracted from document header before content
 *
 * ParsedDocument:
 * - Result of parsing a markdown file
 * - Contains: frontmatter, raw content, rendered HTML, and file path
 * - Passed through entire conversion pipeline
 *
 * ConvertOptions:
 * - CLI/API options for conversion
 * - Controls: output format, template, directory, margins, highlighting, TOC
 * - Merged with frontmatter and config for final settings
 *
 * BatchResult:
 * - Outcome of a single batch operation
 * - Tracks: file path, output location, success status, errors, duration
 * - Collected into array for batch summary reporting
 *
 * Supported formats:
 * - pdf: Portable Document Format (via Puppeteer)
 * - docx: Microsoft Word Document (via Pandoc)
 * - html: HyperText Markup Language
 * - slides: HTML presentation (via Reveal.js)
 */

export interface Frontmatter {
  title?: string;
  author?: string;
  date?: string;
  template?: string;
  format?: "pdf" | "docx" | "html" | "slides";
  output?: string;
  margin?: string;
  lang?: string;
  toc?: boolean;
}

export interface ParsedDocument {
  frontmatter: Frontmatter;
  content: string;
  html: string;
  filePath: string;
}

export interface ConvertOptions {
  format: "pdf" | "docx" | "html" | "slides";
  template?: string;
  output?: string;
  verbose?: boolean;
  outputDir?: string;
  margin?: string;
  noHighlight?: boolean;
  toc?: boolean;
}

export interface BatchResult {
  file: string;
  output?: string;
  success: boolean;
  error?: string;
  durationMs: number;
}
