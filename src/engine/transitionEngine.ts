import { TransitionType } from "../types";

/**
 * Manages slide transitions using CSS animations (keyframes).
 *
 * Uses animations instead of CSS transitions because:
 * - No transitionend reliability issues (bubbling, missing events)
 * - No race conditions with rapid navigation
 * - Old slide removed immediately, no zombie elements
 */
export class TransitionEngine {
  private currentSlideEl: HTMLElement | null = null;
  private animatingEl: HTMLElement | null = null;

  /**
   * Transition to a new slide. Removes old slide immediately,
   * applies entry animation to the new slide.
   */
  show(
    container: HTMLElement,
    newSlideEl: HTMLElement,
    type: TransitionType,
    direction: "forward" | "backward"
  ): void {
    // Cancel any running animation on previous element
    if (this.animatingEl) {
      this.animatingEl.getAnimations().forEach((a) => a.cancel());
      this.animatingEl = null;
    }

    // Remove old slide immediately — no zombies
    if (this.currentSlideEl) {
      this.currentSlideEl.remove();
    }

    // Add new slide
    container.appendChild(newSlideEl);
    this.currentSlideEl = newSlideEl;

    if (type === "none") return;

    // Apply entry animation
    const animationClass = getAnimationClass(type, direction);
    if (animationClass) {
      newSlideEl.addClass(animationClass);
      this.animatingEl = newSlideEl;

      // Remove animation class when done so it doesn't interfere
      newSlideEl.addEventListener(
        "animationend",
        () => {
          newSlideEl.removeClass(animationClass);
          if (this.animatingEl === newSlideEl) {
            this.animatingEl = null;
          }
        },
        { once: true }
      );
    }
  }

  /**
   * Set a slide without any animation (initial render).
   */
  setImmediate(container: HTMLElement, slideEl: HTMLElement): void {
    if (this.currentSlideEl) this.currentSlideEl.remove();
    container.appendChild(slideEl);
    this.currentSlideEl = slideEl;
  }

  reset(): void {
    if (this.animatingEl) {
      this.animatingEl.getAnimations().forEach((a) => a.cancel());
    }
    this.currentSlideEl = null;
    this.animatingEl = null;
  }
}

function getAnimationClass(
  type: TransitionType,
  direction: "forward" | "backward"
): string {
  switch (type) {
    case "slide":
      return direction === "forward"
        ? "sp-anim-slide-from-right"
        : "sp-anim-slide-from-left";
    case "fade":
      return "sp-anim-fade-in";
    case "slide-up":
      return direction === "forward"
        ? "sp-anim-slide-from-bottom"
        : "sp-anim-slide-from-top";
    default:
      return "";
  }
}
