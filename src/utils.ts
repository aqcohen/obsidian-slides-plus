/**
 * Check if a markdown string is a slides file (has slides: true in frontmatter).
 * Handles Windows line endings, BOM, and quoted values.
 */
export function isSlidesFile(content: string): boolean {
  const normalized = content
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .trimStart();
  const match = normalized.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return false;
  return /^\s*slides\s*:\s*["']?true["']?\s*$/m.test(match[1]);
}
