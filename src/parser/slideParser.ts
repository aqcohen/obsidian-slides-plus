import {
  Slide,
  SlidesDeck,
  DeckConfig,
  SlideFrontmatter,
  DEFAULT_DECK_CONFIG,
} from "../types";

/**
 * Parse a markdown string into a SlidesDeck.
 *
 * Format:
 * - Global frontmatter (YAML between first --- pair) sets deck config
 * - Slides are separated by --- on its own line
 * - Per-slide frontmatter: YAML lines immediately after a --- separator,
 *   closed by another --- (Slidev-style)
 * - Speaker notes: <!-- ... --> HTML comments
 */
export function parseDeck(markdown: string): SlidesDeck {
  const normalized = markdown.replace(/\r\n/g, "\n");
  const { globalFrontmatter, body } = extractGlobalFrontmatter(normalized);
  const globalConfig = parseGlobalConfig(globalFrontmatter);
  const rawSlides = parseSlides(body);

  const slides: Slide[] = rawSlides.map((raw, index) => {
    const { cleanContent, notes } = extractNotes(raw.content);

    return {
      index,
      content: cleanContent.trim(),
      notes,
      frontmatter: raw.frontmatter,
      raw: raw.raw,
    };
  });

  return { globalConfig, slides };
}

interface RawSlide {
  frontmatter: SlideFrontmatter;
  content: string;
  raw: string;
}

/**
 * Extract the global YAML frontmatter from the top of the document.
 */
function extractGlobalFrontmatter(
  markdown: string
): { globalFrontmatter: Record<string, unknown>; body: string } {
  const trimmed = markdown.trimStart();
  if (!trimmed.startsWith("---")) {
    return { globalFrontmatter: {}, body: markdown };
  }

  const endIndex = trimmed.indexOf("\n---", 3);
  if (endIndex === -1) {
    return { globalFrontmatter: {}, body: markdown };
  }

  const yamlBlock = trimmed.slice(3, endIndex).trim();
  const body = trimmed.slice(endIndex + 4);
  const globalFrontmatter = parseYamlSimple(yamlBlock);

  return { globalFrontmatter, body };
}

/**
 * Parse the body into slides by scanning line-by-line.
 *
 * A --- on its own line is a slide separator.
 * If YAML-like lines follow a separator and are closed by another ---,
 * those lines are per-slide frontmatter for the next slide.
 *
 * Example:
 *   # Slide 1 content
 *   ---                         ← separator
 *   layout: cover               ← per-slide frontmatter
 *   background: linear-gradient(...)
 *   ---                         ← closes frontmatter
 *   # Slide 2 content           ← slide 2 body
 */
function parseSlides(body: string): RawSlide[] {
  const lines = body.split("\n");
  const slides: RawSlide[] = [];

  let currentContent: string[] = [];
  let currentFrontmatter: SlideFrontmatter = {};
  let currentRaw: string[] = [];
  let inCodeFence = false;

  let i = 0;

  // Skip leading blank lines
  while (i < lines.length && lines[i].trim() === "") i++;

  while (i < lines.length) {
    const line = lines[i];

    // Track fenced code blocks (``` or ~~~)
    if (line.trim().startsWith("```") || line.trim().startsWith("~~~")) {
      inCodeFence = !inCodeFence;
    }

    if (!inCodeFence && line.trim() === "---") {
      // This is a slide separator. Save current slide.
      const contentStr = currentContent.join("\n");
      if (contentStr.trim() || slides.length === 0) {
        slides.push({
          frontmatter: currentFrontmatter,
          content: contentStr,
          raw: currentRaw.join("\n"),
        });
      }

      // Reset for next slide
      currentContent = [];
      currentFrontmatter = {};
      currentRaw = [line];
      i++;

      // Look ahead: is there per-slide frontmatter?
      const fmResult = tryParseFrontmatter(lines, i);
      if (fmResult) {
        currentFrontmatter = fmResult.frontmatter;
        currentRaw.push(...lines.slice(i, fmResult.endIndex + 1));
        i = fmResult.endIndex + 1;
      }
    } else {
      currentContent.push(line);
      currentRaw.push(line);
      i++;
    }
  }

  // Don't forget the last slide
  const lastContent = currentContent.join("\n");
  if (lastContent.trim() || slides.length === 0) {
    slides.push({
      frontmatter: currentFrontmatter,
      content: lastContent,
      raw: currentRaw.join("\n"),
    });
  }

  return slides;
}

/**
 * Try to parse per-slide frontmatter starting at line index `start`.
 * Returns the parsed frontmatter and the index of the closing ---,
 * or null if it's not valid frontmatter.
 *
 * Valid frontmatter: consecutive lines that look like "key: value",
 * terminated by a line that is exactly "---".
 */
