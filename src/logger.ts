import pc from "picocolors";
import type { BatchResult } from "./types.js";

export const log = {
  info: (msg: string) => console.log(pc.cyan("⠿ ") + msg),
  success: (msg: string) => console.log(pc.green("✓ ") + msg),
  error: (msg: string) => console.error(pc.red("✗ ") + msg),
  dim: (msg: string) => console.log(pc.dim(msg)),
  bold: (msg: string) => console.log(pc.bold(msg)),
  blank: () => console.log(""),
};

export function printBatchSummary(results: BatchResult[]): void {
  const passed = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);
  const totalMs = results.reduce((sum, r) => sum + r.durationMs, 0);

  log.blank();
  log.bold("--- Batch Summary ---");
  console.log(pc.green(`  ✓ ${passed.length} succeeded`));

  if (failed.length > 0) {
    console.log(pc.red(`  ✗ ${failed.length} failed`));
    log.blank();
    log.bold("Failed files:");
    for (const r of failed) {
      console.log(pc.red(`  • ${r.file}`));
      console.log(pc.dim(`    ${r.error}`));
    }
  }

  log.blank();
  log.dim(`Total time: ${(totalMs / 1000).toFixed(2)}s`);
}

export function printBatchProgress(
  result: BatchResult,
  index: number,
  total: number,
): void {
  const counter = pc.dim(`[${index}/${total}]`);

  if (result.success) {
    console.log(
      pc.green("  ✓") +
        ` ${counter} ${pc.dim(result.file.split("/").pop() ?? result.file)}`,
    );
  } else {
    console.log(
      pc.red("  ✗") +
        ` ${counter} ${pc.dim(result.file.split("/").pop() ?? result.file)}`,
    );
    console.log(pc.dim(`     ${result.error}`));
  }
}
