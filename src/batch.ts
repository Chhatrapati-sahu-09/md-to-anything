import glob from "fast-glob";
import pLimit from "p-limit";
import { parseMarkdownFile } from "./parser.js";
import { convert } from "./converters/index.js";
import type { ConvertOptions, BatchResult } from "./types.js";

export async function batchConvert(
  pattern: string,
  options: ConvertOptions,
  onProgress?: (result: BatchResult, index: number, total: number) => void,
): Promise<BatchResult[]> {
  const files = await glob(pattern, { absolute: true });

  if (files.length === 0) {
    throw new Error(`No files matched pattern: "${pattern}"`);
  }

  const limit = pLimit(4);
  const results: BatchResult[] = [];

  const tasks = files.map((file, index) =>
    limit(async () => {
      const start = Date.now();

      try {
        const doc = parseMarkdownFile(file);
        const output = await convert(doc, { ...options, output: undefined });

        const result: BatchResult = {
          file,
          output,
          success: true,
          durationMs: Date.now() - start,
        };

        results.push(result);
        onProgress?.(result, index + 1, files.length);
        return result;
      } catch (err) {
        const result: BatchResult = {
          file,
          success: false,
          error: (err as Error).message,
          durationMs: Date.now() - start,
        };

        results.push(result);
        onProgress?.(result, index + 1, files.length);
        return result;
      }
    }),
  );

  await Promise.all(tasks);
  return results;
}
