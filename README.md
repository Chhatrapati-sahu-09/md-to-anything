# <div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&height=260&text=MD%20TO%20ANYTHING&fontAlign=50&fontAlignY=40&color=0:0f172a,50:1e293b,100:334155&fontColor=ffffff&fontSize=55&animation=fadeIn&desc=Convert%20Markdown%20to%20PDF%20DOCX%20and%20HTML&descAlignY=65&descSize=18" />

</div>

<p align="center">
  Convert Markdown files into clean and professional PDF, DOCX, and HTML documents with customizable templates, live preview, and batch conversion support.
</p>

---

# Overview

`md-to-anything` is a modern CLI utility for converting Markdown documents into multiple professional formats such as PDF, DOCX, and HTML.

It supports:

- Multiple export formats
- Slide deck output
- Syntax highlighting via Shiki
- Auto table of contents
- Custom templates
- Frontmatter configuration
- Live preview with hot reload
- Batch conversion
- Clean CLI workflow

See the full project layout in [FILE_STRUCTURE.md](FILE_STRUCTURE.md).
See the development plan in [WORKING_PLAN.md](WORKING_PLAN.md).

---

# Architecture Diagram

```text
                ┌───────────────────────┐
                │   Markdown File (.md) │
                └──────────┬────────────┘
                           │
                           ▼
                ┌───────────────────────┐
                │  Frontmatter Parser   │
                └──────────┬────────────┘
                           │
                           ▼
                ┌───────────────────────┐
                │ Markdown Transformer  │
                └──────────┬────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ PDF Renderer │   │ DOCX Engine  │   │ HTML Engine  │
│ Puppeteer    │   │ Pandoc       │   │ Template Sys │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │
       ▼                  ▼                  ▼
   report.pdf         report.docx        report.html
```

---

# Features

## Document Conversion

Convert Markdown files into:

- PDF
- DOCX
- HTML
- Slides

```bash
md-to report.md --format pdf
md-to report.md --format docx
md-to report.md --format html
md-to talk.md --format slides
```

Disable syntax highlighting when needed:

```bash
md-to report.md --format html --no-highlight
```

---

## Custom Templates

Built-in templates:

| Template | Usage                   |
| -------- | ----------------------- |
| default  | General documents       |
| resume   | CV and Resume layouts   |
| invoice  | Invoice generation      |
| report   | Formal reports          |
| slides   | Reveal.js presentations |

Example:

```bash
md-to cv.md --template resume --format pdf
```

---

## Live Preview Mode

Watch files and auto-refresh on changes.

```bash
md-to report.md --watch
```

Custom port:

```bash
md-to report.md --watch --port 4000
```

---

## Batch Conversion

Convert multiple Markdown files together.

```bash
md-to batch "docs/*.md" --format pdf
```

Recursive conversion:

```bash
md-to batch "posts/**/*.md" --format html --out-dir output/
```

---

## Frontmatter Support

Supports YAML frontmatter configuration directly inside Markdown files.

```markdown
---
title: Q2 Engineering Report
author: Platform Team
date: May 2026
template: report
format: pdf
margin: 2.5cm
---

# Content
```

CLI arguments always override frontmatter values.

---

## CLI Utilities

Create a starter config in the current directory:

```bash
md-to init
```

Compare two rendered markdown files side by side:

```bash
md-to diff doc-a.md doc-b.md
```

Get document stats:

```bash
md-to stats report.md
```

---

# Installation

## Global Installation

```bash
npm install -g md-to-anything
```

---

## Using NPX

```bash
npx md-to-anything report.md --format pdf
```

---

# Requirements

| Dependency         | Purpose         |
| ------------------ | --------------- |
| Node.js 18+        | Runtime         |
| Pandoc             | DOCX generation |
| Puppeteer Chromium | PDF rendering   |

Install Pandoc:

```bash
https://pandoc.org/installing.html
```

---

# Usage

## Convert Single File

```bash
md-to report.md --format pdf
```

---

## Specify Output Path

```bash
md-to report.md --format pdf --output ~/Desktop/report.pdf
```

---

## List Templates

```bash
md-to templates
```

---

## Inspect File Metadata

```bash
md-to info report.md
```

---

# Frontmatter Configuration

| Field     | Type          | Description                |
| --------- | ------------- | -------------------------- |
| title     | string        | Document title             |
| author    | string        | Author name                |
| date      | string        | Header date                |
| template  | string        | Template name              |
| format    | pdf/docx/html | Export format              |
| output    | string        | Output path                |
| margin    | string        | PDF margin                 |
| highlight | boolean       | Enable syntax highlighting |
| toc       | boolean       | Show a table of contents   |

---

# Custom Templates

Create custom templates inside:

```text
templates/
```

Example:

```html
<html>
  <head>
    <title>{{ title }}</title>
  </head>
  <body>
    {{ content | safe }}
  </body>
</html>
```

Use custom template:

```bash
md-to report.md --template my-template
```

---

# Configuration File

Create:

```json
md-to.config.json
```

Example:

```json
{
  "format": "pdf",
  "template": "default"
}
```

---

# CLI Options

| Option         | Description   |
| -------------- | ------------- |
| -f, --format   | Output format |
| -t, --template | Template name |
| -o, --output   | Output path   |
| -w, --watch    | Live preview  |
| -p, --port     | Preview port  |
| -v, --verbose  | Detailed logs |
| -V, --version  | Version       |
| -h, --help     | Help menu     |

---

# Commands

| Command   | Description            |
| --------- | ---------------------- |
| batch     | Convert multiple files |
| info      | Show metadata          |
| templates | List templates         |

---

# Tech Stack

<p align="left">

<img src="https://skillicons.dev/icons?i=nodejs,npm,html,css,js" />

</p>

---

# Example Workflow

```text
Write Markdown
       │
       ▼
Run md-to-anything CLI
       │
       ▼
Choose Template + Format
       │
       ▼
Generate Output
       │
       ├── PDF
       ├── DOCX
       └── HTML
```

---

# Contributing

Contributions are welcome.

Steps:

```bash
git clone <repo>
cd md-to-anything
npm install
npm run dev
```

---

# License

MIT License
