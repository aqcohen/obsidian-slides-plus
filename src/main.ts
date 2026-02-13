import { Plugin, MarkdownView, Notice } from "obsidian";
import {
  PREVIEW_VIEW_TYPE,
  PRESENTATION_VIEW_TYPE,
  PRESENTER_VIEW_TYPE,
} from "./types";
import { parseDeck, getSlideIndexAtLine } from "./parser/slideParser";
import { PreviewPanel } from "./views/previewPanel";
import { PresentationView } from "./views/presentationView";
import { PresenterView } from "./views/presenterView";
import { SlideNavigator, NAVIGATOR_VIEW_TYPE } from "./views/slideNavigator";
import { PdfExporter } from "./export/pdfExporter";
import { slideSeparatorPlugin } from "./editor/slideDecorations";
import {
  SlidesPluginSettings,
  DEFAULT_SETTINGS,
  SlidesSettingTab,
} from "./settings";
import { isSlidesFile } from "./utils";

export default class SlidesPlugin extends Plugin {
  settings: SlidesPluginSettings = DEFAULT_SETTINGS;
  private googleFontsEl: HTMLLinkElement | null = null;

  async onload(): Promise<void> {
    await this.loadSettings();

    // Load Google Fonts for themes that need them (e.g., Academic)
    this.googleFontsEl = document.createElement("link");
    this.googleFontsEl.rel = "stylesheet";
    this.googleFontsEl.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;700&family=Outfit:wght@400;600;700&family=Newsreader:opsz,wght@6..72,400;6..72,600;6..72,700&family=Source+Serif+4:wght@400;600;700&family=Syne:wght@400;700;800&family=Work+Sans:wght@400;500;600&family=Poppins:wght@400;600;700&family=Lora:wght@400;600;700&display=swap";
    document.head.appendChild(this.googleFontsEl);

    // Register views
    this.registerView(
      PREVIEW_VIEW_TYPE,
      (leaf) => new PreviewPanel(leaf)
    );
    this.registerView(
      PRESENTATION_VIEW_TYPE,
      (leaf) => new PresentationView(leaf)
    );
    this.registerView(
      PRESENTER_VIEW_TYPE,
      (leaf) => new PresenterView(leaf)
    );
    this.registerView(
      NAVIGATOR_VIEW_TYPE,
      (leaf) => new SlideNavigator(leaf)
    );

    // Register editor extension for slide separator decorations
    this.registerEditorExtension([slideSeparatorPlugin]);

    // Strip per-slide frontmatter rendered as Setext h2 in reading view.
    // Markdown interprets "key: value\n---" as an <h2>, so we detect
    // h2 elements whose text is all YAML key:value lines and remove them.
    this.registerMarkdownPostProcessor((el, ctx) => {
      if (!ctx.frontmatter?.slides) return;

      el.querySelectorAll("h2").forEach((h2) => {
        const text = h2.textContent?.trim();
        if (!text) return;

        const lines = text.split("\n");
        const allYaml = lines.every((l) => {
          const t = l.trim();
          return !t || /^[\w-]+\s*:/.test(t);
        });

        if (allYaml && lines.some((l) => /^[\w-]+\s*:/.test(l.trim()))) {
          h2.remove();
        }
      });
    });

    // Register commands
    this.addCommand({
      id: "start-presentation",
      name: "Start presentation",
      checkCallback: (checking) => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) return false;
        const content = view.editor.getValue();
        if (!isSlidesFile(content)) return false;
        if (checking) return true;
        this.startPresentation(view);
        return true;
      },
    });

    this.addCommand({
      id: "start-presentation-with-presenter",
      name: "Start presentation with presenter view",
      checkCallback: (checking) => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) return false;
        const content = view.editor.getValue();
        if (!isSlidesFile(content)) return false;
        if (checking) return true;
        this.startPresentation(view, true);
        return true;
      },
    });

    this.addCommand({
      id: "open-preview",
      name: "Open slide preview panel",
      checkCallback: (checking) => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) return false;
        if (checking) return true;
        this.openPreviewPanel();
        return true;
      },
    });

    this.addCommand({
      id: "export-pdf",
      name: "Export slides to PDF",
      checkCallback: (checking) => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) return false;
        const content = view.editor.getValue();
        if (!isSlidesFile(content)) return false;
        if (checking) return true;
        this.exportPdf(view);
        return true;
      },
    });

    this.addCommand({
      id: "next-slide",
      name: "Go to next slide",
      checkCallback: (checking) => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) return false;
        const content = view.editor.getValue();
        if (!isSlidesFile(content)) return false;
        if (checking) return true;
        this.navigateSlide(view, 1);
        return true;
      },
    });

    this.addCommand({
      id: "prev-slide",
      name: "Go to previous slide",
      checkCallback: (checking) => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) return false;
        const content = view.editor.getValue();
        if (!isSlidesFile(content)) return false;
        if (checking) return true;
        this.navigateSlide(view, -1);
        return true;
      },
    });

    this.addCommand({
      id: "insert-slide",
      name: "Insert new slide separator",
      editorCallback: (editor) => {
        const cursor = editor.getCursor();
        editor.replaceRange("\n\n---\n\n", { line: cursor.line, ch: editor.getLine(cursor.line).length });
      },
    });

    this.addCommand({
      id: "open-navigator",
      name: "Open slide navigator",
      checkCallback: (checking) => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) return false;
        if (checking) return true;
        this.openNavigator();
        return true;
      },
    });

    // Ribbon icon
    this.addRibbonIcon("presentation", "Slides Plus", () => {
      const view = this.app.workspace.getActiveViewOfType(MarkdownView);
      if (view && isSlidesFile(view.editor.getValue())) {
        this.startPresentation(view);
      } else {
        new Notice("Open a slides file first (needs slides: true in frontmatter)");
      }
    });

    // Settings tab
    this.addSettingTab(new SlidesSettingTab(this.app, this));

    // Auto-open preview when opening slides files
    if (this.settings.autoOpenPreview) {
      this.registerEvent(
        this.app.workspace.on("file-open", (file) => {
          if (!file) return;
          // Debounce: check after a short delay to let the file load
          setTimeout(async () => {
            const view = this.app.workspace.getActiveViewOfType(MarkdownView);
            if (!view) return;
            const content = view.editor.getValue();
            if (isSlidesFile(content)) {
              this.openPreviewPanel();
            }
          }, 200);
        })
      );
    }
  }

  onunload(): void {
    this.googleFontsEl?.remove();
    this.googleFontsEl = null;

    // Detach all plugin views
    this.app.workspace.detachLeavesOfType(PREVIEW_VIEW_TYPE);
    this.app.workspace.detachLeavesOfType(PRESENTATION_VIEW_TYPE);
    this.app.workspace.detachLeavesOfType(PRESENTER_VIEW_TYPE);
    this.app.workspace.detachLeavesOfType(NAVIGATOR_VIEW_TYPE);
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.loadData()
    );
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  private async startPresentation(
    view: MarkdownView,
    withPresenter: boolean = false
  ): Promise<void> {
    const content = view.editor.getValue();
    const deck = parseDeck(content);
    const sourcePath = view.file?.path || "";
    const cursor = view.editor.getCursor();
    const startIndex = getSlideIndexAtLine(content, cursor.line);

    // Open presentation in a new leaf (takes full space)
    const leaf = this.app.workspace.getLeaf("tab");
    await leaf.setViewState({
      type: PRESENTATION_VIEW_TYPE,
      active: true,
    });

    const presView = leaf.view as PresentationView;

    // Optionally open presenter view and wire up sync
    if (withPresenter) {
      const presenterLeaf = this.app.workspace.getLeaf("split");
      await presenterLeaf.setViewState({
        type: PRESENTER_VIEW_TYPE,
        active: false,
      });

      const presenterView = presenterLeaf.view as PresenterView;
      await presenterView.setDeck(deck, sourcePath, startIndex);

      // Wire presenter sync: when presentation navigates, update presenter
      presView.onSlideChange = (index: number, fragmentStep: number) => {
        presenterView.syncToSlide(index, fragmentStep);
      };
    }

    await presView.setDeck(deck, sourcePath, startIndex);
  }

  private async openPreviewPanel(): Promise<void> {
    const existing = this.app.workspace.getLeavesOfType(PREVIEW_VIEW_TYPE);
    if (existing.length > 0) {
      this.app.workspace.revealLeaf(existing[0]);
      return;
    }

    const leaf = this.app.workspace.getRightLeaf(false);
    if (!leaf) return;
    await leaf.setViewState({
      type: PREVIEW_VIEW_TYPE,
      active: true,
    });
    this.app.workspace.revealLeaf(leaf);
  }

  private async exportPdf(view: MarkdownView): Promise<void> {
    const content = view.editor.getValue();
    const deck = parseDeck(content);
    const sourcePath = view.file?.path || "";

    const exporter = new PdfExporter(this.app);
    await exporter.export(deck, sourcePath);
  }

  private navigateSlide(view: MarkdownView, delta: number): void {
    const content = view.editor.getValue();
    const cursor = view.editor.getCursor();
    const currentIndex = getSlideIndexAtLine(content, cursor.line);
    const deck = parseDeck(content);
    const targetIndex = currentIndex + delta;

    if (targetIndex < 0 || targetIndex >= deck.slides.length) return;

    // Find the line number where the target slide starts
    const lines = content.split("\n");
    let slideIndex = 0;
    let inFrontmatter = false;
    let pastFrontmatter = false;

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

      if (!pastFrontmatter && i > 0) {
        pastFrontmatter = true;
      }

      if (pastFrontmatter && trimmed === "---") {
        slideIndex++;
        if (slideIndex === targetIndex) {
          // Move cursor to one line after the separator
          const targetLine = Math.min(i + 1, lines.length - 1);
          view.editor.setCursor({ line: targetLine, ch: 0 });
          view.editor.scrollIntoView({
            from: { line: targetLine, ch: 0 },
            to: { line: targetLine, ch: 0 },
          });
          return;
        }
      }
    }

    // If target is the first slide, go to start of content
    if (targetIndex === 0) {
      // Find the end of global frontmatter
      let line = 0;
      if (lines[0]?.trim() === "---") {
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim() === "---") {
            line = i + 1;
            break;
          }
        }
      }
      view.editor.setCursor({ line, ch: 0 });
      view.editor.scrollIntoView({
        from: { line, ch: 0 },
        to: { line, ch: 0 },
      });
    }
  }

  private async openNavigator(): Promise<void> {
    const existing = this.app.workspace.getLeavesOfType(NAVIGATOR_VIEW_TYPE);
    if (existing.length > 0) {
      this.app.workspace.revealLeaf(existing[0]);
      return;
    }

    const leaf = this.app.workspace.getRightLeaf(false);
    if (!leaf) return;
    await leaf.setViewState({
      type: NAVIGATOR_VIEW_TYPE,
      active: true,
    });
    this.app.workspace.revealLeaf(leaf);
  }

}
