import {
  createContext,
  defineComponent,
  h,
  useContext,
  type Child,
  type ComponentContract,
  type Props,
} from "meowjsx";
import { Card } from "./card";

/**
 * The authoring region's heading depth. `Page` provides 1, so a direct `Section`
 * with a title renders h2; each titled `Section` provides the level it rendered,
 * so a nested one renders h3. A title-less grouping section passes the level
 * through unchanged, and a section mounted outside a page falls back to 1.
 */
export const sectionLevelContext = createContext(1);

export const sectionContract = {
  name: "section",
  parts: ["root", "header", "title", "description", "actions", "content", "footer"],
} as const satisfies ComponentContract;

export type SectionVariant = "plain" | "card";

export interface SectionProps extends Props {
  /**
   * The section heading, rendered at the level the surrounding region grants it:
   * h2 under `Page`, h3 where a section is nested in another section.
   * Omitted only when the section is a pure grouping wrapper; a grouping wrapper
   * does not consume a heading level, so its titled children keep the depth of
   * the surrounding region.
   */
  title?: Child;
  /** One line of supporting copy under the heading. */
  description?: Child;
  /** Section-level actions on the heading row; they wrap under it when it is narrow. */
  actions?: Child;
  /** A supporting note or action row after the content. */
  footer?: Child;
  /**
   * `plain` keeps the page rhythm; `card` wraps the plain section in the existing
   * Card surface. Fixed for the mount: the surface is chosen when the section
   * mounts, so pass a new key or remount to switch variants.
   */
  variant?: SectionVariant;
  className?: string;
}

/** True when a slot was given; `false` and `null` mean the slot is omitted. */
function hasSlot(slot: Child): boolean {
  return slot !== undefined && slot !== null && slot !== false;
}

/**
 * One titled region inside a page or a card surface. Slots are fixed for the
 * mount: presence decides whether the header or footer renders, while a Signal
 * passed as slot content still updates the text it carries.
 */
export const Section = defineComponent<
  SectionProps,
  typeof sectionContract.name,
  (typeof sectionContract.parts)[number]
>(
  sectionContract,
  (
    { title, description, actions, footer, variant = "plain", className, children, ...props },
    context,
  ) => {
    // The context reads once at setup. Only a section that renders a heading
    // consumes a level; a grouping wrapper passes the parent level through, so
    // its titled children keep the surrounding depth (Page h1 -> grouped h2)
    // instead of skipping a level.
    const parentLevel = useContext(sectionLevelContext);
    const hasTitle = hasSlot(title);
    const level = hasTitle ? Math.min(parentLevel + 1, 6) : parentLevel;
    const heading = `h${level}`;
    const header = hasTitle || hasSlot(description) || hasSlot(actions);
    const content = h(
      sectionLevelContext.Provider,
      { value: level },
      context.part("content", "div", null, children),
      hasSlot(footer) ? context.part("footer", "footer", null, footer) : null,
    );
    const section = context.part(
      "root",
      "section",
      { ...props, "data-variant": variant, className },
      header
        ? context.part(
            "header",
            "header",
            null,
            hasTitle ? context.part("title", heading, null, title) : null,
            hasSlot(description) ? context.part("description", "p", null, description) : null,
            hasSlot(actions) ? context.part("actions", "div", null, actions) : null,
          )
        : null,
      content,
    );
    // The card variant only adds the Card surface around the plain section; the
    // section keeps its own parts and the surface keeps its single owner.
    return variant === "card" ? h(Card, { variant: "surface" }, section) : section;
  },
);
