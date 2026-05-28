import { describe, it, expect, beforeAll } from "vitest";
import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import { parseMarkdownFile } from "../src/parser.js";

const FIXTURES = resolve("tests/fixtures");

beforeAll(() => {
  mkdirSync(FIXTURES, { recursive: true });

  writeFileSync(
    resolve(FIXTURES, "full.md"),
    `---
title: Test Doc
author: Jane
date: 2026-01-01
format: pdf
template: default
---

# Hello

This is **bold** and this is \`code\`.

| Col A | Col B |
|-------|-------|
| 1     | 2     |
`,
  );
});

describe("parseMarkdownFile", () => {
  it("parses frontmatter correctly", () => {
    const doc = parseMarkdownFile(resolve(FIXTURES, "full.md"));
    expect(doc.frontmatter.title).toBe("Test Doc");
    expect(doc.frontmatter.author).toBe("Jane");
    expect(doc.frontmatter.format).toBe("pdf");
    expect(doc.frontmatter.template).toBe("default");
  });

  it("renders markdown to html", () => {
    const doc = parseMarkdownFile(resolve(FIXTURES, "full.md"));
    expect(doc.html).toContain("<h1>");
    expect(doc.html).toContain("<strong>");
    expect(doc.html).toContain("<code>");
    expect(doc.html).toContain("<table");
  });

  it("handles missing frontmatter gracefully", () => {
    const doc = parseMarkdownFile(resolve(FIXTURES, "no-frontmatter.md"));
    expect(doc.frontmatter.title).toBeUndefined();
    expect(doc.html).toContain("<h1>");
  });

  it("handles minimal frontmatter", () => {
    const doc = parseMarkdownFile(resolve(FIXTURES, "minimal.md"));
    expect(doc.frontmatter.title).toBe("Minimal");
    expect(doc.frontmatter.author).toBeUndefined();
  });

  it("throws on missing file", () => {
    expect(() => parseMarkdownFile("ghost.md")).toThrow("File not found");
  });

  it("throws on wrong extension", () => {
    expect(() => parseMarkdownFile("package.json")).toThrow(".md file");
  });
});
