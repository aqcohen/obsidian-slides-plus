import {
  ViewPlugin,
  ViewUpdate,
  DecorationSet,
  Decoration,
  EditorView,
  WidgetType,
} from "@codemirror/view";
import { RangeSetBuilder, Text } from "@codemirror/state";

/**
 * CM6 ViewPlugin that replaces --- slide separators with visual dividers
 * showing the slide number. Only active in files with `slides: true` frontmatter.
 *
 * Handles:
 * - Per-slide frontmatter (Slidev-style ---/YAML/--- blocks)
 * - Code fences (``` / ~~~) — skips --- inside them
 */
export const slideSeparatorPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = this.buildDecorations(update.view);
      }
    }

    buildDecorations(view: EditorView): DecorationSet {
      const builder = new RangeSetBuilder<Decoration>();
      const doc = view.state.doc;
      const text = doc.toString();

      // Only activate for slides files
      const normalized = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").trimStart();
      if (!normalized.match(/^---\s*\n[\s\S]*?slides\s*:\s*["']?true["']?[\s\S]*?\n---/)) {
        return builder.finish();
      }

      let inGlobalFrontmatter = false;
      let pastGlobalFrontmatter = false;
      let inCodeFence = false;
      let slideNumber = 1;

      let i = 1;
      while (i <= doc.lines) {
        const line = doc.line(i);
        const trimmed = line.text.trim();

        // Global frontmatter tracking
        if (i === 1 && trimmed === "---") {
          inGlobalFrontmatter = true;
          i++;
          continue;
        }

        if (inGlobalFrontmatter && trimmed === "---") {
          inGlobalFrontmatter = false;
          pastGlobalFrontmatter = true;
          i++;
          continue;
        }

        if (inGlobalFrontmatter) {
          i++;
          continue;
        }

        if (!pastGlobalFrontmatter && i > 1) {
          pastGlobalFrontmatter = true;
        }

        // Track fenced code blocks (``` or ~~~)
        if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) {
          inCodeFence = !inCodeFence;
        }

        if (inCodeFence) {
          i++;
          continue;
        }

        // Slide separator
        if (pastGlobalFrontmatter && trimmed === "---") {
          slideNumber++;

          // Look ahead for per-slide frontmatter
          const fmResult = tryParseFrontmatterLines(doc, i + 1);
          if (fmResult) {
            // Opening --- gets the separator widget (single-line replace)
            builder.add(
              line.from,
              line.to,
              Decoration.replace({
                widget: new SlideSeparatorWidget(slideNumber, fmResult.summary),
              })
            );
            // Hide each YAML line and the closing --- individually
            // (CM6 plugins can't replace across line breaks)
            for (let j = i + 1; j <= fmResult.endLineNumber; j++) {
              const fmLine = doc.line(j);
              builder.add(fmLine.from, fmLine.to, Decoration.replace({}));
            }
            i = fmResult.endLineNumber + 1;
          } else {
            builder.add(
              line.from,
              line.to,
              Decoration.replace({
                widget: new SlideSeparatorWidget(slideNumber),
              })
            );
            i++;
          }
        } else {
          // Decorate single-line speaker note comments
          if (trimmed.startsWith("<!--") && trimmed.endsWith("-->")) {
            builder.add(
              line.from,
              line.from,
              Decoration.line({ attributes: { class: "sp-editor-note-line" } })
            );
          }
          i++;
        }
      }

      return builder.finish();
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);

/**
 * Look ahead from `startLineNum` (1-based) to see if consecutive lines
 * form per-slide frontmatter closed by `---`.
 * Mirrors tryParseFrontmatter() in slideParser.ts.
 */
function tryParseFrontmatterLines(
  doc: Text,
  startLineNum: number
): { endLineNumber: number; summary: string } | null {
  const keys: string[] = [];

  for (let i = startLineNum; i <= doc.lines; i++) {
    const trimmed = doc.line(i).text.trim();

    // Closing ---
    if (trimmed === "---") {
      if (keys.length === 0) return null; // empty = just another separator
      return { endLineNumber: i, summary: keys.join(", ") };
    }

    // Blank lines are OK inside frontmatter
    if (trimmed === "") continue;

    // Check YAML-like
    if (looksLikeYaml(trimmed)) {
      // Extract key for summary
      const colonIdx = trimmed.indexOf(":");
      if (colonIdx > 0) {
        const key = trimmed.slice(0, colonIdx).trim();
        const val = trimmed.slice(colonIdx + 1).trim();
        keys.push(val && val.length <= 20 ? `${key}: ${val}` : key);
      }
      // YAML comments (#) — skip, don't add to summary
    } else {
      return null; // Not YAML
    }
  }

  // Reached EOF without closing --- → not frontmatter
  return null;
}

/** Heuristic: does this line look like a YAML key: value pair or comment? */
function looksLikeYaml(line: string): boolean {
  if (line.startsWith("#")) return true;
  const colonIndex = line.indexOf(":");
  if (colonIndex <= 0) return false;
  const key = line.slice(0, colonIndex).trim();
  return /^[\w-]+$/.test(key);
}

class SlideSeparatorWidget extends WidgetType {
  constructor(
    private slideNumber: number,
    private frontmatterSummary?: string
  ) {
    super();
  }

  toDOM(): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.className = "sp-editor-separator";

    const line = document.createElement("div");
    line.className = "sp-editor-separator-line";

    const label = document.createElement("span");
    label.className = "sp-editor-separator-label";
    label.textContent = `Slide ${this.slideNumber}`;

    wrapper.appendChild(line);
    wrapper.appendChild(label);

    if (this.frontmatterSummary) {
      const badge = document.createElement("span");
      badge.className = "sp-editor-frontmatter";
      badge.textContent = `\u00b7 ${this.frontmatterSummary}`;
      wrapper.appendChild(badge);
    }

    return wrapper;
  }

  eq(other: SlideSeparatorWidget): boolean {
    return (
      this.slideNumber === other.slideNumber &&
      this.frontmatterSummary === other.frontmatterSummary
    );
  }
}
