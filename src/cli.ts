import { Command } from "commander";
import { parseMarkdownFile } from "./parser.js";

const program = new Command();

program
  .name("md-to")
  .description("Convert Markdown files to PDF, DOCX, or HTML")
  .version("0.1.0");

program
  .argument("<file>", "Markdown file to convert")
  .option("-f, --format <format>", "Output format: pdf, docx, html", "html")
  .option("-t, --template <template>", "Template name to use", "default")
  .option("-o, --output <path>", "Output file path")
  .option("-v, --verbose", "Show detailed logs")
  .action((file, options) => {
    try {
      if (options.verbose) {
        console.log(`Parsing: ${file}`);
        console.log(`Format: ${options.format}`);
        console.log(`Template: ${options.template}`);
      }

      const doc = parseMarkdownFile(file);

      console.log("\n--- Parsed Document ---");
      console.log("Title:", doc.frontmatter.title ?? "(none)");
      console.log("Author:", doc.frontmatter.author ?? "(none)");
      console.log("Template:", doc.frontmatter.template ?? options.template);
      console.log("Format:", doc.frontmatter.format ?? options.format);
      console.log("\n--- Rendered HTML (preview) ---");
      console.log(
        doc.html.slice(0, 500) + (doc.html.length > 500 ? "..." : ""),
      );
      console.log("\n✓ Parse successful");
    } catch (err) {
      console.error("Error:", (err as Error).message);
      process.exit(1);
    }
  });

program.parse();
