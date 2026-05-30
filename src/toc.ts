import MarkdownIt from "markdown-it";

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

export function generateTOC(html: string): { toc: string; html: string } {
  const headings: { level: number; text: string; id: string }[] = [];

  const htmlWithIds = html.replace(
    /<h([23])>(.*?)<\/h\1>/g,
    (_, level, text) => {
      const plainText = text.replace(/<[^>]+>/g, "");
      const id = plainText
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      headings.push({ level: parseInt(level, 10), text: plainText, id });
      return `<h${level} id="${id}">${text}</h${level}>`;
    },
  );

  const toc = headings
    .map(({ level, text, id }) => {
      const indent = level === 3 ? "  " : "";
      return `${indent}- [${text}](#${id})`;
    })
    .join("\n");

  const tocHtml = toc
    ? `<nav class="toc"><h2>Contents</h2>${md.render(toc)}</nav>`
    : "";

  return { toc: tocHtml, html: htmlWithIds };
}
