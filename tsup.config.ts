import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["esm"],
  outDir: "dist",
  clean: true,
  dts: false,
  banner: {
    js: "#!/usr/bin/env node",
  },
  noExternal: [],
  external: [
    "puppeteer",
    "chokidar",
    "ws",
    "nunjucks",
    "markdown-it",
    "gray-matter",
    "commander",
    "zod",
    "picocolors",
    "fast-glob",
    "p-limit",
  ],
});
