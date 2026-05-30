import { createHighlighter } from "shiki";

export async function buildHighlighter() {
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
      "shell",
    ],
  });
}

export function applyHighlighting(
  html: string,
  highlighter: Awaited<ReturnType<typeof createHighlighter>>,
): string {
  const theme = highlighter.getTheme();
  return html.replace(
    /<pre><code class="language-([\w-]+)">([\s\S]*?)<\/code><\/pre>/g,
    (_, lang, code) => {
      const decoded = code
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&");

      try {
        return highlighter.codeToHtml(decoded.trim(), {
          lang,
          themes: { light: theme },
        });
      } catch (error) {
        console.error(
          `[highlight.ts] Error highlighting ${lang}:`,
          error instanceof Error ? error.message : error,
        );
        return `<pre><code class="language-${lang}">${code}</code></pre>`;
      }
    },
  );
}
