import { defineOptions } from "meowcss";
import { defineStyleProps, type StyledComponentContract, type ThemedProps } from "meowcss/meowjsx";
import { defineComponent, type Props } from "meowjsx";

export const iconButtonOptions = defineOptions("icon-button", {
  size: ["small", "default", "large"],
});

export const iconButtonContract = {
  name: "icon-button",
  parts: ["root"],
  styleProps: defineStyleProps(iconButtonOptions, { defaults: { size: "default" } }),
} as const satisfies StyledComponentContract;

export interface IconButtonProps extends Props, ThemedProps<typeof iconButtonOptions> {
  label: string;
  className?: string;
}

export const IconButton = defineComponent<
  IconButtonProps,
  typeof iconButtonContract.name,
  (typeof iconButtonContract.parts)[number]
>(iconButtonContract, ({ children, className, label, ...props }, context) =>
  context.part(
    "root",
    "button",
    {
      ...props,
      type: props.type ?? "button",
      className,
      "aria-label": label,
    },
    children,
  ),
);
