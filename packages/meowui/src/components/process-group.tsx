import { defineComponent, h, type Child, type ComponentContract, type Props } from "meowjsx";
import { Icon } from "../icons/icon";

export const processGroupContract = {
  name: "process-group",
  parts: ["root", "summary", "chevron", "title", "status", "trailing", "body"],
} as const satisfies ComponentContract;

export interface ProcessGroupProps extends Props {
  /** The group's name and size, for example "过程 · 3 步". */
  title: Child;
  /** Outcome in words, for example "已完成 · 4.2s". */
  status?: Child;
  /** Right-aligned summary of the steps, usually one StatusDot per step. */
  trailing?: Child;
  open?: boolean;
  className?: string;
}

/** Collapsible record of what the assistant did; native details owns expansion and keyboard. */
export const ProcessGroup = defineComponent<
  ProcessGroupProps,
  typeof processGroupContract.name,
  (typeof processGroupContract.parts)[number]
>(
  processGroupContract,
  ({ title, status, trailing, open = false, children, className, ...props }, context) =>
    context.part(
      "root",
      "details",
      { ...props, className, open },
      context.part(
        "summary",
        "summary",
        null,
        context.part("chevron", "span", { "aria-hidden": "true" }, <Icon name="chevron-right" />),
        context.part("title", "strong", null, title),
        status ? context.part("status", "span", null, status) : null,
        trailing ? context.part("trailing", "span", { "aria-hidden": "true" }, trailing) : null,
      ),
      context.part("body", "div", null, children),
    ),
);
