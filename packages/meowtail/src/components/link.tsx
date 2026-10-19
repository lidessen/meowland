import { defineComponent, type ComponentContract, type Props } from "meowjsx";

export const linkContract = {
  name: "link",
  parts: ["root"],
} as const satisfies ComponentContract;

export interface LinkProps extends Props {
  href: string;
  className?: string;
}

/**
 * Themed inline text link. Whole-row references to an openable object stay with ResourceLink.
 */
export const Link = defineComponent<
  LinkProps,
  typeof linkContract.name,
  (typeof linkContract.parts)[number]
>(linkContract, ({ className, children, ...props }, context) =>
  context.part("root", "a", { ...props, className }, children),
);
