/**
 * Manages theme application on slide containers.
 * Themes are CSS classes applied to the root slide container.
 */
export class ThemeEngine {
  private currentTheme: string = "default";
  private styleEl: HTMLStyleElement | null = null;

  /**
   * Apply a theme to the slide container.
   */
  applyTheme(container: HTMLElement, theme: string): void {
    // Remove old theme class
    container.removeClass(`sp-theme-${this.currentTheme}`);
    // Add new theme class
    container.addClass(`sp-theme-${theme}`);
    this.currentTheme = theme;
  }

  getTheme(): string {
    return this.currentTheme;
  }

  destroy(): void {
    if (this.styleEl) {
      this.styleEl.remove();
      this.styleEl = null;
    }
  }
}
