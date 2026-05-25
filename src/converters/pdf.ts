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
  const html = renderTemplate(doc, templateName);
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
        top: doc.frontmatter.margin ?? "2cm",
        bottom: doc.frontmatter.margin ?? "2cm",
        left: doc.frontmatter.margin ?? "2cm",
        right: doc.frontmatter.margin ?? "2cm",
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
