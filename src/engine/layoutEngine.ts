import { LayoutType } from "../types";

export interface ContentSlot {
  name: string;
  content: string;
}

/**
 * Parse slide content for slot syntax and split into named slots.
 *
 * Slot syntax (Slidev-style):
 *   ::right::    — starts the "right" slot
 *   ::left::     — starts the "left" slot  (usually implicit as default)
 *   ::bottom::   — starts the "bottom" slot
 *
 * Content before any slot marker goes into the "default" slot.
 */
export function renderSlots(
  content: string,
  layout: LayoutType | string
): ContentSlot[] {
  // Layouts that support slots
  const slotLayouts = ["two-cols", "image-right", "image-left"];
  if (!slotLayouts.includes(layout)) {
    return [{ name: "default", content }];
  }

  const slotPattern = /^::(\w+)::\s*$/gm;
  const slots: ContentSlot[] = [];
  let lastIndex = 0;
  let currentName = "default";
  let match: RegExpExecArray | null;

  while ((match = slotPattern.exec(content)) !== null) {
    // Save content before this slot marker
    const slotContent = content.slice(lastIndex, match.index).trim();
    if (slotContent) {
      slots.push({ name: currentName, content: slotContent });
    }

    currentName = match[1];
    lastIndex = match.index + match[0].length;
  }

  // Remaining content
  const remaining = content.slice(lastIndex).trim();
  if (remaining) {
    slots.push({ name: currentName, content: remaining });
  }

  // If no slots were found, return single default slot
  if (slots.length === 0) {
    return [{ name: "default", content }];
  }

  return slots;
}

/**
 * Get CSS class for a layout type.
 */
export function getLayoutClass(layout: LayoutType | string): string {
  return `sp-layout-${layout}`;
}
