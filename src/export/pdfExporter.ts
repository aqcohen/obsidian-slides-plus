import { App, Component, Notice } from "obsidian";
import { SlidesDeck } from "../types";
import { SlideRenderEngine } from "../engine/renderEngine";
import { ThemeEngine } from "../engine/themeEngine";
import { ensureMathRendered } from "../integrations/latexRenderer";
import { ensureMermaidRendered } from "../integrations/mermaidRenderer";

/**
 * Exports a slide deck to PDF.
 *
 * Strategy:
 * 1. Render slides into a temp container (MarkdownRenderer needs main document).
 * 2. Collect all styles + computed CSS variables from the main document.
 * 3. Build a self-contained HTML document with slides + styles.
 * 4. Open HTML in system browser for the user to print/save as PDF.
 */
export class PdfExporter {
  constructor(private app: App) {}

  async export(deck: SlidesDeck, sourcePath: string): Promise<void> {
    new Notice("Preparing slides for export...");

    const renderEngine = new SlideRenderEngine(this.app, sourcePath);
    const components: Component[] = [];

    // Temporary off-screen container for MarkdownRenderer
    const tempContainer = document.createElement("div");
    tempContainer.style.cssText =
      "position: fixed; left: -9999px; top: 0; width: 960px; height: 540px;";
    document.body.appendChild(tempContainer);

    // Apply theme
    const themeEngine = new ThemeEngine();
    themeEngine.applyTheme(tempContainer, deck.globalConfig.theme);

    try {
      // Render each slide
      for (const slide of deck.slides) {
        const slideWrapper = tempContainer.createDiv({
          cls: "sp-print-slide",
        });
        const comp = await renderEngine.renderSlide(
          slide,
          slideWrapper,
          deck.globalConfig
        );
        components.push(comp);
      }

      // Ensure integrations are rendered
      await ensureMathRendered(tempContainer);
      await ensureMermaidRendered(tempContainer);
      await sleep(500);

      // Collect styles and inline fonts for self-contained HTML
      const allCSS = await this.collectStyles();
      const isDark = document.body.classList.contains("theme-dark");
      const html = this.buildPrintHTML(
        tempContainer,
        allCSS,
        deck.globalConfig.theme,
        isDark
      );

      // Cleanup temp container
      for (const comp of components) {
        comp.unload();
      }
      tempContainer.remove();

      // Open in browser for printing
      await this.openForPrint(html, sourcePath);
    } catch (e) {
      console.error("Slides Plus: export failed", e);
      new Notice("Export failed. Check console for details.");
      for (const comp of components) {
        comp.unload();
      }
      tempContainer.remove();
    }
  }

  private async openForPrint(html: string, sourcePath: string): Promise<void> {
    // Write HTML next to the source file in the vault
    const htmlPath = sourcePath.replace(/\.md$/, ".html");
    await this.app.vault.adapter.write(htmlPath, html);
    console.log("[SP Export] HTML saved to vault:", htmlPath);

    // Get the absolute path on disk
    const basePath = (
      this.app.vault.adapter as unknown as { basePath: string }
    ).basePath;
    // @ts-ignore — Node.js module
    const path = require("path");
    const absPath: string = path.join(basePath, htmlPath);
    console.log("[SP Export] Absolute path:", absPath);

    // Open in system browser
    try {
      // @ts-ignore — Node.js module
      const { exec } = require("child_process");
      const cmd =
        process.platform === "darwin"
          ? `open "${absPath}"`
          : process.platform === "win32"
            ? `start "" "${absPath}"`
            : `xdg-open "${absPath}"`;
      console.log("[SP Export] Running:", cmd);
      await new Promise<void>((resolve, reject) => {
        exec(cmd, (err: Error | null) => {
          if (err) reject(err);
          else resolve();
        });
      });
      new Notice("Opened slides in browser — use Cmd/Ctrl+P → Save as PDF");
    } catch (e) {
      console.warn("[SP Export] open command failed:", e);
      new Notice(
        `Saved as HTML: ${htmlPath} — open in a browser and print to PDF`
      );
    }
  }

