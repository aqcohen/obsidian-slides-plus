import {
  ItemView,
  WorkspaceLeaf,
  MarkdownView,
  Component,
} from "obsidian";
import type { App } from "obsidian";
import { PREVIEW_VIEW_TYPE, SlidesDeck } from "../types";
import { parseDeck, getSlideIndexAtLine } from "../parser/slideParser";
import { SlideRenderEngine } from "../engine/renderEngine";
import { ThemeEngine } from "../engine/themeEngine";

/**
 * Side panel that shows a live preview of the current slide.
 * Updates when the cursor moves between slides in the editor.
 */
export class PreviewPanel extends ItemView {
  private renderEngine: SlideRenderEngine;
  private themeEngine: ThemeEngine;
  private currentDeck: SlidesDeck | null = null;
  private currentSlideIndex: number = -1;
  private slideComponent: Component | null = null;
  private slideContainer: HTMLElement | null = null;
  private slideCounter: HTMLElement | null = null;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    this.renderEngine = new SlideRenderEngine(this.app, "");
    this.themeEngine = new ThemeEngine();
  }

  getViewType(): string {
    return PREVIEW_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Slide Preview";
  }

  getIcon(): string {
    return "presentation";
  }

  async onOpen(): Promise<void> {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("sp-preview-root");

    // Header with controls
    const header = contentEl.createDiv({ cls: "sp-preview-header" });
    this.slideCounter = header.createSpan({ cls: "sp-slide-counter" });

    const controls = header.createDiv({ cls: "sp-preview-controls" });
    const prevBtn = controls.createEl("button", {
      text: "\u25C0",
      cls: "sp-btn",
      attr: { "aria-label": "Previous slide" },
    });
    const nextBtn = controls.createEl("button", {
      text: "\u25B6",
      cls: "sp-btn",
      attr: { "aria-label": "Next slide" },
    });
    const presentBtn = controls.createEl("button", {
      text: "Present",
      cls: "sp-btn sp-btn-primary",
      attr: { "aria-label": "Start presentation" },
    });

    prevBtn.addEventListener("click", () => this.navigateSlide(-1));
    nextBtn.addEventListener("click", () => this.navigateSlide(1));
    presentBtn.addEventListener("click", () => this.startPresentation());

    // Slide preview area
    this.slideContainer = contentEl.createDiv({ cls: "sp-preview-slide-area" });

    // Listen for editor changes
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => this.onActiveLeafChange())
    );

    this.registerEvent(
      this.app.workspace.on("editor-change", () => this.onEditorChange())
    );

    // Register cursor activity via interval polling
    // (Obsidian doesn't have a direct cursor-change event for plugins)
    this.registerInterval(
      window.setInterval(() => this.syncCursorPosition(), 300)
    );

    // Initial render
    this.onActiveLeafChange();
  }

  async onClose(): Promise<void> {
    this.cleanupSlide();
    this.themeEngine.destroy();
  }

  private onActiveLeafChange(): void {
    const view = this.getActiveMarkdownView();
    if (!view) return;

    const content = view.editor.getValue();
    if (!this.isSlidesFile(content)) {
      this.showPlaceholder("Open a slides file to preview");
      return;
    }

    this.renderEngine = new SlideRenderEngine(
      this.app,
      view.file?.path || ""
    );
    this.parseDeckAndRender(content);
  }

  private onEditorChange(): void {
    const view = this.getActiveMarkdownView();
    if (!view) return;

    const content = view.editor.getValue();
    if (!this.isSlidesFile(content)) return;

    this.parseDeckAndRender(content);
  }

  private syncCursorPosition(): void {
    const view = this.getActiveMarkdownView();
    if (!view || !this.currentDeck) return;

    const cursor = view.editor.getCursor();
    const content = view.editor.getValue();
    const slideIndex = getSlideIndexAtLine(content, cursor.line);

    if (slideIndex !== this.currentSlideIndex) {
      this.renderSlideAtIndex(slideIndex);
    }
  }

  private async parseDeckAndRender(content: string): Promise<void> {
    this.currentDeck = parseDeck(content);
    this.themeEngine.applyTheme(
      this.slideContainer!,
      this.currentDeck.globalConfig.theme
    );

    // Render current slide (or first slide)
    const targetIndex =
      this.currentSlideIndex >= 0 ? this.currentSlideIndex : 0;
    await this.renderSlideAtIndex(
      Math.min(targetIndex, this.currentDeck.slides.length - 1)
    );
  }

  private async renderSlideAtIndex(index: number): Promise<void> {
    if (!this.currentDeck || !this.slideContainer) return;
    if (index < 0 || index >= this.currentDeck.slides.length) return;

    this.currentSlideIndex = index;
    this.cleanupSlide();
    this.slideContainer.empty();

    const slide = this.currentDeck.slides[index];
    this.slideComponent = await this.renderEngine.renderSlide(
      slide,
      this.slideContainer,
      this.currentDeck.globalConfig
    );

    this.updateCounter();
  }

  private navigateSlide(delta: number): void {
    if (!this.currentDeck) return;
    const newIndex = this.currentSlideIndex + delta;
    if (newIndex >= 0 && newIndex < this.currentDeck.slides.length) {
      this.renderSlideAtIndex(newIndex);
    }
  }

  private startPresentation(): void {
    if (!this.currentDeck) return;
    // Trigger the presentation command via Obsidian's internal commands API
    (this.app as unknown as { commands: { executeCommandById: (id: string) => void } })
      .commands.executeCommandById("obsidian-slides-plus:start-presentation");
  }

  private updateCounter(): void {
    if (!this.slideCounter || !this.currentDeck) return;
    this.slideCounter.textContent = `${this.currentSlideIndex + 1} / ${this.currentDeck.slides.length}`;
  }

  private showPlaceholder(message: string): void {
    this.cleanupSlide();
    this.currentDeck = null;
    this.currentSlideIndex = -1;
    if (this.slideContainer) {
      this.slideContainer.empty();
      this.slideContainer.createDiv({
        cls: "sp-placeholder",
        text: message,
      });
    }
    if (this.slideCounter) {
      this.slideCounter.textContent = "";
    }
  }

  private cleanupSlide(): void {
    if (this.slideComponent) {
      this.slideComponent.unload();
      this.slideComponent = null;
    }
  }

  private getActiveMarkdownView(): MarkdownView | null {
    const leaf = this.app.workspace.getActiveViewOfType(MarkdownView);
    return leaf;
  }

  private isSlidesFile(content: string): boolean {
    // Check for slides: true in frontmatter
    const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!match) return false;
    return /^\s*slides\s*:\s*true\s*$/m.test(match[1]);
  }
}
