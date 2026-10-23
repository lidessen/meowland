import { defineComponent, h, type Child, type Props } from "meowjsx";
import { EmptyStack } from "../icons/empty-stack";
import { defineOptions } from "meowcss";
import { defineStyleProps, type StyledComponentContract, type ThemedProps } from "meowcss/meowjsx";

export const emptyStateOptions = defineOptions("empty-state", { size: ["default", "compact"] });

export const emptyStateContract = {
  name: "empty-state",
  parts: ["root", "illustration", "title", "description", "action"],
  styleProps: defineStyleProps(emptyStateOptions, { defaults: { size: "default" } }),
} as const satisfies StyledComponentContract;

export interface EmptyStateProps extends Props, ThemedProps<typeof emptyStateOptions> {
  title: string;
  copy?: string;
  action?: Child;
  /**
   * Artwork above the title. Omitted uses `EmptyStack`. `null` and `false` leave
   * the illustration part out. Presence is fixed for the mount.
   */
  illustration?: Child;
  className?: string;
}

/**
 * What a region shows while it has nothing: artwork, a title, a line of help and an optional next
 * step.
 */
export const EmptyState = defineComponent<
  EmptyStateProps,
  typeof emptyStateContract.name,
  (typeof emptyStateContract.parts)[number]
>(emptyStateContract, ({ title, copy, action, illustration, className, ...props }, context) => {
  const art = illustration === undefined ? <EmptyStack /> : illustration;
  return context.part(
    "root",
    "div",
    { ...props, className },
    art !== null && art !== false ? context.part("illustration", "div", null, art) : null,
    context.part("title", "strong", null, title),
    copy ? context.part("description", "span", null, copy) : null,
    action ? context.part("action", "div", null, action) : null,
  );
});
