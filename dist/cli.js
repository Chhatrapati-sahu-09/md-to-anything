#!/usr/bin/env node

// src/cli.ts
import { Command } from "commander";
import { createRequire } from "module";
import { existsSync as existsSync4, readdirSync, statSync as statSync2 } from "fs";
import { resolve as resolve9, extname as extname6 } from "path";

// src/parser.ts
import MarkdownIt from "markdown-it";
import matter from "gray-matter";
import { readFileSync, existsSync, statSync } from "fs";
import { resolve, extname } from "path";
import { z } from "zod";
var FrontmatterSchema = z.object({
  title: z.string().optional(),
  author: z.string().optional(),
  date: z.union([z.string(), z.date()]).optional(),
  template: z.string().optional(),
  format: z.enum(["pdf", "docx", "html", "slides"]).optional(),
  output: z.string().optional(),
  margin: z.string().optional(),
  toc: z.boolean().optional()
});
var md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});
function parseMarkdownFile(filePath) {
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
  const frontmatter = {
    ...result.data,
    date: result.data.date instanceof Date ? result.data.date.toISOString().slice(0, 10) : result.data.date
  };
  const html = md.render(content);
  return {
    frontmatter,
    content,
    html,
    filePath: absolutePath
  };
}

// src/converters/html.ts
import { writeFileSync, mkdirSync } from "fs";
import { resolve as resolve3, dirname, basename, extname as extname2 } from "path";

// src/template.ts
import nunjucks from "nunjucks";
import { existsSync as existsSync2, readFileSync as readFileSync2 } from "fs";
import { resolve as resolve2 } from "path";

// src/highlight.ts
import { createHighlighter } from "shiki";
async function buildHighlighter() {
  return await createHighlighter({
    langs: [
      "typescript",
      "javascript",
      "python",
      "java",
      "cpp",
      "rust",
      "go",
      "ruby",
      "php",
      "sql",
      "html",
      "css",
      "json",
      "yaml",
      "xml",
      "bash",
      "shell"
    ]
  });
}
function applyHighlighting(html, highlighter) {
  const theme = highlighter.getTheme();
  return html.replace(
    /<pre><code class="language-([\w-]+)">([\s\S]*?)<\/code><\/pre>/g,
    (_, lang, code) => {
      const decoded = code.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
      try {
        return highlighter.codeToHtml(decoded.trim(), {
          lang,
          themes: { light: theme }
        });
      } catch (error) {
        console.error(
          `[highlight.ts] Error highlighting ${lang}:`,
          error instanceof Error ? error.message : error
        );
        return `<pre><code class="language-${lang}">${code}</code></pre>`;
      }
    }
  );
}

// src/toc.ts
import MarkdownIt2 from "markdown-it";
var md2 = new MarkdownIt2({
  html: true,
  linkify: true,
  typographer: true
});
function generateTOC(html) {
  const headings = [];
  const htmlWithIds = html.replace(
    /<h([23])>(.*?)<\/h\1>/g,
    (_, level, text) => {
      const plainText = text.replace(/<[^>]+>/g, "");
      const id = plainText.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      headings.push({ level: parseInt(level, 10), text: plainText, id });
      return `<h${level} id="${id}">${text}</h${level}>`;
    }
  );
  const toc = headings.map(({ level, text, id }) => {
    const indent = level === 3 ? "  " : "";
    return `${indent}- [${text}](#${id})`;
  }).join("\n");
  const tocHtml = toc ? `<nav class="toc"><h2>Contents</h2>${md2.render(toc)}</nav>` : "";
  return { toc: tocHtml, html: htmlWithIds };
}

