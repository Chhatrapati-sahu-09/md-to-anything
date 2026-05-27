import { Command } from "commander";
import { createRequire } from "module";
import { parseMarkdownFile } from "./parser.js";
import { convert } from "./converters/index.js";
import { loadConfig } from "./config.js";
import { batchConvert } from "./batch.js";
import { log, printBatchSummary, printBatchProgress } from "./logger.js";
import { startPreview } from "./preview.js";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");

const program = new Command();

program
  .name("md-to")
  .description("Convert Markdown files to PDF, DOCX, or HTML")
  .version(pkg.version);

// ─── Single file convert ───────────────────────────────────────────────────
program
  .argument("<file>", "Markdown file to convert")
  .option("-f, --format <format>", "Output format: pdf, docx, html")
  .option("-t, --template <template>", "Template name")
  .option("-o, --output <path>", "Output file path")
  .option("-v, --verbose", "Show detailed logs")
  .option("-w, --watch", "Start live preview with hot reload")
  .option("-p, --port <number>", "Port for live preview", "3000")
  .action(async (file: string, options: any) => {
    const config = loadConfig();
    const format = options.format ?? config.format ?? "html";
    const template = options.template ?? config.template ?? "default";

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
  .option("-f, --format <format>", "Output format: pdf, docx, html")
  .option("-t, --template <template>", "Template name")
  .option("-d, --out-dir <dir>", "Output directory for all converted files")
  .option("-v, --verbose", "Show detailed logs")
  .action(async (pattern: string, options: any) => {
    const config = loadConfig();
    const format = options.format ?? config.format ?? "html";
    const template = options.template ?? config.template ?? "default";

    try {
      log.info(`Scanning: ${pattern}`);
      log.info(`Format:   ${format.toUpperCase()}`);
      log.blank();

      const results = await batchConvert(
        pattern,
        { format, template, outputDir: options.outDir },
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

program.parse();
