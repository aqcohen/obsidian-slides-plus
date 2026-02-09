import { loadMathJax, renderMath, finishRenderMath } from "obsidian";

/**
 * Ensures LaTeX math expressions render correctly in custom views.
 *
 * Obsidian's MarkdownRenderer.render() should handle math automatically,
 * but in some contexts (e.g., dynamically created DOM elements), we need
 * to explicitly trigger MathJax rendering.
 */
export async function ensureMathRendered(
  container: HTMLElement
): Promise<void> {
  await loadMathJax();

  // Find unrendered math elements (MathJax adds .MathJax class after processing)
  const mathEls = container.querySelectorAll(
    ".math-inline:not(.is-loaded), .math-display:not(.is-loaded)"
  );

  if (mathEls.length === 0) return;

  for (const el of Array.from(mathEls)) {
    const mathText = el.getAttribute("data-math") || el.textContent || "";
    const isDisplay = el.classList.contains("math-display");
    (el as HTMLElement).empty();
    // renderMath(source, display) returns an HTMLElement
    const rendered = renderMath(mathText, isDisplay);
    el.appendChild(rendered);
    el.classList.add("is-loaded");
  }

  await finishRenderMath();
}
