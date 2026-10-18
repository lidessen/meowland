import { defineComponent, type Child, type ComponentContract, type Props } from "meowjsx";

export const appBarContract = {
  name: "app-bar",
  parts: ["root", "identity", "title", "status", "actions"],
} as const satisfies ComponentContract;

export interface AppBarProps extends Props {
  title: Child;
  /** A short status line under the title, typically ChatStatus. */
  status?: Child;
  actions?: Child;
  className?: string;
}

/**
 * Compact application chrome: one title, one optional status line, and the
 * actions that belong to the whole screen. The page body keeps its own scroll.
 */
export const AppBar = defineComponent<
  AppBarProps,
  typeof appBarContract.name,
  (typeof appBarContract.parts)[number]
>(appBarContract, ({ title, status, actions, className, ...props }, context) =>
  context.part(
    "root",
    "header",
    { ...props, className },
    context.part(
      "identity",
      "div",
      null,
      context.part("title", "h1", null, title),
      status !== undefined && status !== null ? context.part("status", "div", null, status) : null,
    ),
    actions ? context.part("actions", "div", null, actions) : null,
  ),
);
