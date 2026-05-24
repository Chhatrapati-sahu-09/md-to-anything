---
title: My First Report
author: Jane Doe
date: 2026-05-23
template: default
format: pdf
---

# Introduction

This is a **sample document** to test the parser.

## Features

- Converts Markdown to PDF, DOCX, or HTML
- Supports frontmatter configuration
- Uses customizable templates

## Code Example

```js
const result = parseMarkdownFile("sample.md");
console.log(result.html);
```

## Table

| Format | Engine    |
| ------ | --------- |
| PDF    | Puppeteer |
| DOCX   | Pandoc    |
| HTML   | Nunjucks  |