// src/template.ts
function findTemplatePath(templateName) {
  const candidates = [
    resolve2(process.cwd(), "templates", `${templateName}.html`),
    resolve2(process.cwd(), "templates", templateName),
    new URL(`../templates/${templateName}.html`, import.meta.url).pathname
  ];
  for (const candidate of candidates) {
    if (existsSync2(candidate)) return candidate;
  }
  throw new Error(
    `Template not found: "${templateName}". Looked in templates/${templateName}.html`
  );
}
function renderTemplate(doc, templateName = "default", options = {}) {
  const templatePath = findTemplatePath(templateName);
  const templateSrc = readFileSync2(templatePath, "utf-8");
  const { toc, html } = options.toc || doc.frontmatter.toc ? generateTOC(doc.html) : { toc: "", html: doc.html };
  nunjucks.configure({ autoescape: true });
  const rendered = nunjucks.renderString(templateSrc, {
    title: doc.frontmatter.title ?? "",
    author: doc.frontmatter.author ?? "",
    date: doc.frontmatter.date ?? "",
    content: `${toc}${html}`
  });
  if (options.noHighlight) {
    return Promise.resolve(rendered);
  }
  return buildHighlighter().then(
    (highlighter) => applyHighlighting(rendered, highlighter)
  );
}

// src/converters/html.ts
async function convertToHtml(doc, options) {
  const templateName = options.template ?? doc.frontmatter.template ?? "default";
  const rendered = await renderTemplate(doc, templateName, {
    noHighlight: options.noHighlight,
    toc: options.toc
  });
  const outputPath = resolveOutputPath(doc, options, "html");
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, rendered, "utf-8");
  return outputPath;
}
function resolveOutputPath(doc, options, ext) {
  if (options.output) return resolve3(options.output);
  const inputBase = basename(doc.filePath, extname2(doc.filePath));
  return resolve3(dirname(doc.filePath), `${inputBase}.${ext}`);
}

// src/converters/pdf.ts
import puppeteer from "puppeteer";
import { mkdirSync as mkdirSync2 } from "fs";
import { resolve as resolve4, dirname as dirname2, basename as basename2, extname as extname3 } from "path";
async function convertToPdf(doc, options) {
  const templateName = options.template ?? doc.frontmatter.template ?? "default";
  const html = await renderTemplate(doc, templateName, {
    noHighlight: options.noHighlight,
    toc: options.toc
  });
  const outputPath = resolveOutputPath2(doc, options, "pdf");
  mkdirSync2(dirname2(outputPath), { recursive: true });
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
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
        right: options.margin ?? doc.frontmatter.margin ?? "2cm"
      },
      printBackground: true
    });
  } finally {
    await browser.close();
  }
  return outputPath;
}
function resolveOutputPath2(doc, options, ext) {
  if (options.output) return resolve4(options.output);
  const inputBase = basename2(doc.filePath, extname3(doc.filePath));
  return resolve4(dirname2(doc.filePath), `${inputBase}.${ext}`);
}

// src/converters/docx.ts
import { execFile } from "child_process";
import { promisify } from "util";
import { mkdirSync as mkdirSync3 } from "fs";
import { resolve as resolve5, dirname as dirname3, basename as basename3, extname as extname4 } from "path";
var execFileAsync = promisify(execFile);
async function checkPandoc() {
  try {
    await execFileAsync("pandoc", ["--version"]);
  } catch {
    throw new Error(
      "Pandoc is not installed or not in PATH.\n  Mac:     brew install pandoc\n  Ubuntu:  sudo apt-get install pandoc\n  Windows: https://pandoc.org/installing.html"
    );
  }
}
async function convertToDocx(doc, options) {
  await checkPandoc();
  const outputPath = resolveOutputPath3(doc, options, "docx");
  mkdirSync3(dirname3(outputPath), { recursive: true });
  const args = [
    "--from",
    "markdown",
    "--to",
    "docx",
    "--output",
    outputPath,
    "--standalone"
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
    throw new Error(`Pandoc conversion failed: ${err.message}`);
  }
  return outputPath;
}
function resolveOutputPath3(doc, options, ext) {
  if (options.output) return resolve5(options.output);
  const inputBase = basename3(doc.filePath, extname4(doc.filePath));
  if (options.outputDir) {
    return resolve5(options.outputDir, `${inputBase}.${ext}`);
  }
  return resolve5(dirname3(doc.filePath), `${inputBase}.${ext}`);
}

