import { App, Component, Notice } from "obsidian";
import { SlidesDeck } from "../types";
import { SlideRenderEngine } from "../engine/renderEngine";
import { ensureMathRendered } from "../integrations/latexRenderer";
import { ensureMermaidRendered } from "../integrations/mermaidRenderer";

/**
 * Exports a slide deck to PDF using the browser's print API.
 * Renders all slides into a hidden container with print-optimized CSS,
 * then triggers window.print().
 */
export class PdfExporter {
  constructor(private app: App) {}

  async export(deck: SlidesDeck, sourcePath: string): Promise<void> {
    new Notice("Preparing slides for PDF export...");

    const renderEngine = new SlideRenderEngine(this.app, sourcePath);
    const components: Component[] = [];

    // Create a hidden container for rendering all slides
    const printContainer = document.body.createDiv({
      cls: "sp-print-container",
    });

    try {
      // Render each slide
      for (const slide of deck.slides) {
        const slideWrapper = printContainer.createDiv({
          cls: "sp-print-slide",
        });
        slideWrapper.style.aspectRatio = deck.globalConfig.aspectRatio;

        const comp = await renderEngine.renderSlide(
          slide,
          slideWrapper,
          deck.globalConfig
        );
        components.push(comp);
      }

      // Ensure all integrations are rendered
      await ensureMathRendered(printContainer);
      await ensureMermaidRendered(printContainer);

      // Small delay to let rendering settle
      await sleep(500);

      // Add print-active class to trigger @media print CSS
      document.body.addClass("sp-printing");
      printContainer.addClass("sp-print-active");

      // Trigger print dialog
      window.print();

      new Notice("PDF export ready");
    } catch (e) {
      console.error("Slides Plus: PDF export failed", e);
      new Notice("PDF export failed. Check console for details.");
    } finally {
      // Cleanup
      document.body.removeClass("sp-printing");
      for (const comp of components) {
        comp.unload();
      }
      printContainer.remove();
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
