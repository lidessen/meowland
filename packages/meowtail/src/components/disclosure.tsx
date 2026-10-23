import {
  defineComponent,
  h,
  type Child,
  type ComponentContract,
  type MaybeSignal,
  type Props,
} from "meowjsx";
import { Icon } from "../icons/icon";

export const disclosureContract = {
  name: "disclosure",
  parts: ["root", "summary", "icon", "content"],
} as const satisfies ComponentContract;

export interface DisclosureProps extends Props {
  summary: Child;
  open?: MaybeSignal<boolean>;
  onToggle?: (event: Event) => void;
  className?: string;
  summaryClassName?: string;
  contentClassName?: string;
}

/**
 * A section the reader can expand and collapse. Native details owns expansion and keyboard
 * behavior, independently of the theme.
 */
export const Disclosure = defineComponent<
  DisclosureProps,
  typeof disclosureContract.name,
  (typeof disclosureContract.parts)[number]
>(
  disclosureContract,
  ({ summary, children, className, summaryClassName, contentClassName, ...props }, context) =>
    context.part("root", "details", { ...props, className }, [
      context.part("summary", "summary", { className: summaryClassName }, [
        context.part("icon", "span", { "aria-hidden": "true" }, <Icon name="chevron-right" />),
        summary,
      ]),
      context.part("content", "div", { className: contentClassName }, children),
    ]),
);
