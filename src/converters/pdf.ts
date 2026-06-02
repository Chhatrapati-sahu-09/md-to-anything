/**
 * PDF Converter Module - Markdown to PDF Output via Puppeteer
 *
 * This module converts markdown documents to PDF format using Puppeteer,
 * a headless Chrome automation library.
 *
 * Process:
 * 1. Render HTML from template and markdown content
 * 2. Launch headless Chrome browser
 * 3. Load HTML content into new page
 * 4. Configure PDF options (format, margins, printing)
 * 5. Generate PDF and save to disk
 * 6. Clean up browser resources
 *
 * PDF Configuration:
 * - Format: A4 standard page size
 * - Margins: Configurable from CLI, frontmatter, or defaults to 2cm
 * - Print background: Enabled for full styling
 * - Sandbox/security: Disabled for CI/CD environments
 *
 * Margin priority chain (highest to lowest):
 * 1. --margin CLI argument
 * 2. frontmatter.margin from document
 * 3. Default: 2cm
 *
 * Browser launch options:
 * - headless: true - Run without visible UI
 * - args: ['--no-sandbox'] - Allow running in containers/CI
 * - args: ['--disable-setuid-sandbox'] - Additional security bypass for CI
 *
 * Output path resolution:
 * 1. options.output: Explicit path from CLI
 * 2. Same directory as input file with .pdf extension
 *
 * The PDF renderer waits for page load completion before rendering
 * to ensure all assets and styles are processed.
 */

import puppeteer from "puppeteer";
import { mkdirSync } from "fs";
import { resolve, dirname, basename, extname } from "path";
import { renderTemplate } from "../template.js";
import type { ParsedDocument, ConvertOptions } from "../types.js";

export async function convertToPdf(
  doc: ParsedDocument,
  options: ConvertOptions,
): Promise<string> {
  const templateName =
    options.template ?? doc.frontmatter.template ?? "default";
  const html = await renderTemplate(doc, templateName, {
    noHighlight: options.noHighlight,
    toc: options.toc,
  });
  const outputPath = resolveOutputPath(doc, options, "pdf");

  mkdirSync(dirname(outputPath), { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "load" });

    await page.pdf({
      path: outputPath,
      format: "A4",
      margin: {
        top: options.margin ?? doc.frontmatter.margin ?? "2cm",
        bottom: options.margin ?? doc.frontmatter.margin ?? "2cm",
        left: options.margin ?? doc.frontmatter.margin ?? "2cm",
        right: options.margin ?? doc.frontmatter.margin ?? "2cm",
      },
      printBackground: true,
    });
  } finally {
    await browser.close();
  }

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
