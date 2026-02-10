import { ItemView, WorkspaceLeaf, Component } from "obsidian";
import { PRESENTER_VIEW_TYPE, SlidesDeck } from "../types";
import { SlideRenderEngine } from "../engine/renderEngine";
import { ThemeEngine } from "../engine/themeEngine";

/**
 * Presenter view: shows current slide, next slide preview,
 * speaker notes, elapsed timer, and slide counter.
 */
export class PresenterView extends ItemView {
  private deck: SlidesDeck | null = null;
  private sourcePath: string = "";
  private currentIndex: number = 0;
  private fragmentStep: number = 0;
  private renderEngine!: SlideRenderEngine;
  private themeEngine: ThemeEngine;

  private currentSlideEl: HTMLElement | null = null;
  private nextSlideEl: HTMLElement | null = null;
  private notesEl: HTMLElement | null = null;
  private timerEl: HTMLElement | null = null;
  private counterEl: HTMLElement | null = null;

  private timerInterval: number | null = null;
  private startTime: number = 0;
  private slideComponents: Component[] = [];

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    this.themeEngine = new ThemeEngine();
  }

  getViewType(): string {
    return PRESENTER_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Presenter Notes";
  }

  getIcon(): string {
    return "message-square";
  }

  async onOpen(): Promise<void> {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("sp-presenter-root");

    // Layout: two columns top, notes bottom
    const topRow = contentEl.createDiv({ cls: "sp-presenter-top" });
    this.currentSlideEl = topRow.createDiv({
      cls: "sp-presenter-current",
    });
    const rightCol = topRow.createDiv({ cls: "sp-presenter-right" });
    this.nextSlideEl = rightCol.createDiv({
      cls: "sp-presenter-next",
    });

    // Info bar
    const infoBar = rightCol.createDiv({ cls: "sp-presenter-info" });
    this.timerEl = infoBar.createSpan({ cls: "sp-presenter-timer" });
    this.counterEl = infoBar.createSpan({ cls: "sp-presenter-counter" });

    // Timer controls
    const timerControls = infoBar.createDiv({ cls: "sp-presenter-timer-controls" });
    const resetBtn = timerControls.createEl("button", {
      text: "Reset",
      cls: "sp-btn sp-btn-small",
    });
    resetBtn.addEventListener("click", () => this.resetTimer());

    // Notes area
    this.notesEl = contentEl.createDiv({ cls: "sp-presenter-notes" });

    // Start timer
    this.startTime = Date.now();
    this.timerInterval = window.setInterval(
      () => this.updateTimer(),
      1000
    );

    // Keyboard navigation
    this.contentEl.tabIndex = 0;
    this.contentEl.addEventListener("keydown", (e) =>
      this.handleKeydown(e)
    );
    this.contentEl.focus();

    if (this.deck) {
      await this.renderCurrentState();
    }
  }

  async onClose(): Promise<void> {
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
    }
    this.cleanupComponents();
    this.themeEngine.destroy();
  }

  async setDeck(
    deck: SlidesDeck,
    sourcePath: string,
    startIndex: number = 0
  ): Promise<void> {
    this.deck = deck;
    this.sourcePath = sourcePath;
    this.currentIndex = startIndex;
    this.renderEngine = new SlideRenderEngine(this.app, sourcePath);

    if (this.currentSlideEl) {
      await this.renderCurrentState();
    }
  }

  /**
   * Sync with presentation view's current slide and fragment state.
   */
  async syncToSlide(index: number, fragmentStep: number = 0): Promise<void> {
    if (index === this.currentIndex && fragmentStep === this.fragmentStep) return;
    this.currentIndex = index;
    this.fragmentStep = fragmentStep;
    await this.renderCurrentState();
  }

  private async renderCurrentState(): Promise<void> {
    if (!this.deck) return;
    this.cleanupComponents();

    const slide = this.deck.slides[this.currentIndex];

    // Render current slide
    if (this.currentSlideEl) {
      this.currentSlideEl.empty();
      const comp = await this.renderEngine.renderSlide(
        slide,
        this.currentSlideEl,
        this.deck.globalConfig
      );
      this.slideComponents.push(comp);

      // Apply fragment visibility to match presentation view
      const fragments = this.currentSlideEl.querySelectorAll<HTMLElement>(".sp-fragment");
      fragments.forEach((el) => {
        const idx = parseInt(el.dataset.fragmentIndex || "0", 10);
        el.classList.toggle("sp-fragment-visible", idx < this.fragmentStep);
      });
    }

    // Render next slide preview
    if (this.nextSlideEl) {
      this.nextSlideEl.empty();
      const nextIndex = this.currentIndex + 1;
      if (nextIndex < this.deck.slides.length) {
        const nextSlide = this.deck.slides[nextIndex];
        const comp = await this.renderEngine.renderSlide(
          nextSlide,
          this.nextSlideEl,
          this.deck.globalConfig
        );
        this.slideComponents.push(comp);
      } else {
        this.nextSlideEl.createDiv({
          cls: "sp-placeholder",
          text: "End of presentation",
        });
      }
    }

    // Show speaker notes
    if (this.notesEl) {
      this.notesEl.empty();
      if (slide.notes) {
        this.notesEl.createDiv({
          cls: "sp-presenter-notes-label",
          text: "Speaker Notes",
        });
        this.notesEl.createDiv({
          cls: "sp-presenter-notes-content",
          text: slide.notes,
        });
      } else {
        this.notesEl.createDiv({
          cls: "sp-placeholder",
          text: "No speaker notes for this slide",
        });
      }
    }

    // Update counter
    this.updateCounter();
  }

  private handleKeydown(e: KeyboardEvent): void {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
      case " ":
        e.preventDefault();
        this.navigate(1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        this.navigate(-1);
        break;
    }
  }

  private async navigate(delta: number): Promise<void> {
    if (!this.deck) return;
    const newIndex = this.currentIndex + delta;
    if (newIndex < 0 || newIndex >= this.deck.slides.length) return;

    this.currentIndex = newIndex;
    await this.renderCurrentState();
  }

  private updateTimer(): void {
    if (!this.timerEl) return;
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    this.timerEl.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  private resetTimer(): void {
    this.startTime = Date.now();
    this.updateTimer();
  }

  private updateCounter(): void {
    if (!this.counterEl || !this.deck) return;
    this.counterEl.textContent = `${this.currentIndex + 1} / ${this.deck.slides.length}`;
  }

  private cleanupComponents(): void {
    for (const comp of this.slideComponents) {
      comp.unload();
    }
    this.slideComponents = [];
  }
}
