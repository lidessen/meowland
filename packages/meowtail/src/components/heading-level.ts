import { createContext, useContext } from "meowjsx";

/**
 * The authoring region's heading depth. `Page` provides 1, so a direct `Section`
 * with a title renders h2; each titled `Section` provides the level it rendered,
 * so a nested one renders h3. A title-less grouping section passes the level
 * through unchanged, and a section mounted outside a page falls back to 1.
 */
export const sectionLevelContext = createContext(1);

/** The level for a heading one step below the surrounding region; read during setup. */
export function nestedHeadingLevel(): number {
  return Math.min(useContext(sectionLevelContext) + 1, 6);
}
