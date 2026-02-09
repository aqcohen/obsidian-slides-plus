import {
  ViewPlugin,
  ViewUpdate,
  DecorationSet,
  Decoration,
  EditorView,
  WidgetType,
} from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";

/**
 * CM6 ViewPlugin that replaces --- slide separators with visual dividers
 * showing the slide number. Only active in files with `slides: true` frontmatter.
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
      if (!text.match(/^---\s*\n[\s\S]*?slides\s*:\s*true[\s\S]*?\n---/)) {
        return builder.finish();
      }

      // Find slide separator lines (--- on its own line, after the frontmatter)
      let inFrontmatter = false;
      let pastFrontmatter = false;
      let slideNumber = 1;

      for (let i = 1; i <= doc.lines; i++) {
        const line = doc.line(i);
        const trimmed = line.text.trim();

        if (i === 1 && trimmed === "---") {
          inFrontmatter = true;
          continue;
        }

        if (inFrontmatter && trimmed === "---") {
          inFrontmatter = false;
          pastFrontmatter = true;
          continue;
        }

        if (inFrontmatter) continue;

        if (!pastFrontmatter && i > 1) {
          pastFrontmatter = true;
        }

        // Slide separator
        if (pastFrontmatter && trimmed === "---") {
          slideNumber++;
          builder.add(
            line.from,
            line.to,
            Decoration.replace({
              widget: new SlideSeparatorWidget(slideNumber),
            })
          );
        }
      }

      return builder.finish();
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);

class SlideSeparatorWidget extends WidgetType {
  constructor(private slideNumber: number) {
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

    return wrapper;
  }

  eq(other: SlideSeparatorWidget): boolean {
    return this.slideNumber === other.slideNumber;
  }
}
