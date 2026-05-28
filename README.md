# md-to-anything

Convert Markdown files to clean PDF, DOCX, or HTML using customizable templates.

```bash
npx md-to-anything report.md --format pdf
```

---

## Install

```bash
npm install -g md-to-anything
```

Or run without installing:

```bash
npx md-to-anything [options]
```

### Requirements

- Node.js 18+
- [Pandoc](https://pandoc.org/installing.html) for DOCX output
- Chromium, installed automatically by Puppeteer for PDF output

---

## Usage

### Convert a single file

```bash
md-to report.md --format pdf
md-to report.md --format docx
md-to report.md --format html
```

### Specify a template

```bash
md-to cv.md --template resume --format pdf
md-to bill.md --template invoice --format pdf
md-to paper.md --template report --format pdf
```

### Custom output path

```bash
md-to report.md --format pdf --output ~/Desktop/report.pdf
```

### Live preview with hot reload

```bash
md-to report.md --watch
md-to report.md --watch --port 4000
```

### Batch convert multiple files

```bash
md-to batch "docs/*.md" --format pdf
md-to batch "posts/**/*.md" --format html --out-dir output/
```

### Inspect a file

```bash
md-to info report.md
```

### List available templates

```bash
md-to templates
```

---

## Frontmatter config

Set options directly in your Markdown file using YAML frontmatter:

```markdown
---
title: Q2 Engineering Report
author: Platform Team
date: May 2026
template: report
format: pdf
margin: 2.5cm
---

# Your content here
```

All frontmatter fields are optional. CLI flags always override frontmatter.

| Field      | Type                      | Description                        |
| ---------- | ------------------------- | ---------------------------------- |
| `title`    | string                    | Document title                     |
| `author`   | string                    | Author name                        |
| `date`     | string                    | Date shown in header               |
| `template` | string                    | Template name (default: `default`) |
| `format`   | `pdf` \| `docx` \| `html` | Output format                      |
| `output`   | string                    | Output file path                   |
| `margin`   | string                    | PDF margin, for example `2cm`      |

---

## Templates

| Name      | Best for             |
| --------- | -------------------- |
| `default` | General documents    |
| `resume`  | CVs and resumes      |
| `invoice` | Billing and invoices |
| `report`  | Formal reports       |

### Use your own template

Create a `.html` file in a `templates/` folder in your project root.
It receives these variables:

```html
{{ title }} {{ author }} {{ date }} {{ content | safe }}
```

Then use it:

```bash
md-to report.md --template my-custom-template
```

---

## Config file

Create `md-to.config.json` at your project root to set default options:

```json
{
  "format": "pdf",
  "template": "default"
}
```

CLI flags always override the config file.

---

## All CLI options

Arguments:
file Markdown file to convert

Options:
-f, --format <format> Output format: pdf, docx, html
-t, --template <name> Template name (default: "default")
-o, --output <path> Output file path
-w, --watch Start live preview with hot reload
-p, --port <number> Port for live preview (default: 3000)
-v, --verbose Show detailed logs
-V, --version Show version number
-h, --help Show help

Commands:
batch <pattern> Convert multiple files using a glob pattern
info <file> Show frontmatter and word count
templates List available templates

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## License

MIT
