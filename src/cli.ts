/**
 * CLI Module - Command Line Interface for md-to conversion tool
 *
 * This module provides the main command-line interface using Commander.js.
 * It handles:
 * - Single file conversion (to PDF, DOCX, HTML, or Slides)
 * - Batch file conversion with glob patterns
 * - Live preview mode with hot reload
 * - Utility commands: init, diff, stats
 * - Option parsing and validation
 *
 * Key features:
 * - Template selection and validation
 * - Output path resolution
 * - Configuration file loading
 * - Progress tracking for batch operations
 * - Error handling and reporting
 */

import { Command } from "commander";
import { createRequire } from "module";
import { existsSync, readdirSync, statSync } from "fs";
import { resolve, extname } from "path";
import { parseMarkdownFile } from "./parser.js";
import { convert } from "./converters/index.js";
import { loadConfig } from "./config.js";
import { batchConvert } from "./batch.js";
import { log, printBatchSummary, printBatchProgress } from "./logger.js";
import { startPreview } from "./preview.js";
import { writeFileSync } from "fs";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");
const templateRoots = [
  resolve(process.cwd(), "templates"),
  new URL("../templates", import.meta.url).pathname,
];

function listTemplates(): string[] {
  const names = new Set<string>();

  for (const root of templateRoots) {
    if (!existsSync(root) || !statSync(root).isDirectory()) {
      continue;
    }

    for (const entry of readdirSync(root)) {
      if (extname(entry) === ".html") {
        names.add(entry.replace(/\.html$/, ""));
      }
    }
  }

  return [...names].sort();
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const program = new Command();

program
  .name("md-to")
  .description("Convert Markdown files to PDF, DOCX, HTML, or slides")
  .version(pkg.version);

// ─── Single file convert ───────────────────────────────────────────────────
program
  .argument("<file>", "Markdown file to convert")
  .option("-f, --format <format>", "Output format: pdf, docx, html, slides")
  .option("-t, --template <template>", "Template name")
  .option("-o, --output <path>", "Output file path")
  .option("--no-highlight", "Disable syntax highlighting")
  .option("--toc", "Insert a table of contents from h2 and h3 headings")
  .option("-v, --verbose", "Show detailed logs")
  .option("-w, --watch", "Start live preview with hot reload")
  .option("-p, --port <number>", "Port for live preview", "3000")
  .action(async (file: string, options: any) => {
    const config = loadConfig();
    const format = options.format ?? config.format ?? "html";
    const template = options.template ?? config.template ?? "default";
    const toc = options.toc ?? config.toc ?? false;
    const noHighlight =
      options.highlight === false || config.highlight === false;
    const margin = config.margin;

    try {
      if (options.verbose) {
        log.dim(`Parsing:  ${file}`);
        log.dim(`Format:   ${format}`);
        log.dim(`Template: ${template}`);
      }

      if (options.watch) {
        const port = parseInt(options.port, 10) || 3000;
        await startPreview(file, template, port);
        return;
      }

      log.info("Parsing markdown...");
      const doc = parseMarkdownFile(file);
      log.info(`Converting to ${format.toUpperCase()}...`);
      const outputPath = await convert(doc, {
        format,
        template,
        output: options.output,
        margin,
        noHighlight,
        toc,
      });

      log.blank();
      log.success("Done!");
      log.dim(`  Output: ${outputPath}`);
    } catch (err: any) {
      log.blank();
      log.error(err.message ?? String(err));
      process.exit(1);
    }
  });

// ─── Batch convert ─────────────────────────────────────────────────────────
program
  .command("batch <pattern>")
  .description('Convert multiple files — e.g. batch "docs/*.md" --format pdf')
  .option("-f, --format <format>", "Output format: pdf, docx, html, slides")
  .option("-t, --template <template>", "Template name")
  .option("-d, --out-dir <dir>", "Output directory for all converted files")
  .option("--no-highlight", "Disable syntax highlighting")
  .option("--toc", "Insert a table of contents from h2 and h3 headings")
  .option("-v, --verbose", "Show detailed logs")
  .action(async (pattern: string, options: any) => {
    const config = loadConfig();
    const format = options.format ?? config.format ?? "html";
    const template = options.template ?? config.template ?? "default";
    const toc = options.toc ?? config.toc ?? false;
    const noHighlight =
      options.highlight === false || config.highlight === false;

    try {
      log.info(`Scanning: ${pattern}`);
      log.info(`Format:   ${format.toUpperCase()}`);
      log.blank();

      const results = await batchConvert(
        pattern,
        {
          format,
          template,
          outputDir: options.outDir,
          margin: config.margin,
          noHighlight,
          toc,
        },
        printBatchProgress,
      );

      printBatchSummary(results);
      const anyFailed = results.some((r) => !r.success);
      if (anyFailed) process.exit(1);
    } catch (err: any) {
      log.blank();
      log.error(err.message ?? String(err));
      process.exit(1);
    }
  });

// ─── Init command ─────────────────────────────────────────────────────────
program
  .command("init")
  .description("Create a md-to.config.json in the current directory")
  .action(() => {
    const configPath = resolve(process.cwd(), "md-to.config.json");

    if (existsSync(configPath)) {
      log.error("md-to.config.json already exists");
      process.exit(1);
    }

    const config = {
      format: "pdf",
      template: "default",
      highlight: true,
      toc: false,
      margin: "2cm",
    };

    writeFileSync(configPath, JSON.stringify(config, null, 2));
    log.success("Created md-to.config.json");
  });

// ─── Diff command ─────────────────────────────────────────────────────────
program
  .command("diff <file1> <file2>")
  .description("Side-by-side HTML diff of two markdown files")
  .action((file1: string, file2: string) => {
    try {
      const doc1 = parseMarkdownFile(file1);
      const doc2 = parseMarkdownFile(file2);

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>md-to diff</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 1.5rem; background: #f6f7fb; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .pane { background: #fff; border: 1px solid #d9dee7; border-radius: 12px; padding: 1rem; overflow: auto; }
    .pane h2 { margin-top: 0; font-size: 1rem; }
    @media (max-width: 960px) { .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="grid">
    <div class="pane"><h2>${escapeHtmlAttribute(doc1.filePath)}</h2>${doc1.html}</div>
    <div class="pane"><h2>${escapeHtmlAttribute(doc2.filePath)}</h2>${doc2.html}</div>
  </div>
</body>
</html>`;

      writeFileSync("diff.html", html);
      log.success("Wrote diff.html");
    } catch (err: any) {
      log.error(err.message ?? String(err));
      process.exit(1);
    }
  });

// ─── Stats command ────────────────────────────────────────────────────────
program
  .command("stats <file>")
  .description("Word count, reading time, heading structure")
  .action((file: string) => {
    try {
      const doc = parseMarkdownFile(file);
      const words = doc.content.split(/\s+/).filter(Boolean).length;
      const readingTime = Math.ceil(words / 200);
      const headings = [...doc.content.matchAll(/^#{1,6} .+/gm)].length;
      const codeBlocks = [...doc.content.matchAll(/```/g)].length / 2;
      const links = [...doc.content.matchAll(/\[.+?\]\(.+?\)/g)].length;
      const images = [...doc.content.matchAll(/!\[.+?\]\(.+?\)/g)].length;

      log.blank();
      log.bold("--- Document Stats ---");
      console.log(`  Words:        ${words}`);
      console.log(`  Reading time: ~${readingTime} min`);
      console.log(`  Headings:     ${headings}`);
      console.log(`  Code blocks:  ${codeBlocks}`);
      console.log(`  Links:        ${links}`);
      console.log(`  Images:       ${images}`);
    } catch (err: any) {
      log.error(err.message ?? String(err));
      process.exit(1);
    }
  });

