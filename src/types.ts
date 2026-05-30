export interface Frontmatter {
  title?: string;
  author?: string;
  date?: string;
  template?: string;
  format?: "pdf" | "docx" | "html" | "slides";
  output?: string;
  margin?: string;
  lang?: string;
}

export interface ParsedDocument {
  frontmatter: Frontmatter;
  content: string;
  html: string;
  filePath: string;
}

export interface ConvertOptions {
  format: "pdf" | "docx" | "html" | "slides";
  template?: string;
  output?: string;
  verbose?: boolean;
  outputDir?: string;
}

export interface BatchResult {
  file: string;
  output?: string;
  success: boolean;
  error?: string;
  durationMs: number;
}