  private async collectStyles(): Promise<string> {
    const parts: string[] = [];

    // Google Fonts
    const fontLinks = document.querySelectorAll(
      'link[rel="stylesheet"][href*="fonts.googleapis.com"]'
    );
    for (let i = 0; i < fontLinks.length; i++) {
      parts.push(
        `@import url("${(fontLinks[i] as HTMLLinkElement).href}");`
      );
    }

    // Only collect CSS rules relevant to slides — not ALL of Obsidian's CSS.
    const relevantPattern =
      /(?:^|\s|,)(?:\.sp-|\.theme-dark|\.theme-light|\.math|\.mermaid|\.MathJax|\.mjx-|\.MJX|\.TEX-|\.katex|\.token|\.hljs|mjx-|:root)/;

    for (let i = 0; i < document.styleSheets.length; i++) {
      try {
        const sheet = document.styleSheets[i];
        const rules = sheet.cssRules;
        for (let j = 0; j < rules.length; j++) {
          const rule = rules[j];
          if (rule instanceof CSSFontFaceRule) {
            parts.push(rule.cssText);
          } else if (rule instanceof CSSKeyframesRule) {
            parts.push(rule.cssText);
          } else if (
            rule instanceof CSSStyleRule &&
            relevantPattern.test(rule.selectorText)
          ) {
            parts.push(rule.cssText);
          }
        }
      } catch {
        // CORS-restricted stylesheet, skip
      }
    }

    let css = parts.join("\n");

    // Inline app:// font URLs as base64 data URIs for self-contained HTML.
    // Inside Obsidian, fetch() can access app:// protocol.
    const appUrlRegex = /url\(["']?(app:\/\/obsidian\.md\/[^"')]+)["']?\)/g;
    const urls = new Set<string>();
    for (const match of css.matchAll(appUrlRegex)) {
      urls.add(match[1]);
    }

    if (urls.size > 0) {
      const urlMap = new Map<string, string>();
      await Promise.all(
        [...urls].map(async (appUrl) => {
          try {
            const resp = await fetch(appUrl);
            if (!resp.ok) return;
            const blob = await resp.blob();
            const dataUri = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
            urlMap.set(appUrl, dataUri);
          } catch {
            // Font unavailable — will be dropped
          }
        })
      );

      css = css.replace(appUrlRegex, (_match, url: string) => {
        const dataUri = urlMap.get(url);
        return dataUri ? `url("${dataUri}")` : `url("${url}")`;
      });
    }

    return css;
  }

  private buildPrintHTML(
    container: HTMLElement,
    css: string,
    theme: string,
    isDark: boolean
  ): string {
    const computedVars = this.getComputedCSSVars(container);
    const slidesHTML = container.innerHTML;
    const themeMode = isDark ? "theme-dark" : "theme-light";

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
:root {
${computedVars}
}

${css}

/* Reset — standalone document, no Obsidian chrome */
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }

/* Print layout */
.sp-print-slide {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  page-break-after: always;
  break-after: page;
  page-break-inside: avoid;
}

.sp-print-slide .sp-slide {
  width: 100%;
  height: 100%;
  overflow: hidden;
  aspect-ratio: auto !important;
}

/* Fragments always visible in export */
.sp-fragment {
  opacity: 1 !important;
  transform: none !important;
  transition: none !important;
}

@page {
  size: landscape;
  margin: 0;
}

@media print {
  .sp-print-slide {
    width: 100vw;
    height: 100vh;
  }
}
</style>
</head>
<body class="${themeMode}">
<div class="sp-theme-${theme}">
${slidesHTML}
</div>
</body>
</html>`;
  }

  private getComputedCSSVars(el: HTMLElement): string {
    const style = window.getComputedStyle(el);
    const vars = [
      "--background-primary",
      "--background-secondary",
      "--background-primary-alt",
      "--background-modifier-border",
      "--background-modifier-hover",
      "--text-normal",
      "--text-muted",
      "--text-on-accent",
      "--interactive-accent",
      "--font-monospace",
      "--code-background",
      "--sp-slide-bg",
      "--sp-slide-text",
      "--sp-slide-heading",
      "--sp-slide-accent",
      "--sp-slide-accent-2",
      "--sp-slide-accent-3",
      "--sp-slide-muted",
      "--sp-slide-border",
      "--sp-slide-font-size",
      "--sp-slide-padding",
      "--sp-font-heading",
      "--sp-font-body",
      "--sp-font-code",
      "--sp-weight-heading",
      "--sp-weight-body",
      "--sp-line-height",
      "--sp-line-height-heading",
      "--sp-color-surface",
      "--sp-color-code-bg",
      "--sp-size-h1",
      "--sp-size-h2",
      "--sp-size-h3",
      "--sp-size-code",
      "--sp-size-small",
      "--sp-radius",
      "--sp-radius-lg",
    ];

    return vars
      .map((v) => {
        const val = style.getPropertyValue(v).trim();
        return val ? `  ${v}: ${val};` : "";
      })
      .filter(Boolean)
      .join("\n");
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