// ─── Info command ──────────────────────────────────────────────────────────
program
  .command("info <file>")
  .description("Inspect frontmatter and stats of a markdown file")
  .action((file: string) => {
    try {
      const doc = parseMarkdownFile(file);
      const wordCount = doc.content.split(/\s+/).filter(Boolean).length;
      const lines = doc.content.split("\n").length;
      log.blank();
      log.bold("--- File Info ---");
      console.log(`  Path:     ${doc.filePath}`);
      console.log(`  Title:    ${doc.frontmatter.title ?? "(none)"}`);
      console.log(`  Author:   ${doc.frontmatter.author ?? "(none)"}`);
      console.log(`  Date:     ${doc.frontmatter.date ?? "(none)"}`);
      console.log(`  Format:   ${doc.frontmatter.format ?? "(none)"}`);
      console.log(`  Template: ${doc.frontmatter.template ?? "(none)"}`);
      console.log(`  Words:    ${wordCount}`);
      console.log(`  Lines:    ${lines}`);
    } catch (err: any) {
      log.error(err.message ?? String(err));
      process.exit(1);
    }
  });

program
  .command("templates")
  .description("List available templates")
  .action(() => {
    const templates = listTemplates();

    log.blank();
    log.bold("--- Available Templates ---");

    if (templates.length === 0) {
      log.dim("  (none found)");
      return;
    }

    for (const template of templates) {
      console.log(`  • ${template}`);
    }
  });

program.parse();
