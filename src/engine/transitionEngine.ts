import { TransitionType } from "../types";

/**
 * Manages CSS-based slide transitions.
 * Transitions are pure CSS — no JS animation library needed.
 */
export class TransitionEngine {
  private currentSlideEl: HTMLElement | null = null;

  /**
   * Transition from the current slide to a new one.
   * Returns a promise that resolves when the transition completes.
   */
  async transition(
    container: HTMLElement,
    newSlideEl: HTMLElement,
    type: TransitionType,
    direction: "forward" | "backward"
  ): Promise<void> {
    const oldSlideEl = this.currentSlideEl;

    if (!oldSlideEl || type === "none") {
      // No transition: just swap
      if (oldSlideEl) oldSlideEl.remove();
      container.appendChild(newSlideEl);
      this.currentSlideEl = newSlideEl;
      return;
    }

    // Set up transition classes
    const transitionClass = `sp-transition-${type}`;
    const dirClass = `sp-dir-${direction}`;

    // Position new slide for entry
    newSlideEl.addClass(transitionClass, dirClass, "sp-entering");
    container.appendChild(newSlideEl);

    // Force reflow so the initial position is applied
    newSlideEl.offsetHeight;

    // Start the transition
    oldSlideEl.addClass(transitionClass, dirClass, "sp-leaving");
    newSlideEl.removeClass("sp-entering");
    newSlideEl.addClass("sp-active");

    // Wait for transition to complete
    await waitForTransition(newSlideEl);

    // Clean up old slide
    oldSlideEl.remove();
    newSlideEl.removeClass(transitionClass, dirClass, "sp-active");

    this.currentSlideEl = newSlideEl;
  }

  /**
   * Set a slide without transition (for initial render).
   */
  setImmediate(container: HTMLElement, slideEl: HTMLElement): void {
    if (this.currentSlideEl) this.currentSlideEl.remove();
    container.appendChild(slideEl);
    this.currentSlideEl = slideEl;
  }

  reset(): void {
    this.currentSlideEl = null;
  }
}

function waitForTransition(el: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const handler = () => {
      el.removeEventListener("transitionend", handler);
      resolve();
    };
    el.addEventListener("transitionend", handler);

    // Fallback timeout in case transitionend doesn't fire
    setTimeout(resolve, 600);
  });
}
