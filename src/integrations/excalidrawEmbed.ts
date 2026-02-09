import { App, TFile, MarkdownRenderer, Component } from "obsidian";

/**
 * Handles rendering Excalidraw embeds in slide views.
 *
 * MarkdownRenderer.render() does NOT support ![[file]] embeds,
 * so we need to handle Excalidraw drawings ourselves:
 *
 * 1. Pre-process: extract ![[*.excalidraw]] from markdown, replace with placeholder
 * 2. Post-process: fill placeholders with SVG from Excalidraw plugin API
 * 3. Fallback: if Excalidraw plugin unavailable, try to render via MarkdownRenderer
 *    on the file content, or show a placeholder message
 */

interface ExcalidrawEmbed {
  original: string;       // The full ![[file.excalidraw]] match
  filename: string;       // Just the filename part
  placeholderId: string;  // Unique ID for the placeholder div
}

/**
 * Pre-process markdown: replace ![[*.excalidraw]] embeds with placeholder divs.
 * Returns the modified markdown and a list of embeds to resolve.
 */
export function preprocessExcalidrawEmbeds(
  markdown: string
): { markdown: string; embeds: ExcalidrawEmbed[] } {
  const embeds: ExcalidrawEmbed[] = [];
  let counter = 0;

  const processed = markdown.replace(
    /!\[\[([^\]]*\.excalidraw(?:\.md)?)\]\]/g,
    (_match, filename) => {
      const id = `sp-excalidraw-${Date.now()}-${counter++}`;
      embeds.push({
        original: _match,
        filename: filename.replace(/\.md$/, ""),
        placeholderId: id,
      });
      return `<div class="sp-excalidraw-placeholder" id="${id}" data-filename="${filename}"></div>`;
    }
  );

  return { markdown: processed, embeds };
}

/**
 * Post-process: fill placeholder divs with actual Excalidraw SVGs.
 * Call this after MarkdownRenderer.render() has processed the slide.
 */
export async function resolveExcalidrawEmbeds(
  app: App,
  container: HTMLElement,
  embeds: ExcalidrawEmbed[],
  sourcePath: string
): Promise<void> {
  if (embeds.length === 0) return;

  const excPlugin = getExcalidrawPlugin(app);

  for (const embed of embeds) {
    const placeholder = container.querySelector(`#${embed.placeholderId}`);
    if (!placeholder) continue;

    // Resolve file
    const file = app.metadataCache.getFirstLinkpathDest(
      embed.filename,
      sourcePath
    );
    if (!file) {
      renderPlaceholder(
        placeholder as HTMLElement,
        embed.filename,
        "File not found"
      );
      continue;
    }

    try {
      let svg: SVGSVGElement | null = null;

      // Strategy 1: Use Excalidraw plugin API
      if (excPlugin) {
        svg = await createSvgViaPlugin(excPlugin, file);
      }

      if (svg) {
        const wrapper = document.createElement("div");
        wrapper.className = "sp-excalidraw-embed";
        wrapper.appendChild(svg);
        placeholder.replaceWith(wrapper);
      } else {
        // Strategy 2: Try rendering the file content via MarkdownRenderer
        const rendered = await tryRenderFileEmbed(app, file, sourcePath);
        if (rendered) {
          const wrapper = document.createElement("div");
          wrapper.className = "sp-excalidraw-embed";
          wrapper.appendChild(rendered);
          placeholder.replaceWith(wrapper);
        } else {
          renderPlaceholder(
            placeholder as HTMLElement,
            embed.filename,
            excPlugin ? "SVG export failed" : "Excalidraw plugin not installed"
          );
        }
      }
    } catch (e) {
      console.warn("Slides Plus: Excalidraw embed failed for", embed.filename, e);
      renderPlaceholder(
        placeholder as HTMLElement,
        embed.filename,
        "Render error"
      );
    }
  }
}

/**
 * Use the Excalidraw plugin's API to create an SVG.
 */
async function createSvgViaPlugin(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  excPlugin: any,
  file: TFile
): Promise<SVGSVGElement | null> {
  try {
    // Excalidraw plugin exposes ExcalidrawAutomate
    const ea = excPlugin.ea || excPlugin.api;
    if (!ea) return null;

    // Use the createSVG method
    if (typeof ea.createSVG === "function") {
      ea.reset();
      ea.setFile(file);
      return await ea.createSVG();
    }

    // Alternative: try via the plugin's exportSVG
    if (typeof excPlugin.createSVG === "function") {
      return await excPlugin.createSVG(file);
    }
  } catch (e) {
    console.warn("Slides Plus: Excalidraw API call failed", e);
  }
  return null;
}

/**
 * Try to render the excalidraw file using Obsidian's MarkdownRenderer.
 * The Excalidraw plugin registers a post-processor that might handle this.
 */
async function tryRenderFileEmbed(
  app: App,
  file: TFile,
  sourcePath: string
): Promise<HTMLElement | null> {
  try {
    const component = new Component();
    component.load();
    const container = document.createElement("div");

    // Try rendering the embed syntax — some plugins process this
    await MarkdownRenderer.render(
      app,
      `![[${file.basename}]]`,
      container,
      sourcePath,
      component
    );

    // Check if anything meaningful was rendered (not just a link)
    const hasContent =
      container.querySelector("svg") ||
      container.querySelector("img") ||
      container.querySelector("canvas");

    if (hasContent) {
      return container;
    }

    component.unload();
  } catch {
    // Silently fail
  }
  return null;
}

/**
 * Show a styled placeholder when the drawing can't be rendered.
 */
function renderPlaceholder(
  el: HTMLElement,
  filename: string,
  reason: string
): void {
  el.className = "sp-excalidraw-placeholder-msg";
  el.innerHTML = "";
  const icon = el.createSpan({ cls: "sp-excalidraw-icon", text: "\uD83C\uDFA8" });
  el.createSpan({ text: ` ${filename}` });
  el.createEl("br");
  el.createSpan({ cls: "sp-excalidraw-reason", text: reason });
}

/**
 * Get the Excalidraw plugin instance if installed and active.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getExcalidrawPlugin(app: App): any | null {
  const plugins = (
    app as unknown as { plugins: { plugins: Record<string, unknown> } }
  ).plugins?.plugins;
  return plugins?.["obsidian-excalidraw-plugin"] || null;
}