// src/converters/slides.ts
import MarkdownIt3 from "markdown-it";
import { mkdirSync as mkdirSync4, writeFileSync as writeFileSync2 } from "fs";
import { resolve as resolve6, dirname as dirname4, basename as basename4, extname as extname5 } from "path";
var md3 = new MarkdownIt3({
  html: true,
  linkify: true,
  typographer: true
});
async function convertToSlides(doc, options) {
  const slides = doc.content.split(/\n---\n/).map((slide) => `<section>${md3.render(slide)}</section>`).join("\n");
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${doc.frontmatter.title ?? "Slides"}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js/dist/reveal.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js/dist/theme/white.css">
</head>
<body>
  <div class="reveal"><div class="slides">${slides}</div></div>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js/dist/reveal.js"></script>
  <script>Reveal.initialize();</script>
</body>
</html>`;
  const outputPath = resolveOutputPath4(doc, options, "html");
  mkdirSync4(dirname4(outputPath), { recursive: true });
  const finalHtml = options.noHighlight ? html : applyHighlighting(html, await buildHighlighter());
  writeFileSync2(outputPath, finalHtml, "utf-8");
  return outputPath;
}
function resolveOutputPath4(doc, options, ext) {
  if (options.output) return resolve6(options.output);
  const inputBase = basename4(doc.filePath, extname5(doc.filePath));
  return resolve6(dirname4(doc.filePath), `${inputBase}.${ext}`);
}

// src/converters/index.ts
async function convert(doc, options) {
  const format = options.format ?? doc.frontmatter.format ?? "html";
  switch (format) {
    case "html":
      return await convertToHtml(doc, options);
    case "slides":
      return await convertToSlides(doc, options);
    case "pdf":
      return await convertToPdf(doc, options);
    case "docx":
      return await convertToDocx(doc, options);
    default:
      throw new Error(
        `Unknown format "${format}". Valid options: html, pdf, docx, slides`
      );
  }
}

// src/config.ts
import { existsSync as existsSync3, readFileSync as readFileSync3 } from "fs";
import { resolve as resolve7 } from "path";
function loadConfig() {
  const configPath = resolve7(process.cwd(), "md-to.config.json");
  if (!existsSync3(configPath)) return {};
  try {
    const raw = readFileSync3(configPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// src/batch.ts
import glob from "fast-glob";
import pLimit from "p-limit";
async function batchConvert(pattern, options, onProgress) {
  const files = await glob(pattern, { absolute: true });
  if (files.length === 0) {
    throw new Error(`No files matched pattern: "${pattern}"`);
  }
  const limit = pLimit(4);
  const results = [];
  const tasks = files.map(
    (file, index) => limit(async () => {
      const start = Date.now();
      try {
        const doc = parseMarkdownFile(file);
        const output = await convert(doc, { ...options, output: void 0 });
        const result = {
          file,
          output,
          success: true,
          durationMs: Date.now() - start
        };
        results.push(result);
        onProgress?.(result, index + 1, files.length);
        return result;
      } catch (err) {
        const result = {
          file,
          success: false,
          error: err.message,
          durationMs: Date.now() - start
        };
        results.push(result);
        onProgress?.(result, index + 1, files.length);
        return result;
      }
    })
  );
  await Promise.all(tasks);
  return results;
}

// src/logger.ts
import pc from "picocolors";
var log = {
  info: (msg) => console.log(pc.cyan("\u283F ") + msg),
  success: (msg) => console.log(pc.green("\u2713 ") + msg),
  error: (msg) => console.error(pc.red("\u2717 ") + msg),
  dim: (msg) => console.log(pc.dim(msg)),
  bold: (msg) => console.log(pc.bold(msg)),
  blank: () => console.log("")
};
function printBatchSummary(results) {
  const passed = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);
  const totalMs = results.reduce((sum, r) => sum + r.durationMs, 0);
  log.blank();
  log.bold("--- Batch Summary ---");
  console.log(pc.green(`  \u2713 ${passed.length} succeeded`));
  if (failed.length > 0) {
    console.log(pc.red(`  \u2717 ${failed.length} failed`));
    log.blank();
    log.bold("Failed files:");
    for (const r of failed) {
      console.log(pc.red(`  \u2022 ${r.file}`));
      console.log(pc.dim(`    ${r.error}`));
    }
  }
  log.blank();
  log.dim(`Total time: ${(totalMs / 1e3).toFixed(2)}s`);
}
function printBatchProgress(result, index, total) {
  const counter = pc.dim(`[${index}/${total}]`);
  if (result.success) {
    console.log(
      pc.green("  \u2713") + ` ${counter} ${pc.dim(result.file.split("/").pop() ?? result.file)}`
    );
  } else {
    console.log(
      pc.red("  \u2717") + ` ${counter} ${pc.dim(result.file.split("/").pop() ?? result.file)}`
    );
    console.log(pc.dim(`     ${result.error}`));
  }
}

// src/preview.ts
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import chokidar from "chokidar";
import { resolve as resolve8 } from "path";
var INJECTED_SCRIPT = `
<script>
  const ws = new WebSocket('ws://localhost:__PORT__');
  ws.onmessage = (e) => {
    if (e.data === 'reload') {
      window.location.reload();
    }
  };
  ws.onclose = () => {
    console.log('[md-to] connection closed \u2014 reload manually after restarting.');
  };
</script>
`;
function injectReloadScript(html, port) {
  const script = INJECTED_SCRIPT.replace("__PORT__", String(port));
  return html.replace("</body>", `${script}</body>`);
}
async function renderDoc(filePath, templateName) {
  const doc = parseMarkdownFile(filePath);
  const html = await renderTemplate(doc, templateName);
  return html;
}
async function startPreview(filePath, templateName = "default", port = 3e3) {
  const absolutePath = resolve8(filePath);
  const wsPort = port + 1;
  let currentHtml = await renderDoc(absolutePath, templateName);
  const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(injectReloadScript(currentHtml, wsPort));
  });
  const wss = new WebSocketServer({ port: wsPort });
  function broadcast(message) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
  const watcher = chokidar.watch([absolutePath], {
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 100, pollInterval: 50 }
  });
  watcher.on("change", async (changedPath) => {
    try {
      log.info(`File changed: ${changedPath.split("/").pop()}`);
      currentHtml = await renderDoc(absolutePath, templateName);
      broadcast("reload");
      log.success("Preview updated");
    } catch (err) {
      log.error(`Render error: ${err.message}`);
    }
  });
  server.listen(port, () => {
    log.blank();
    log.success(`Preview running at http://localhost:${port}`);
    log.dim("  Watching for changes... (Ctrl+C to stop)");
    log.blank();
    openBrowser(`http://localhost:${port}`);
  });
  process.on("SIGINT", () => {
    log.blank();
    log.info("Shutting down preview...");
    watcher.close();
    wss.close();
    server.close(() => process.exit(0));
  });
}
function openBrowser(url) {
  import("child_process").then(({ exec }) => {
    const cmd = process.platform === "darwin" ? `open ${url}` : process.platform === "win32" ? `start ${url}` : `xdg-open ${url}`;
    exec(cmd);
  });
}

