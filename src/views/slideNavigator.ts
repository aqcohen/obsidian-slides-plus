import { ItemView, WorkspaceLeaf, MarkdownView, Component } from "obsidian";
import { SlidesDeck } from "../types";
import { parseDeck } from "../parser/slideParser";
import { SlideRenderEngine } from "../engine/renderEngine";

const NAVIGATOR_VIEW_TYPE = "slides-plus-navigator";

export { NAVIGATOR_VIEW_TYPE };

/**
 * Slide navigator: thumbnail grid showing all slides.
 * Click a thumbnail to jump to that slide in the editor.
 */
export class SlideNavigator extends ItemView {
  private deck: SlidesDeck | null = null;
  private gridEl: HTMLElement | null = null;
  private slideComponents: Component[] = [];
  private sourcePath: string = "";

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType(): string {
    return NAVIGATOR_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Slide Navigator";
  }

  getIcon(): string {
    return "layout-grid";
  }

  async onOpen(): Promise<void> {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("sp-navigator-root");

    const header = contentEl.createDiv({ cls: "sp-navigator-header" });
    header.createEl("h3", { text: "Slide Navigator" });

    const refreshBtn = header.createEl("button", {
      text: "Refresh",
      cls: "sp-btn sp-btn-small",
    });
    refreshBtn.addEventListener("click", () => this.refresh());

    this.gridEl = contentEl.createDiv({ cls: "sp-navigator-grid" });

    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => this.refresh())
    );
    this.registerEvent(
      this.app.workspace.on("editor-change", () => this.debouncedRefresh())
    );

    this.refresh();
  }

  async onClose(): Promise<void> {
    this.cleanupComponents();
  }

  private refreshTimeout: ReturnType<typeof setTimeout> | null = null;

  private debouncedRefresh(): void {
    if (this.refreshTimeout) clearTimeout(this.refreshTimeout);
    this.refreshTimeout = setTimeout(() => this.refresh(), 500);
  }

  private async refresh(): Promise<void> {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) {
      this.showPlaceholder("Open a slides file to see the navigator");
      return;
    }

    const content = view.editor.getValue();
    if (!this.isSlidesFile(content)) {
      this.showPlaceholder("Active file is not a slides file");
      return;
    }

    this.sourcePath = view.file?.path || "";
    this.deck = parseDeck(content);
    await this.renderGrid();
  }

  private async renderGrid(): Promise<void> {
    if (!this.gridEl || !this.deck) return;
    this.cleanupComponents();
    this.gridEl.empty();

    const renderEngine = new SlideRenderEngine(this.app, this.sourcePath);

    for (let i = 0; i < this.deck.slides.length; i++) {
      const slide = this.deck.slides[i];
      const thumb = this.gridEl.createDiv({ cls: "sp-navigator-thumb" });

      // Slide number label
      thumb.createDiv({
        cls: "sp-navigator-thumb-number",
        text: `${i + 1}`,
      });

      // Mini slide preview
      const preview = thumb.createDiv({ cls: "sp-navigator-thumb-preview" });
      const comp = await renderEngine.renderSlide(
        slide,
        preview,
        this.deck.globalConfig
      );
      this.slideComponents.push(comp);

      // Layout label
      if (slide.frontmatter.layout && slide.frontmatter.layout !== "default") {
        thumb.createDiv({
          cls: "sp-navigator-thumb-layout",
          text: slide.frontmatter.layout,
        });
      }

      // Click to jump to slide in editor
      thumb.addEventListener("click", () => this.jumpToSlide(i));

      // Notes indicator
      if (slide.notes) {
        thumb.createDiv({ cls: "sp-navigator-thumb-notes-indicator" });
      }
    }
  }

  private jumpToSlide(index: number): void {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view || !this.deck) return;

    const content = view.editor.getValue();
    const lines = content.split("\n");
    let slideIdx = 0;
    let inFrontmatter = false;
    let pastFrontmatter = false;
    let targetLine = 0;

    // For slide 0, target is after global frontmatter
    if (index === 0) {
      if (lines[0]?.trim() === "---") {
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim() === "---") {
            targetLine = i + 1;
            break;
          }
        }
      }
    } else {
      for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();

        if (i === 0 && trimmed === "---") {
          inFrontmatter = true;
          continue;
        }
        if (inFrontmatter && trimmed === "---") {
          inFrontmatter = false;
          pastFrontmatter = true;
          continue;
        }
        if (inFrontmatter) continue;
        if (!pastFrontmatter && i > 0) pastFrontmatter = true;

        if (pastFrontmatter && trimmed === "---") {
          slideIdx++;
          if (slideIdx === index) {
            targetLine = Math.min(i + 1, lines.length - 1);
            break;
          }
        }
      }
    }

    view.editor.setCursor({ line: targetLine, ch: 0 });
    view.editor.scrollIntoView({
      from: { line: targetLine, ch: 0 },
      to: { line: targetLine, ch: 0 },
    });
    view.editor.focus();
  }

  private showPlaceholder(text: string): void {
    this.cleanupComponents();
    this.deck = null;
    if (this.gridEl) {
      this.gridEl.empty();
      this.gridEl.createDiv({ cls: "sp-placeholder", text });
    }
  }

  private cleanupComponents(): void {
    for (const comp of this.slideComponents) {
      comp.unload();
    }
    this.slideComponents = [];
  }

  private isSlidesFile(content: string): boolean {
    const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!match) return false;
    return /^\s*slides\s*:\s*true\s*$/m.test(match[1]);
  }
}
