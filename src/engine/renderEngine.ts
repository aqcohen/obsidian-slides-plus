import { Component, MarkdownRenderer } from "obsidian";
import type { App } from "obsidian";
import { Slide, SlideFrontmatter, DeckConfig } from "../types";
import { getLayoutClass, renderSlots } from "./layoutEngine";
import { ensureMathRendered } from "../integrations/latexRenderer";
import { ensureMermaidRendered } from "../integrations/mermaidRenderer";
import {
  preprocessExcalidrawEmbeds,
  resolveExcalidrawEmbeds,
} from "../integrations/excalidrawEmbed";
import {
  BACKGROUND_PRESETS,
  FONT_PRESETS,
  TEXT_SIZE_PRESETS,
  PADDING_PRESETS,
  COLOR_PRESETS,
} from "./presets";

/**
 * Renders a Slide into a DOM element using Obsidian's MarkdownRenderer.
 * Handles layout application, background styles, content slots,
 * and integration post-processing (LaTeX, Mermaid, Excalidraw).
 */
export class SlideRenderEngine {
  constructor(
    private app: App,
    private sourcePath: string
  ) { }

  /**
   * Render a single slide into the given container element.
   * Returns the component for lifecycle management.
   */
  async renderSlide(
    slide: Slide,
    container: HTMLElement,
    deckConfig: DeckConfig
  ): Promise<Component> {
    const component = new Component();
    component.load();

    // Create slide wrapper
    const slideEl = container.createDiv({
      cls: [
        "sp-slide",
        `sp-layout-${slide.frontmatter.layout || "default"}`,
        slide.frontmatter.class || "",
      ]
        .filter(Boolean)
        .join(" "),
    });

    // Apply per-slide styling from frontmatter
    this.applyFrontmatterStyles(slideEl, slide.frontmatter);

    // Apply background
    this.applyBackground(slideEl, slide.frontmatter);

    // Apply aspect ratio
    slideEl.style.aspectRatio = deckConfig.aspectRatio;

    // Parse content for slot syntax and render
    const layout = slide.frontmatter.layout || "default";
    const slots = renderSlots(slide.content, layout);

    // Collect all Excalidraw embeds across all slots
    const allExcalidrawEmbeds: ReturnType<
      typeof preprocessExcalidrawEmbeds
    >["embeds"] = [];

    if (slots.length === 1) {
      const { markdown, embeds } = preprocessExcalidrawEmbeds(
        slots[0].content
      );
      allExcalidrawEmbeds.push(...embeds);
      await this.renderMarkdownContent(markdown, slideEl, component);
    } else {
      for (const slot of slots) {
        const slotEl = slideEl.createDiv({
          cls: `sp-slot sp-slot-${slot.name}`,
        });
        const { markdown, embeds } = preprocessExcalidrawEmbeds(
          slot.content
        );
        allExcalidrawEmbeds.push(...embeds);
        await this.renderMarkdownContent(markdown, slotEl, component);
      }
    }

    // Handle image layouts
    if (
      (layout === "image-right" || layout === "image-left") &&
      slide.frontmatter.image
    ) {
      const imgEl = slideEl.createDiv({ cls: "sp-slot sp-slot-image" });
      const img = imgEl.createEl("img", {
        attr: { src: slide.frontmatter.image as string },
      });
      img.addClass("sp-layout-image");
    }

    // Post-render: resolve integrations
    await this.runPostRenderHooks(slideEl, allExcalidrawEmbeds);

    return component;
  }

  /**
   * Render all slides into a container (used for PDF export and slide navigator).
   */
  async renderAllSlides(
    slides: Slide[],
    container: HTMLElement,
    deckConfig: DeckConfig
  ): Promise<Component[]> {
    const components: Component[] = [];
    for (const slide of slides) {
      const slideContainer = container.createDiv({ cls: "sp-slide-wrapper" });
      const comp = await this.renderSlide(slide, slideContainer, deckConfig);
      components.push(comp);
    }
    return components;
  }

