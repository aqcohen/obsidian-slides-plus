import { Component, MarkdownRenderer } from "obsidian";
import type { App } from "obsidian";
import { Slide, SlideFrontmatter, DeckConfig } from "../types";
import { getLayoutClass, renderSlots } from "./layoutEngine";

/**
 * Renders a Slide into a DOM element using Obsidian's MarkdownRenderer.
 * Handles layout application, background styles, and content slots.
 */
export class SlideRenderEngine {
  constructor(
    private app: App,
    private sourcePath: string
  ) {}

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

    // Apply background
    this.applyBackground(slideEl, slide.frontmatter);

    // Apply aspect ratio
    slideEl.style.aspectRatio = deckConfig.aspectRatio;

    // Parse content for slot syntax and render
    const layout = slide.frontmatter.layout || "default";
    const slots = renderSlots(slide.content, layout);

    if (slots.length === 1) {
      // Single slot: render directly
      await this.renderMarkdownContent(
        slots[0].content,
        slideEl,
        component
      );
    } else {
      // Multiple slots: create slot containers
      for (const slot of slots) {
        const slotEl = slideEl.createDiv({
          cls: `sp-slot sp-slot-${slot.name}`,
        });
        await this.renderMarkdownContent(
          slot.content,
          slotEl,
          component
        );
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

  private applyBackground(
    el: HTMLElement,
    frontmatter: SlideFrontmatter
  ): void {
    const bg = frontmatter.background;
    if (!bg || typeof bg !== "string") return;

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
