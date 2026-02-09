import { ItemView, WorkspaceLeaf, Component } from "obsidian";
import {
  PRESENTATION_VIEW_TYPE,
  SlidesDeck,
  TransitionType,
} from "../types";
import { SlideRenderEngine } from "../engine/renderEngine";
import { TransitionEngine } from "../engine/transitionEngine";
import { ThemeEngine } from "../engine/themeEngine";

/**
 * Fullscreen presentation view.
 * Renders one slide at a time with transitions and keyboard navigation.
 */
export class PresentationView extends ItemView {
  private deck: SlidesDeck | null = null;
  private sourcePath: string = "";
  private currentIndex: number = 0;
  private renderEngine!: SlideRenderEngine;
  private transitionEngine: TransitionEngine;
  private themeEngine: ThemeEngine;
  private slideArea: HTMLElement | null = null;
  private slideComponents: Component[] = [];
  private boundKeyHandler: (e: KeyboardEvent) => void;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    this.transitionEngine = new TransitionEngine();
    this.themeEngine = new ThemeEngine();
    this.boundKeyHandler = this.handleKeydown.bind(this);
  }

  getViewType(): string {
    return PRESENTATION_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Presentation";
  }

  getIcon(): string {
    return "monitor";
  }

  async onOpen(): Promise<void> {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("sp-presentation-root");

    // Create slide area
    this.slideArea = contentEl.createDiv({ cls: "sp-presentation-stage" });

    // Progress bar
    contentEl.createDiv({ cls: "sp-progress-bar" }).createDiv({
      cls: "sp-progress-fill",
    });

    // Keyboard navigation
    document.addEventListener("keydown", this.boundKeyHandler);

    // Click to advance (left half = back, right half = forward)
    this.slideArea.addEventListener("click", (e) => {
      const rect = this.slideArea!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      if (x < rect.width / 3) {
        this.navigate(-1);
      } else {
        this.navigate(1);
      }
    });

    // Render first slide if deck is set
    if (this.deck) {
      await this.renderCurrentSlide(false);
    }
  }

  async onClose(): Promise<void> {
    document.removeEventListener("keydown", this.boundKeyHandler);
    this.cleanupComponents();
    this.transitionEngine.reset();
    this.themeEngine.destroy();
  }

  /**
   * Set the deck data and start presenting.
   */
  async setDeck(
    deck: SlidesDeck,
    sourcePath: string,
    startIndex: number = 0
  ): Promise<void> {
    this.deck = deck;
    this.sourcePath = sourcePath;
    this.currentIndex = startIndex;
    this.renderEngine = new SlideRenderEngine(this.app, sourcePath);

    if (this.slideArea) {
      this.themeEngine.applyTheme(
        this.slideArea,
        deck.globalConfig.theme
      );
      await this.renderCurrentSlide(false);
    }
  }

  private async navigate(delta: number): Promise<void> {
    if (!this.deck) return;
    const newIndex = this.currentIndex + delta;
    if (newIndex < 0 || newIndex >= this.deck.slides.length) return;

    this.currentIndex = newIndex;
    await this.renderCurrentSlide(true, delta > 0 ? "forward" : "backward");
  }

  private async renderCurrentSlide(
    withTransition: boolean,
    direction: "forward" | "backward" = "forward"
  ): Promise<void> {
    if (!this.deck || !this.slideArea) return;

    const slide = this.deck.slides[this.currentIndex];

    // Render the new slide into a temp container
    const tempContainer = createDiv({ cls: "sp-slide-container" });
    const component = await this.renderEngine.renderSlide(
      slide,
      tempContainer,
      this.deck.globalConfig
    );
    this.slideComponents.push(component);

    // Get the actual slide element (renderSlide creates it inside the container)
    const slideEl = tempContainer;

    if (withTransition) {
      const transitionType =
        slide.frontmatter.transition || this.deck.globalConfig.transition;
      await this.transitionEngine.transition(
        this.slideArea,
        slideEl,
        transitionType as TransitionType,
        direction
      );
    } else {
      this.transitionEngine.setImmediate(this.slideArea, slideEl);
    }

    this.updateProgressBar();
  }

  private handleKeydown(e: KeyboardEvent): void {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
      case " ":
      case "PageDown":
        e.preventDefault();
        this.navigate(1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
      case "PageUp":
        e.preventDefault();
        this.navigate(-1);
        break;
      case "Home":
        e.preventDefault();
        this.goToSlide(0);
        break;
      case "End":
        e.preventDefault();
        if (this.deck) this.goToSlide(this.deck.slides.length - 1);
        break;
      case "Escape":
        e.preventDefault();
        this.exitPresentation();
        break;
      case "f":
        e.preventDefault();
        this.toggleFullscreen();
        break;
    }
  }

  private async goToSlide(index: number): Promise<void> {
    if (!this.deck) return;
    if (index < 0 || index >= this.deck.slides.length) return;
    const direction = index > this.currentIndex ? "forward" : "backward";
    this.currentIndex = index;
    await this.renderCurrentSlide(true, direction);
  }

  private updateProgressBar(): void {
    if (!this.deck) return;
    const fill = this.contentEl.querySelector(
      ".sp-progress-fill"
    ) as HTMLElement;
    if (fill) {
      const progress =
        ((this.currentIndex + 1) / this.deck.slides.length) * 100;
      fill.style.width = `${progress}%`;
    }
  }

  private exitPresentation(): void {
    this.leaf.detach();
  }

  private toggleFullscreen(): void {
    const el = this.contentEl.parentElement;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen();
    }
  }

  private cleanupComponents(): void {
    for (const comp of this.slideComponents) {
      comp.unload();
    }
    this.slideComponents = [];
  }
}
