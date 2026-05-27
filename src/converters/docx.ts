import { execFile } from "child_process";
import { promisify } from "util";
import { mkdirSync } from "fs";
import { resolve, dirname, basename, extname } from "path";
import type { ParsedDocument, ConvertOptions } from "../types.js";

const execFileAsync = promisify(execFile);

async function checkPandoc(): Promise<void> {
  try {
    await execFileAsync("pandoc", ["--version"]);
  } catch {
    throw new Error(
      "Pandoc is not installed or not in PATH.\n" +
        "  Mac:     brew install pandoc\n" +
        "  Ubuntu:  sudo apt-get install pandoc\n" +
        "  Windows: https://pandoc.org/installing.html",
    );
  }
}

export async function convertToDocx(
  doc: ParsedDocument,
  options: ConvertOptions,
): Promise<string> {
  await checkPandoc();

  const outputPath = resolveOutputPath(doc, options, "docx");
  mkdirSync(dirname(outputPath), { recursive: true });

  const args = [
    "--from",
    "markdown",
    "--to",
    "docx",
    "--output",
    outputPath,
    "--standalone",
  ];

  if (doc.frontmatter.title) {
    args.push("--metadata", `title=${doc.frontmatter.title}`);
  }

  if (doc.frontmatter.author) {
    args.push("--metadata", `author=${doc.frontmatter.author}`);
  }

  if (doc.frontmatter.date) {
    args.push("--metadata", `date=${doc.frontmatter.date}`);
  }

  if (doc.frontmatter.lang) {
    args.push("--metadata", `lang=${doc.frontmatter.lang}`);
  }

  try {
    await execFileAsync("pandoc", [...args, doc.filePath]);
  } catch (err) {
    throw new Error(`Pandoc conversion failed: ${(err as Error).message}`);
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

  if (options.outputDir) {
    return resolve(options.outputDir, `${inputBase}.${ext}`);
  }

  return resolve(dirname(doc.filePath), `${inputBase}.${ext}`);
}
