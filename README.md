# <div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&height=260&text=MD%20TO%20ANYTHING&fontAlign=50&fontAlignY=40&color=0:0f172a,50:1e293b,100:334155&fontColor=ffffff&fontSize=55&animation=fadeIn&desc=Convert%20Markdown%20to%20PDF%20DOCX%20and%20HTML&descAlignY=65&descSize=18" />

</div>

<p align="center">
  Convert Markdown files into clean and professional PDF, DOCX, and HTML documents with customizable templates, live preview, and batch conversion support.
</p>

---

# Overview

`md-to-anything` is a modern CLI utility that converts Markdown documents into professional PDF, DOCX, HTML, and presentation slides with zero configuration.

## Key Features

- **Multiple Export Formats** — PDF, DOCX, HTML, and Reveal.js slides
- **Syntax Highlighting** — Beautiful code blocks via Shiki (16+ languages supported)
- **Auto Table of Contents** — Generate TOC from h2 and h3 headings automatically
- **Custom Templates** — Built-in templates for reports, resumes, invoices, and slides
- **Frontmatter Configuration** — YAML-based document settings
- **Live Preview** — Watch mode with hot reload in the browser
- **Batch Conversion** — Convert multiple files in parallel
- **Professional Output** — Clean, publication-ready documents

📖 **Documentation:** [FILE_STRUCTURE.md](FILE_STRUCTURE.md) | [WORKING_PLAN.md](WORKING_PLAN.md)

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

## Built-in Templates

| Template | Best For                |
| -------- | ----------------------- |
| default  | General documents       |
| resume   | CV and resume layouts   |
| invoice  | Invoice generation      |
| report   | Formal reports & papers |
| slides   | Reveal.js presentations |

## Custom Templates

Create custom HTML templates in your `templates/` directory:

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

Then use it:

```bash
md-to report.md --template my-template
```

---

## Syntax Highlighting & TOC

Enable syntax highlighting and auto table of contents:

````markdown
---
title: My Report
highlight: true
toc: true
---

# Main Title

## Section One

```typescript
const value = "highlighted code";
```
````

````

Or use CLI flags:

```bash
md-to report.md --format html --toc --no-highlight
````

## Frontmatter Configuration

Configure documents via YAML frontmatter:

```markdown
---
title: Q2 Engineering Report
author: Platform Team
date: May 2026
template: report
format: pdf
margin: 2.5cm
highlight: true
toc: false
---

# Your Content
```

✓ **Note:** CLI arguments always override frontmatter values.

---

## Utility Commands

**Initialize project config:**

```bash
md-to init
```

Creates a `md-to.config.json` with sensible defaults.

**Compare two documents:**

```bash
md-to diff doc-a.md doc-b.md
```

Generates a side-by-side HTML diff at `diff.html`.

**Get document statistics:**

```bash
md-to stats report.md
```

Shows word count, reading time, heading structure, code blocks, links, and images.

---

# Quick Start

## Installation

### Global NPM

```bash
npm install -g md-to-anything
md-to report.md --format pdf
```

### Using NPX (No Install)

```bash
npx md-to-anything report.md --format pdf
```

## System Requirements

| Dependency         | Version | Purpose                    |
| ------------------ | ------- | -------------------------- |
| Node.js            | 18+     | Runtime                    |
| Pandoc             | Any     | DOCX generation (optional) |
| Puppeteer Chromium | Bundled | PDF rendering              |

### Install Pandoc

**macOS:**

```bash
brew install pandoc
```

**Ubuntu/Debian:**

```bash
sudo apt-get install pandoc
```

**Windows:**
Download from [pandoc.org](https://pandoc.org/installing.html)

---

# Usage Guide

## Single File Conversion

```bash
# Convert to PDF
md-to report.md --format pdf

# Convert to HTML with custom output
md-to report.md --format html --output ~/Desktop/report.html

# Convert with syntax highlighting and TOC
md-to report.md --format pdf --toc

# Convert without highlighting
md-to report.md --format html --no-highlight
```

## Templates & Formats

```bash
# List all available templates
md-to templates

# Use a specific template
md-to cv.md --template resume --format pdf

# Available templates: default, resume, invoice, report, slides
```

## Batch Operations

```bash
# Convert all markdown files in a directory
md-to batch "docs/*.md" --format pdf --out-dir output/

# Recursive conversion
md-to batch "posts/**/*.md" --format html
```

## Live Preview

```bash
# Watch file and auto-refresh in browser
md-to report.md --watch

# Use custom port
md-to report.md --watch --port 4000
```

## File Information

```bash
# Show document metadata and stats
md-to info report.md

# Get detailed statistics
md-to stats report.md
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

Initialize project config with sensible defaults:

```bash
md-to init
```

This creates `md-to.config.json`:

```json
{
  "format": "pdf",
  "template": "default",
  "highlight": true,
  "toc": false,
  "margin": "2cm"
}
```

**Priority:** CLI args > Frontmatter > Config file > Defaults

## Frontmatter Fields Reference

| Field       | Type    | Default   | Description                             |
| ----------- | ------- | --------- | --------------------------------------- |
| `title`     | string  | —         | Document title                          |
| `author`    | string  | —         | Author name                             |
| `date`      | string  | —         | Publication date                        |
| `template`  | string  | `default` | Template name                           |
| `format`    | string  | `html`    | Output format (pdf, docx, html, slides) |
| `margin`    | string  | `2cm`     | PDF margin                              |
| `highlight` | boolean | `true`    | Enable syntax highlighting              |
| `toc`       | boolean | `false`   | Generate table of contents              |

---

# Complete CLI Reference

## Global Options

| Option           | Short | Description                             |
| ---------------- | ----- | --------------------------------------- |
| `--format`       | `-f`  | Output format: pdf, docx, html, slides  |
| `--template`     | `-t`  | Template name (default, resume, report) |
| `--output`       | `-o`  | Output file path                        |
| `--watch`        | `-w`  | Live preview mode with hot reload       |
| `--port`         | `-p`  | Port for live preview (default: 3000)   |
| `--toc`          |       | Insert table of contents                |
| `--no-highlight` |       | Disable syntax highlighting             |
| `--verbose`      | `-v`  | Show detailed logs                      |
| `--version`      | `-V`  | Show version                            |
| `--help`         | `-h`  | Show help menu                          |

## Commands

| Command           | Description                                |
| ----------------- | ------------------------------------------ |
| `batch <pattern>` | Convert multiple files matching pattern    |
| `init`            | Create md-to.config.json in current dir    |
| `diff <f1> <f2>`  | Generate side-by-side HTML diff            |
| `stats <file>`    | Show document statistics (words, TOC, etc) |
| `info <file>`     | Display file metadata and properties       |
| `templates`       | List all available templates               |

---

# Development

## Setup

```bash
git clone https://github.com/yourusername/md-to-anything.git
cd md-to-anything
npm install
```

## Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Project Structure

```
src/
  cli.ts          # Command-line interface
  parser.ts       # Markdown parser
  template.ts     # Template rendering
  highlight.ts    # Syntax highlighting
  toc.ts          # Table of contents
  converters/     # Format-specific converters
templates/        # Built-in templates
examples/         # Example markdown files
tests/            # Test suite
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

# License

MIT License — Feel free to use in personal and commercial projects.
