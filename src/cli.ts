import { Command } from "commander";
import { createRequire } from "module";
import pc from "picocolors";
import { loadConfig } from "./config.js";
import { parseMarkdownFile } from "./parser.js";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");

const program = new Command();

program
  .name("md-to")
  .description("Convert Markdown files to PDF, DOCX, or HTML")
  .version(pkg.version);

program
  .argument("<file>", "Markdown file to convert")
  .option("-f, --format <format>", "Output format: pdf, docx, html")
  .option("-t, --template <template>", "Template name to use")
  .option("-o, --output <path>", "Output file path")
  .option("-v, --verbose", "Show detailed logs")
  .action((file, options) => {
    try {
      const config = loadConfig();
      const format = options.format ?? config.format ?? "html";
      const template = options.template ?? config.template ?? "default";

      if (options.verbose) {
        console.log(pc.bold(`Parsing: ${file}`));
        console.log(pc.cyan("Format:  ") + format);
        console.log(pc.cyan("Template:") + " " + template);
      }

      const doc = parseMarkdownFile(file);

      console.log(pc.bold("\n--- Parsed Document ---"));
      console.log(
        pc.cyan("Title:   ") + (doc.frontmatter.title ?? pc.dim("(none)")),
      );
      console.log(
        pc.cyan("Author:  ") + (doc.frontmatter.author ?? pc.dim("(none)")),
      );
      console.log(pc.cyan("Format:  ") + (doc.frontmatter.format ?? format));
      console.log(
        pc.cyan("Template:") + " " + (doc.frontmatter.template ?? template),
      );
      console.log(pc.bold("\n--- Rendered HTML (preview) ---"));
      console.log(
        doc.html.slice(0, 500) + (doc.html.length > 500 ? "..." : ""),
      );
      console.log("\n" + pc.green("✓ Parse successful"));
    } catch (err) {
      console.error(pc.red("✗ Error: ") + (err as Error).message);
      process.exit(1);
    }
  });

program
  .command("info <file>")
  .description("Inspect frontmatter and stats of a markdown file")
  .action((file) => {
    try {
      const doc = parseMarkdownFile(file);
      const wordCount = doc.content.split(/\s+/).filter(Boolean).length;
      const lines = doc.content.split("\n").length;

      console.log(pc.bold("\n--- File Info ---"));
      console.log(pc.cyan("Path:      ") + doc.filePath);
      console.log(
        pc.cyan("Title:     ") + (doc.frontmatter.title ?? pc.dim("(none)")),
      );
      console.log(
        pc.cyan("Author:    ") + (doc.frontmatter.author ?? pc.dim("(none)")),
      );
      console.log(
        pc.cyan("Date:      ") + (doc.frontmatter.date ?? pc.dim("(none)")),
      );
      console.log(
        pc.cyan("Format:    ") + (doc.frontmatter.format ?? pc.dim("(none)")),
      );
      console.log(
        pc.cyan("Template:  ") + (doc.frontmatter.template ?? pc.dim("(none)")),
      );
      console.log(pc.cyan("Words:     ") + wordCount);
      console.log(pc.cyan("Lines:     ") + lines);
    } catch (err) {
      console.error(pc.red("✗ Error: ") + (err as Error).message);
      process.exit(1);
    }
  });

program.parse();
