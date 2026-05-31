/**
 * Config Module - Configuration File Loading and Management
 *
 * This module handles:
 * - Loading md-to.config.json configuration files from project root
 * - Parsing and providing default values for all configuration options
 * - Graceful fallback when config file is missing or invalid
 *
 * Configuration options:
 * - format: Default output format (pdf, docx, html, slides)
 * - template: Default template name to use
 * - output: Default output directory/path
 * - highlight: Enable/disable syntax highlighting (default: true)
 * - toc: Enable/disable table of contents (default: false)
 * - margin: Default page margin in CSS units (default: 2cm)
 *
 * Priority chain for options:
 * 1. CLI arguments (highest priority)
 * 2. Frontmatter in document
 * 3. md-to.config.json
 * 4. Hardcoded defaults (lowest priority)
 *
 * The loadConfig function returns an empty object if the config file
 * doesn't exist or fails to parse, allowing graceful degradation.
 */

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
