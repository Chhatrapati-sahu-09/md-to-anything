import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import chokidar from "chokidar";
import { readFileSync } from "fs";
import { resolve } from "path";
import { parseMarkdownFile } from "./parser.js";
import { renderTemplate } from "./template.js";
import { log } from "./logger.js";

const INJECTED_SCRIPT = `
<script>
  const ws = new WebSocket('ws://localhost:__PORT__');
  ws.onmessage = (e) => {
    if (e.data === 'reload') {
      window.location.reload();
    }
  };
  ws.onclose = () => {
    console.log('[md-to] connection closed — reload manually after restarting.');
  };
</script>
`;

function injectReloadScript(html: string, port: number): string {
  const script = INJECTED_SCRIPT.replace("__PORT__", String(port));
  return html.replace("</body>", `${script}</body>`);
}

async function renderDoc(
  filePath: string,
  templateName: string,
): Promise<string> {
  const doc = parseMarkdownFile(filePath);
  const html = await renderTemplate(doc, templateName);
  return html;
}

export async function startPreview(
  filePath: string,
  templateName = "default",
  port = 3000,
): Promise<void> {
  const absolutePath = resolve(filePath);
  const wsPort = port + 1;

  let currentHtml = await renderDoc(absolutePath, templateName);

  const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(injectReloadScript(currentHtml, wsPort));
  });

  const wss = new WebSocketServer({ port: wsPort });

  function broadcast(message: string): void {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  const watcher = chokidar.watch([absolutePath], {
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 100, pollInterval: 50 },
  });

  watcher.on("change", async (changedPath) => {
    try {
      log.info(`File changed: ${changedPath.split("/").pop()}`);
      currentHtml = await renderDoc(absolutePath, templateName);
      broadcast("reload");
      log.success("Preview updated");
    } catch (err) {
      log.error(`Render error: ${(err as Error).message}`);
    }
  });

  server.listen(port, () => {
    log.blank();
    log.success(`Preview running at http://localhost:${port}`);
    log.dim("  Watching for changes... (Ctrl+C to stop)");
    log.blank();

    openBrowser(`http://localhost:${port}`);
  });

  process.on("SIGINT", () => {
    log.blank();
    log.info("Shutting down preview...");
    watcher.close();
    wss.close();
    server.close(() => process.exit(0));
  });
}

function openBrowser(url: string): void {
  import("child_process").then(({ exec }) => {
    const cmd =
      process.platform === "darwin"
        ? `open ${url}`
        : process.platform === "win32"
          ? `start ${url}`
          : `xdg-open ${url}`;
    exec(cmd);
  });
}
