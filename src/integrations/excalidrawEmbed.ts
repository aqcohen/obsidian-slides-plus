import { App, TFile } from "obsidian";

/**
 * Handles rendering Excalidraw embeds in slide views.
 *
 * Strategy:
 * 1. Primary: MarkdownRenderer.render() triggers the Excalidraw plugin's
 *    post-processor for ![[file.excalidraw]] syntax automatically.
 * 2. Fallback: If Excalidraw plugin isn't installed, extract SVG data
 *    from .excalidraw.md files and render directly.
 *
 * This module provides the fallback path.
 */
export async function renderExcalidrawFallback(
  app: App,
  container: HTMLElement
): Promise<void> {
  // Find unresolved excalidraw embeds (images that failed to load)
  const embeds = container.querySelectorAll(
    'span.internal-embed[src$=".excalidraw"]'
  );

  for (const embed of Array.from(embeds)) {
    const src = embed.getAttribute("src");
    if (!src) continue;

    // Try to find the file
    const file = app.metadataCache.getFirstLinkpathDest(src, "");
    if (!file) continue;

    try {
      const svg = await extractExcalidrawSvg(app, file);
      if (svg) {
        const wrapper = document.createElement("div");
        wrapper.className = "sp-excalidraw-embed";
        wrapper.innerHTML = svg;
        embed.replaceWith(wrapper);
      }
    } catch (e) {
      console.warn("Slides Plus: Excalidraw fallback failed for", src, e);
    }
  }
}

/**
 * Extract SVG content from an .excalidraw.md file.
 * The file contains JSON drawing data that we can render as SVG.
 */
async function extractExcalidrawSvg(
  app: App,
  file: TFile
): Promise<string | null> {
  const content = await app.vault.read(file);

  // .excalidraw.md files may contain an embedded SVG export section
  const svgMatch = content.match(
    /%%\s*\[\[SVG\]\]\s*\n([\s\S]*?)\n\s*%%/
  );
  if (svgMatch) {
    return svgMatch[1];
  }

  // Check for a companion .svg file
  const svgPath = file.path.replace(/\.excalidraw\.md$/, ".excalidraw.svg");
  const svgFile = app.vault.getAbstractFileByPath(svgPath);
  if (svgFile instanceof TFile) {
    return await app.vault.read(svgFile);
  }

  return null;
}

/**
 * Check if the Excalidraw plugin is installed and active.
 */
export function isExcalidrawPluginActive(app: App): boolean {
  return !!(app as unknown as { plugins: { plugins: Record<string, unknown> } })
    .plugins?.plugins?.["obsidian-excalidraw-plugin"];
}
