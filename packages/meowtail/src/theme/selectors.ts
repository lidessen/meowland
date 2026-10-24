import { css } from "meowcss/meowjsx";
import type { PartDescriptor } from "meowjsx";

/** Serialize one typed part descriptor for selectors assembled outside a CSS template. */
export function selectorForPart(part: PartDescriptor): string {
  return css`
    ${part}
  `.text.trim();
}
