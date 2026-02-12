/**
 * Code block processor for line numbers, static highlights, and dynamic
 * click-through highlights (Slidev-compatible syntax).
 *
 * Syntax in fence info string after the language:
 *   ```ts {lines}            → line numbers only
 *   ```ts {1,3-5}            → static highlight lines 1, 3, 4, 5
 *   ```ts {lines,1,3-5}      → line numbers + static highlights
 *   ```ts {1-3|5-7}          → dynamic: step 1 highlights 1-3, step 2 highlights 5-7
 *   ```ts {lines,1-3|5-7|*}  → line numbers + dynamic highlights (* = all lines)
 */

export interface CodeMeta {
  lines: boolean;
  highlights: number[];
  steps: number[][]; // each sub-array = line numbers for that step; -1 = wildcard (*)
}

interface ExtractResult {
  cleanedMarkdown: string;
  codeMetas: CodeMeta[];
}

// Matches opening code fences with metadata: ```lang {stuff}
const FENCE_META_RE = /^(`{3,}|~{3,})(\w*)\s*(\{[^}]*\})\s*$/gm;

/**
 * Pre-processing: extract `{...}` metadata from code fence openers,
 * strip it so Obsidian renders the fence normally.
 */
export function extractCodeFenceMeta(markdown: string): ExtractResult {
  const codeMetas: CodeMeta[] = [];
  const cleanedMarkdown = markdown.replace(
    FENCE_META_RE,
    (_match, fence, lang, metaBlock) => {
      codeMetas.push(parseMeta(metaBlock));
      return `${fence}${lang}`;
    }
  );
  return { cleanedMarkdown, codeMetas };
}

/**
 * Parse a `{...}` metadata block into a CodeMeta.
 * Examples: {lines}, {1,3-5}, {lines,1-3|5-7|*}
 */
function parseMeta(raw: string): CodeMeta {
  // Strip braces
  const inner = raw.slice(1, -1).trim();
  if (!inner) return { lines: false, highlights: [], steps: [] };

  let lines = false;
  const highlights: number[] = [];
  const steps: number[][] = [];

  // Split on comma, but not within pipe-groups
  // e.g. "lines,1-3|5-7|*" → ["lines", "1-3|5-7|*"]
  const parts = inner.split(",").map((s) => s.trim()).filter(Boolean);

  for (const part of parts) {
    if (part === "lines") {
      lines = true;
      continue;
    }

    // Check if this part contains pipes → dynamic steps
    if (part.includes("|")) {
      const stepParts = part.split("|");
      for (const sp of stepParts) {
        steps.push(parseLineSpec(sp.trim()));
      }
    } else {
      // Static highlight
      const nums = parseLineSpec(part);
      highlights.push(...nums);
    }
  }

  return { lines, highlights, steps };
}

/**
 * Parse a line spec like "1", "3-5", or "*".
 * Returns array of line numbers (1-based). -1 represents wildcard (*).
 */
function parseLineSpec(spec: string): number[] {
  if (spec === "*") return [-1];

  const rangeMatch = spec.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1], 10);
    const end = parseInt(rangeMatch[2], 10);
    const result: number[] = [];
    for (let i = start; i <= end; i++) result.push(i);
    return result;
  }

  const num = parseInt(spec, 10);
  if (!isNaN(num)) return [num];

  return [];
}

/**
 * Post-processing: wrap code block lines in divs, apply line numbers
 * and highlight metadata.
 */
export function processCodeBlocks(
  container: HTMLElement,
  metas: CodeMeta[]
): void {
  const codeBlocks = container.querySelectorAll<HTMLElement>("pre > code");
  for (let i = 0; i < codeBlocks.length && i < metas.length; i++) {
    const codeEl = codeBlocks[i];
    const meta = metas[i];
    const preEl = codeEl.parentElement as HTMLElement;

    // Split code into lines
    const lineArrays = wrapCodeLines(codeEl);
    const lineCount = lineArrays.length;

    // Rebuild DOM
    codeEl.empty();

    for (let lineIdx = 0; lineIdx < lineCount; lineIdx++) {
      const lineNum = lineIdx + 1;
      const lineDiv = codeEl.createDiv({ cls: "sp-code-line" });
      lineDiv.dataset.line = String(lineNum);

      // Line numbers
      if (meta.lines) {
        lineDiv.classList.add("sp-code-line-numbered");
        const numSpan = lineDiv.createSpan({ cls: "sp-line-number" });
        numSpan.textContent = String(lineNum);
      }

      // Append the content nodes for this line
      const contentSpan = lineDiv.createSpan({ cls: "sp-line-content" });
      for (const node of lineArrays[lineIdx]) {
        contentSpan.appendChild(node);
      }

      // Static highlights
      if (meta.highlights.includes(lineNum)) {
        lineDiv.classList.add("sp-line-highlight");
      }
    }

    // Dynamic highlights (steps)
    if (meta.steps.length > 0) {
      preEl.classList.add("sp-has-highlight-steps");
      preEl.dataset.highlightSteps = JSON.stringify(meta.steps);

      // Resolve wildcard (*) → all line numbers
      const resolvedSteps = meta.steps.map((step) =>
        step.includes(-1)
          ? Array.from({ length: lineCount }, (_, i) => i + 1)
          : step
      );
      preEl.dataset.highlightStepsResolved = JSON.stringify(resolvedSteps);

      // Create hidden step markers as fragment targets
      for (let s = 0; s < meta.steps.length; s++) {
        const marker = preEl.createDiv({ cls: "sp-code-step-marker sp-fragment" });
        marker.dataset.stepIndex = String(s);
        marker.dataset.stepLines = JSON.stringify(resolvedSteps[s]);
      }
    }
  }
}

/**
 * Walk code element's child nodes and split into per-line arrays.
 * Handles Prism token spans that cross line boundaries by cloning them.
 */
function wrapCodeLines(codeEl: HTMLElement): Node[][] {
  const lines: Node[][] = [[]];

  function processNode(node: Node): void {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      const segments = text.split("\n");
      for (let i = 0; i < segments.length; i++) {
        if (i > 0) lines.push([]); // Start new line
        if (segments[i].length > 0) {
          lines[lines.length - 1].push(document.createTextNode(segments[i]));
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const text = el.textContent || "";

      if (!text.includes("\n")) {
        // No line break — push whole node
        lines[lines.length - 1].push(el.cloneNode(true));
      } else {
        // Token spans across line boundaries — clone per segment
        const segments = text.split("\n");
        for (let i = 0; i < segments.length; i++) {
          if (i > 0) lines.push([]);
          if (segments[i].length > 0) {
            const clone = el.cloneNode(false) as HTMLElement;
            clone.textContent = segments[i];
            lines[lines.length - 1].push(clone);
          }
        }
      }
    }
  }

  // Process all direct children
  const children = Array.from(codeEl.childNodes);
  for (const child of children) {
    processNode(child);
  }

  // Remove trailing empty line if the code ends with \n
  if (lines.length > 1 && lines[lines.length - 1].length === 0) {
    lines.pop();
  }

  return lines;
}

/**
 * Shared fragment visibility update. Handles both list-item fragments
 * and code block dynamic highlight stepping.
 *
 * Called from presentationView, presenterView, and presenterView's renderCurrentState.
 */
export function updateFragments(
  container: HTMLElement,
  fragmentStep: number
): void {
  const fragments =
    container.querySelectorAll<HTMLElement>(".sp-fragment");

  // 1. Toggle visibility on all list-item fragments
  fragments.forEach((el) => {
    if (el.classList.contains("sp-code-step-marker")) return;
    const idx = parseInt(el.dataset.fragmentIndex || "0", 10);
    el.classList.toggle("sp-fragment-visible", idx < fragmentStep);
  });

  // 2. Handle code block dynamic highlights (spotlight mode)
  const steppedBlocks =
    container.querySelectorAll<HTMLElement>("pre.sp-has-highlight-steps");

  for (const preEl of Array.from(steppedBlocks)) {
    const codeEl = preEl.querySelector("code");
    if (!codeEl) continue;

    const resolvedSteps: number[][] = JSON.parse(
      preEl.dataset.highlightStepsResolved || "[]"
    );

    // Find the highest active step index
    let activeStepLines: number[] | null = null;
    const markers = preEl.querySelectorAll<HTMLElement>(".sp-code-step-marker");

    for (const marker of Array.from(markers)) {
      const idx = parseInt(marker.dataset.fragmentIndex || "0", 10);
      const stepIdx = parseInt(marker.dataset.stepIndex || "0", 10);
      if (idx < fragmentStep && stepIdx < resolvedSteps.length) {
        activeStepLines = resolvedSteps[stepIdx];
      }
    }

    // Clear all active highlights
    const allLines = codeEl.querySelectorAll<HTMLElement>(".sp-code-line");
    allLines.forEach((line) => line.classList.remove("sp-line-active"));

    if (activeStepLines) {
      preEl.classList.add("sp-code-has-active-step");
      for (const line of Array.from(allLines)) {
        const lineNum = parseInt(line.dataset.line || "0", 10);
        if (activeStepLines.includes(lineNum)) {
          line.classList.add("sp-line-active");
        }
      }
    } else {
      preEl.classList.remove("sp-code-has-active-step");
    }
  }
}
