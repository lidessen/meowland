import { defineComponent, h, type Child, type ComponentContract, type Props } from "meowjsx";
import { StatusDot, type StatusDotProps } from "./status-dot";

export const statusContract = {
  name: "status",
  parts: ["root", "label"],
} as const satisfies ComponentContract;

export interface StatusProps extends Props {
  state?: StatusDotProps["state"];
  /** Supply visible, non-empty content, including when the Child is dynamic. */
  label: Exclude<Child, null | undefined | boolean>;
  size?: never;
  halo?: never;
  className?: string;
}

/** The state badge: a decorative dot and the state in a word or two, on a soft tint of the state's ink. Use as slot content; composed markers remain owned by WorkCard and Timeline. */
export const Status = defineComponent<
  StatusProps,
  typeof statusContract.name,
  (typeof statusContract.parts)[number]
>(statusContract, ({ state, label, className, children: _children, ...props }, context) =>
  context.part(
    "root",
    "span",
    { ...props, className, "data-tone": state ?? "unknown" },
    <StatusDot state={state} />,
    context.part("label", "span", null, label),
  ),
);
