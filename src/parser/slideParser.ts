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
 * - Slides are separated by --- on its own line (with blank lines around it)
 * - Per-slide frontmatter: --- block at the start of a slide
 * - Speaker notes: <!-- notes --> HTML comments
 */
export function parseDeck(markdown: string): SlidesDeck {
  const { globalFrontmatter, body } = extractGlobalFrontmatter(markdown);
  const globalConfig = parseGlobalConfig(globalFrontmatter);
  const rawSlides = splitSlides(body);

  const slides: Slide[] = rawSlides.map((raw, index) => {
    const { frontmatter, content } = extractSlideFrontmatter(raw);
    const { cleanContent, notes } = extractNotes(content);

    return {
      index,
      content: cleanContent.trim(),
      notes,
      frontmatter,
      raw,
    };
  });

  return { globalConfig, slides };
}

/**
 * Extract the global YAML frontmatter from the top of the document.
 * Returns the frontmatter object and the remaining body.
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
 * Split the markdown body into individual slide strings.
 * Slides are separated by --- on its own line with blank lines around it.
 * We use a pattern that matches --- surrounded by newlines to distinguish
 * from frontmatter --- or thematic breaks within content.
 */
function splitSlides(body: string): string[] {
  // Split on --- that is on its own line, preceded and followed by blank lines
  // This avoids matching frontmatter delimiters or inline horizontal rules
  const separator = /\n---\n/;
  const parts = body.split(separator);

  // Filter out empty slides but keep at least one
  const slides = parts.map((s) => s.trim()).filter((s) => s.length > 0);

  return slides.length > 0 ? slides : [""];
}

/**
 * Extract per-slide frontmatter from the beginning of a slide's content.
 * Per-slide frontmatter starts with --- and ends with ---.
 */
function extractSlideFrontmatter(
  slideContent: string
): { frontmatter: SlideFrontmatter; content: string } {
  const trimmed = slideContent.trimStart();
  if (!trimmed.startsWith("---")) {
    return { frontmatter: {}, content: slideContent };
  }

  const endIndex = trimmed.indexOf("\n---", 3);
  if (endIndex === -1) {
    return { frontmatter: {}, content: slideContent };
  }

  const yamlBlock = trimmed.slice(3, endIndex).trim();
  const content = trimmed.slice(endIndex + 4);
  const frontmatter = parseYamlSimple(yamlBlock) as SlideFrontmatter;

  return { frontmatter, content };
}

/**
 * Extract speaker notes from HTML comments.
 * Notes are in <!-- ... --> blocks.
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
 * This avoids pulling in a full YAML library.
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
    } else if (typeof value === "string" && !isNaN(Number(value)) && value !== "") {
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
  const lines = markdown.split("\n");
  let slideIndex = 0;

  // Account for global frontmatter
  let inFrontmatter = false;
  let pastFrontmatter = false;

  for (let i = 0; i < Math.min(line, lines.length); i++) {
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

    // Slide separator: --- on its own line
    if (pastFrontmatter && trimmed === "---") {
      slideIndex++;
    }

    if (!pastFrontmatter && i > 0) {
      pastFrontmatter = true;
    }
  }

  return slideIndex;
}
