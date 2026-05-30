import { describe, it, expect } from "vitest";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { parseMarkdownFile } from "../src/parser.js";
import { convert } from "../src/converters/index.js";

describe("html highlighting and toc", () => {
  it("adds syntax highlighting and a toc when enabled in frontmatter", async () => {
    const tempDir = join(tmpdir(), "md-to-anything-highlight-test");
    rmSync(tempDir, { recursive: true, force: true });
    mkdirSync(tempDir, { recursive: true });

    const inputPath = join(tempDir, "doc.md");
    const markup =
      `---
title: Highlight Demo
toc: true
---

# Intro

## Section One

` +
      "```typescript" +
      `
const value: string = "hello";
` +
      "```" +
      `

### Subsection
`;
    writeFileSync(inputPath, markup, "utf-8");

    const doc = parseMarkdownFile(inputPath);
    const outputPath = await convert(doc, {
      format: "html",
      output: join(tempDir, "doc.html"),
    });

    const html = readFileSync(outputPath, "utf-8");
    expect(html).toContain('<nav class="toc">');
    expect(html).toContain('href="#section-one"');
    expect(html).toContain('href="#subsection"');
    expect(html).toContain('class="shiki');
  });

  it("can opt out of syntax highlighting", async () => {
    const tempDir = join(tmpdir(), "md-to-anything-no-highlight-test");
    rmSync(tempDir, { recursive: true, force: true });
    mkdirSync(tempDir, { recursive: true });

    const inputPath = join(tempDir, "doc.md");
    const markup =
      `---
title: Plain Demo
---

# Intro

` +
      "```typescript" +
      `
const value: string = "hello";
` +
      "```" +
      `
`;
    writeFileSync(inputPath, markup, "utf-8");

    const doc = parseMarkdownFile(inputPath);
    const outputPath = await convert(doc, {
      format: "html",
      output: join(tempDir, "doc.html"),
      noHighlight: true,
    });

    const html = readFileSync(outputPath, "utf-8");
    expect(html).not.toContain('class="shiki github-light"');
    expect(html).toContain('<pre><code class="language-typescript">');
  });
});