  private async renderMarkdownContent(
    markdown: string,
    container: HTMLElement,
    component: Component
  ): Promise<void> {
    await MarkdownRenderer.render(
      this.app,
      markdown,
      container,
      this.sourcePath,
      component
    );
  }

  private async runPostRenderHooks(
    container: HTMLElement,
    excalidrawEmbeds: ReturnType<typeof preprocessExcalidrawEmbeds>["embeds"]
  ): Promise<void> {
    // Give MarkdownRenderer.render() a tick to finish post-processing
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Resolve integrations in parallel
    await Promise.all([
      ensureMathRendered(container),
      ensureMermaidRendered(container),
      resolveExcalidrawEmbeds(
        this.app,
        container,
        excalidrawEmbeds,
        this.sourcePath
      ),
    ]);
  }

  /**
   * Apply frontmatter styling properties to a slide element.
   * Handles both new Markdown-native properties and legacy sp-* properties.
   */
  private applyFrontmatterStyles(
    el: HTMLElement,
    frontmatter: SlideFrontmatter
  ): void {
    // Text size
    if (frontmatter["text-size"]) {
      const size = TEXT_SIZE_PRESETS[frontmatter["text-size"]];
      if (size) {
        el.style.fontSize = size;
      }
    }

    // Text alignment
    if (frontmatter["text-align"]) {
      el.style.textAlign = frontmatter["text-align"];
    }

    // Text color
    if (frontmatter["text-color"]) {
      const color = this.resolveColor(frontmatter["text-color"]);
      el.style.color = color;
      el.style.setProperty("--sp-slide-text", color);
    }

    // Accent color
    if (frontmatter["accent-color"]) {
      const color = this.resolveColor(frontmatter["accent-color"]);
      el.style.setProperty("--sp-slide-accent", color);
    }

    // Background color (different from background image/gradient)
    if (frontmatter["background-color"]) {
      const color = this.resolveColor(frontmatter["background-color"]);
      el.style.backgroundColor = color;
      el.style.setProperty("--sp-slide-bg", color);
    }

    // Heading font
    if (frontmatter["heading-font"]) {
      const font = this.resolveFont(frontmatter["heading-font"]);
      el.style.setProperty("--sp-font-heading", font);
    }

    // Body font
    if (frontmatter["body-font"]) {
      const font = this.resolveFont(frontmatter["body-font"]);
      el.style.setProperty("--sp-font-body", font);
    }

    // Padding
    if (frontmatter.padding) {
      const padding = PADDING_PRESETS[frontmatter.padding];
      if (padding) {
        el.style.padding = padding;
      }
    }

    // Custom CSS (power user escape hatch)
    if (frontmatter["custom-css"]) {
      el.style.cssText += frontmatter["custom-css"];
    }

    // Legacy: sp-* custom properties (backwards compatibility)
    for (const [key, value] of Object.entries(frontmatter)) {
      if (key.startsWith("sp-") && typeof value === "string") {
        el.style.setProperty(`--${key}`, value);
      }
    }
  }

  /**
   * Resolve a color value: check presets first, then return as-is.
   */
  private resolveColor(value: string): string {
    return COLOR_PRESETS[value] || value;
  }

  /**
   * Resolve a font value: check presets first, then return as-is.
   */
  private resolveFont(value: string): string {
    return FONT_PRESETS[value] || value;
  }

  private applyBackground(
    el: HTMLElement,
    frontmatter: SlideFrontmatter
  ): void {
    const bg = frontmatter.background;
    if (!bg || typeof bg !== "string") return;

    // Check if it's a preset
    const preset = BACKGROUND_PRESETS[bg];
    if (preset) {
      el.style.background = preset;
      return;
    }

    // Check if it's a URL (image)
    if (bg.startsWith("http") || bg.startsWith("/") || bg.startsWith("./")) {
      el.style.backgroundImage = `url(${bg})`;
      el.style.backgroundSize = "cover";
      el.style.backgroundPosition = "center";
    } else {
      // Treat as CSS color/gradient
      el.style.background = bg;
    }
  }
}