// src/cli.ts
import { writeFileSync as writeFileSync3 } from "fs";
var require2 = createRequire(import.meta.url);
var pkg = require2("../package.json");
var templateRoots = [
  resolve9(process.cwd(), "templates"),
  new URL("../templates", import.meta.url).pathname
];
function listTemplates() {
  const names = /* @__PURE__ */ new Set();
  for (const root of templateRoots) {
    if (!existsSync4(root) || !statSync2(root).isDirectory()) {
      continue;
    }
    for (const entry of readdirSync(root)) {
      if (extname6(entry) === ".html") {
        names.add(entry.replace(/\.html$/, ""));
      }
    }
  }
  return [...names].sort();
}
function escapeHtmlAttribute(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
}
var program = new Command();
program.name("md-to").description("Convert Markdown files to PDF, DOCX, HTML, or slides").version(pkg.version);
program.argument("<file>", "Markdown file to convert").option("-f, --format <format>", "Output format: pdf, docx, html, slides").option("-t, --template <template>", "Template name").option("-o, --output <path>", "Output file path").option("--no-highlight", "Disable syntax highlighting").option("--toc", "Insert a table of contents from h2 and h3 headings").option("-v, --verbose", "Show detailed logs").option("-w, --watch", "Start live preview with hot reload").option("-p, --port <number>", "Port for live preview", "3000").action(async (file, options) => {
  const config = loadConfig();
  const format = options.format ?? config.format ?? "html";
  const template = options.template ?? config.template ?? "default";
  const toc = options.toc ?? config.toc ?? false;
  const noHighlight = options.highlight === false || config.highlight === false;
  const margin = config.margin;
  try {
    if (options.verbose) {
      log.dim(`Parsing:  ${file}`);
      log.dim(`Format:   ${format}`);
      log.dim(`Template: ${template}`);
    }
    if (options.watch) {
      const port = parseInt(options.port, 10) || 3e3;
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
      toc
    });
    log.blank();
    log.success("Done!");
    log.dim(`  Output: ${outputPath}`);
  } catch (err) {
    log.blank();
    log.error(err.message ?? String(err));
    process.exit(1);
  }
});
program.command("batch <pattern>").description('Convert multiple files \u2014 e.g. batch "docs/*.md" --format pdf').option("-f, --format <format>", "Output format: pdf, docx, html, slides").option("-t, --template <template>", "Template name").option("-d, --out-dir <dir>", "Output directory for all converted files").option("--no-highlight", "Disable syntax highlighting").option("--toc", "Insert a table of contents from h2 and h3 headings").option("-v, --verbose", "Show detailed logs").action(async (pattern, options) => {
  const config = loadConfig();
  const format = options.format ?? config.format ?? "html";
  const template = options.template ?? config.template ?? "default";
  const toc = options.toc ?? config.toc ?? false;
  const noHighlight = options.highlight === false || config.highlight === false;
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
        toc
      },
      printBatchProgress
    );
    printBatchSummary(results);
    const anyFailed = results.some((r) => !r.success);
    if (anyFailed) process.exit(1);
  } catch (err) {
    log.blank();
    log.error(err.message ?? String(err));
    process.exit(1);
  }
});
program.command("init").description("Create a md-to.config.json in the current directory").action(() => {
  const configPath = resolve9(process.cwd(), "md-to.config.json");
  if (existsSync4(configPath)) {
    log.error("md-to.config.json already exists");
    process.exit(1);
  }
  const config = {
    format: "pdf",
    template: "default",
    highlight: true,
    toc: false,
    margin: "2cm"
  };
  writeFileSync3(configPath, JSON.stringify(config, null, 2));
  log.success("Created md-to.config.json");
});
program.command("diff <file1> <file2>").description("Side-by-side HTML diff of two markdown files").action((file1, file2) => {
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
    writeFileSync3("diff.html", html);
    log.success("Wrote diff.html");
  } catch (err) {
    log.error(err.message ?? String(err));
    process.exit(1);
  }
});
program.command("stats <file>").description("Word count, reading time, heading structure").action((file) => {
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
  } catch (err) {
    log.error(err.message ?? String(err));
    process.exit(1);
  }
});
program.command("info <file>").description("Inspect frontmatter and stats of a markdown file").action((file) => {
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
  } catch (err) {
    log.error(err.message ?? String(err));
    process.exit(1);
  }
});
program.command("templates").description("List available templates").action(() => {
  const templates = listTemplates();
  log.blank();
  log.bold("--- Available Templates ---");
  if (templates.length === 0) {
    log.dim("  (none found)");
    return;
  }
  for (const template of templates) {
    console.log(`  \u2022 ${template}`);
  }
});
program.parse();
