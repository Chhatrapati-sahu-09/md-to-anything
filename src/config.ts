import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

interface Config {
  format?: "pdf" | "docx" | "html" | "slides";
  template?: string;
  output?: string;
  highlight?: boolean;
  toc?: boolean;
  margin?: string;
}

export function loadConfig(): Config {
  const configPath = resolve(process.cwd(), "md-to.config.json");
  if (!existsSync(configPath)) return {};

  try {
    const raw = readFileSync(configPath, "utf-8");
    return JSON.parse(raw) as Config;
  } catch {
    return {};
  }
}