function tryParseFrontmatter(
  lines: string[],
  start: number
): { frontmatter: SlideFrontmatter; endIndex: number } | null {
  // Collect lines until we hit --- or a non-YAML line
  const yamlLines: string[] = [];

  for (let i = start; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    // Closing ---
    if (trimmed === "---") {
      if (yamlLines.length === 0) return null; // empty frontmatter = just another separator
      const frontmatter = parseYamlSimple(
        yamlLines.join("\n")
      ) as SlideFrontmatter;
      return { frontmatter, endIndex: i };
    }

    // Blank lines are OK inside frontmatter
    if (trimmed === "") {
      yamlLines.push(lines[i]);
      continue;
    }

    // Check if this looks like a YAML key:value line
    if (looksLikeYaml(trimmed)) {
      yamlLines.push(lines[i]);
    } else {
      // Not YAML — this isn't frontmatter
      return null;
    }
  }

  // Reached end of file without closing --- → not frontmatter
  return null;
}

/**
 * Heuristic: does this line look like a YAML key: value pair?
 */
function looksLikeYaml(line: string): boolean {
  // Comments
  if (line.startsWith("#")) return true;
  // Must have a colon with a key before it
  const colonIndex = line.indexOf(":");
  if (colonIndex <= 0) return false;
  // Key should be a simple identifier (letters, numbers, hyphens, underscores)
  const key = line.slice(0, colonIndex).trim();
  return /^[\w-]+$/.test(key);
}

/**
 * Extract speaker notes from HTML comments.
 */
function extractNotes(
  content: string
): { cleanContent: string; notes: string } {
  const notePattern = /<!--\s*([\s\S]*?)\s*-->/g;
  const noteBlocks: string[] = [];

  const cleanContent = content.replace(notePattern, (_match, noteText) => {
    noteBlocks.push(noteText.trim());
    return "";
  });

  return {
    cleanContent,
    notes: noteBlocks.join("\n\n"),
  };
}

/**
 * Merge parsed frontmatter into DeckConfig with defaults.
 */
function parseGlobalConfig(
  frontmatter: Record<string, unknown>
): DeckConfig {
  return {
    theme:
      typeof frontmatter.theme === "string"
        ? frontmatter.theme
        : DEFAULT_DECK_CONFIG.theme,
    transition:
      typeof frontmatter.transition === "string"
        ? (frontmatter.transition as DeckConfig["transition"])
        : DEFAULT_DECK_CONFIG.transition,
    aspectRatio:
      typeof frontmatter.aspectRatio === "string"
        ? frontmatter.aspectRatio
        : DEFAULT_DECK_CONFIG.aspectRatio,
    highlightStyle:
      typeof frontmatter.highlightStyle === "string"
        ? frontmatter.highlightStyle
        : DEFAULT_DECK_CONFIG.highlightStyle,
  };
}

/**
 * Simple YAML parser for flat key-value pairs.
 * Handles: strings, numbers, booleans. No nested objects or arrays.
 */
function parseYamlSimple(yaml: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const line of yaml.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) continue;

    const key = trimmed.slice(0, colonIndex).trim();
    let value: unknown = trimmed.slice(colonIndex + 1).trim();

    // Remove surrounding quotes
    if (
      typeof value === "string" &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = (value as string).slice(1, -1);
    } else if (value === "true") {
      value = true;
    } else if (value === "false") {
      value = false;
    } else if (
      typeof value === "string" &&
      !isNaN(Number(value)) &&
      value !== ""
    ) {
      value = Number(value);
    }

    result[key] = value;
  }

  return result;
}

/**
 * Find which slide index the cursor is in, given a line number.
 * Used to sync editor cursor position with preview panel.
 */
export function getSlideIndexAtLine(
  markdown: string,
  line: number
): number {
  const normalized = markdown.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  let slideIndex = 0;
  let inGlobalFrontmatter = false;
  let pastGlobalFrontmatter = false;
  let inSlideFrontmatter = false;
  let inCodeFence = false;

  for (let i = 0; i < Math.min(line, lines.length); i++) {
    const trimmed = lines[i].trim();

    // Track global frontmatter
    if (i === 0 && trimmed === "---") {
      inGlobalFrontmatter = true;
      continue;
    }
    if (inGlobalFrontmatter && trimmed === "---") {
      inGlobalFrontmatter = false;
      pastGlobalFrontmatter = true;
      continue;
    }
    if (inGlobalFrontmatter) continue;

    if (!pastGlobalFrontmatter && i > 0) {
      pastGlobalFrontmatter = true;
    }

    // Track fenced code blocks (``` or ~~~)
    if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) {
      inCodeFence = !inCodeFence;
    }
    if (inCodeFence) continue;

    // Track per-slide frontmatter (skip the closing ---)
    if (inSlideFrontmatter) {
      if (trimmed === "---") {
        inSlideFrontmatter = false;
      }
      continue;
    }

    // Slide separator
    if (pastGlobalFrontmatter && trimmed === "---") {
      slideIndex++;
      // Check if next lines are per-slide frontmatter
      if (i + 1 < lines.length && looksLikeYaml(lines[i + 1].trim())) {
        inSlideFrontmatter = true;
      }
    }
  }

  return slideIndex;
}
