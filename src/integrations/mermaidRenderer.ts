/**
 * Ensures Mermaid diagrams render correctly in custom views.
 *
 * Obsidian's MarkdownRenderer.render() handles Mermaid code blocks
 * automatically through its built-in post-processor pipeline.
 *
 * This module provides a fallback for cases where the built-in
 * rendering doesn't trigger (e.g., in iframes or detached DOM).
 */
export async function ensureMermaidRendered(
  container: HTMLElement
): Promise<void> {
  // Find unrendered mermaid code blocks
  const codeBlocks = container.querySelectorAll(
    'code.language-mermaid:not([data-mermaid-rendered])'
  );

  if (codeBlocks.length === 0) return;

  // Dynamically import mermaid (it's bundled with Obsidian)
  let mermaid: { render: (id: string, text: string) => Promise<{ svg: string }> };
  try {
    mermaid = await import("mermaid");
    mermaid = (mermaid as unknown as { default: typeof mermaid }).default || mermaid;
  } catch {
    // Mermaid not available — Obsidian's built-in renderer will handle it
    return;
  }

  for (let i = 0; i < codeBlocks.length; i++) {
    const codeEl = codeBlocks[i] as HTMLElement;
    const source = codeEl.textContent || "";
    const preEl = codeEl.parentElement;
    if (!preEl) continue;

    try {
      const id = `sp-mermaid-${Date.now()}-${i}`;
      const { svg } = await mermaid.render(id, source);

      const wrapper = document.createElement("div");
      wrapper.className = "sp-mermaid-diagram";
      wrapper.innerHTML = svg;

      preEl.replaceWith(wrapper);
    } catch (e) {
      console.warn("Slides Plus: Mermaid render failed", e);
      codeEl.setAttribute("data-mermaid-rendered", "error");
    }
  }
}
