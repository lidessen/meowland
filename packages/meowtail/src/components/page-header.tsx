import { defineComponent, type Child, type ComponentContract, type Props } from "meowjsx";

export const pageHeaderContract = {
  name: "page-header",
  parts: ["root", "copy", "heading", "leading", "title", "description", "actions"],
} as const satisfies ComponentContract;

/** True when a slot was given; `false` and `null` mean the slot is omitted. */
function hasSlot(slot: Child | undefined): boolean {
  return slot !== undefined && slot !== null && slot !== false;
}

export interface PageHeaderProps extends Props {
  title: Child;
  description?: Child;
  titleId?: string;
  /**
   * A mark before the title, such as an icon. Presence is fixed for the mount:
   * omitting it, or passing `null` or `false`, keeps the title as a direct child
   * of the copy block.
   */
  leading?: Child;
  /** Switches and buttons that act on the whole page. */
  actions?: Child;
  className?: string;
}

/** The title block at the top of a full page: a name, one line of purpose, page-level actions. */
export const PageHeader = defineComponent<
  PageHeaderProps,
  typeof pageHeaderContract.name,
  (typeof pageHeaderContract.parts)[number]
>(
  pageHeaderContract,
  ({ title, description, titleId, leading, actions, className, ...props }, context) => {
    const titlePart = context.part("title", "h1", titleId ? { id: titleId } : null, title);
    return context.part(
      "root",
      "header",
      { ...props, className },
      context.part(
        "copy",
        "div",
        null,
        hasSlot(leading)
          ? context.part(
              "heading",
              "div",
              null,
              context.part("leading", "div", null, leading),
              titlePart,
            )
          : titlePart,
        hasSlot(description) ? context.part("description", "p", null, description) : null,
      ),
      hasSlot(actions) ? context.part("actions", "div", null, actions) : null,
    );
  },
);
