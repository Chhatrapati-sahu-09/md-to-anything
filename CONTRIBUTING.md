# Contributing to md-to-anything

Thank you for your interest in contributing. This guide gets you from a clean clone to a working local setup.

---

## Dev setup

### 1. Fork and clone

```bash
git clone <your-fork-url>
cd md-to-anything
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run in dev mode

```bash
npm run dev -- examples/sample.md --format html
```

### 4. Run tests

```bash
npm test
```

---

## Project structure

```text
src/cli.ts          entry point, all commands
src/parser.ts       markdown + frontmatter -> ParsedDocument
src/template.ts     nunjucks template loader + renderer
src/batch.ts        glob pattern + concurrent conversion
src/preview.ts      live preview HTTP + WebSocket server
src/logger.ts       terminal output helpers
src/config.ts       md-to.config.json loader
src/types.ts        shared TypeScript interfaces
src/converters/     format router and converters
templates/          built-in Nunjucks HTML templates
examples/           sample markdown files
tests/fixtures/     markdown files used in tests
```

---

## How to add a new template

1. Create `templates/<name>.html`.
2. Use these variables in your template:

```html
{{ title }} {{ author }} {{ date }} {{ content | safe }}
```

3. Add a sample markdown file in `examples/`.
4. Test it:

```bash
npm run dev -- examples/your-sample.md --template <name> --watch
```

5. Open a pull request with the template file and example file.

---

## How to add a CLI flag

1. Add the option to the relevant command in `src/cli.ts`.
2. Pass it through `ConvertOptions` in `src/types.ts` if converters need it.
3. Handle it in the relevant converter or preview function.
4. Document it in `README.md`.

---

## Pull request checklist

- `npm test` passes
- `npm run build` succeeds
- New templates include a sample `.md` file in `examples/`
- New CLI flags are documented in `README.md`

---

## Reporting bugs

Include:

- Your Node.js version
- Your operating system
- The command you ran
- The full error output

---

## Questions

Open an issue or start a discussion.
