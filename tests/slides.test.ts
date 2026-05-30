import { describe, it, expect } from "vitest";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { parseMarkdownFile } from "../src/parser.js";
import { convert } from "../src/converters/index.js";

describe("convert slides output", () => {
  it("renders markdown separators as Reveal.js sections", async () => {
    const tempDir = join(tmpdir(), "md-to-anything-slides-test");
    rmSync(tempDir, { recursive: true, force: true });
    mkdirSync(tempDir, { recursive: true });

    const inputPath = join(tempDir, "deck.md");
    writeFileSync(
      inputPath,
      `---
title: Demo Deck
---

# First slide

---

## Second slide
`,
      "utf-8",
    );

    const doc = parseMarkdownFile(inputPath);
    const outputPath = await convert(doc, {
      format: "slides",
      output: join(tempDir, "deck.html"),
    });

    const html = readFileSync(outputPath, "utf-8");
    expect(outputPath.endsWith("deck.html")).toBe(true);
    expect(html).toContain(
      "https://cdn.jsdelivr.net/npm/reveal.js/dist/reveal.css",
    );
    expect(html).toContain('<div class="reveal"><div class="slides">');
    expect(html).toContain("<section><h1>First slide</h1>");
    expect(html).toContain("<section><h2>Second slide</h2>");
  });
});
