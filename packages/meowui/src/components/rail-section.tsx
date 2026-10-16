import {
  defineComponent,
  h,
  type Child,
  type ComponentContract,
  type Props,
} from "meowjsx";
import { RailItem } from "./rail-item";

export const railSectionContract = {
  name: "rail-section",
  parts: ["root", "heading", "items", "shortcut"],
} as const satisfies ComponentContract;

export interface RailSectionProps extends Props {
  /** Eyebrow shown while the rail is expanded, for example "扩展". */
  label: string;
  /** While collapsed, the whole section is this one icon, pointing at `href`. */
  icon: Child;
  href: string;
  className?: string;
}

/**
 * A group of related destinations that folds into one shortcut icon when the rail is collapsed.
 * The shortcut shows the current location and the attention dot of whichever child has them.
 */
export const RailSection = defineComponent<
  RailSectionProps,
  typeof railSectionContract.name,
  (typeof railSectionContract.parts)[number]
>(railSectionContract, ({ label, icon, href, className, children, ...props }, context) =>
  context.part(
    "root",
    "div",
    { ...props, className, role: "group", "aria-label": label },
    context.part("heading", "span", { "aria-hidden": "true" }, label),
    context.part("shortcut", "span", null, <RailItem label={label} icon={icon} href={href} />),
    context.part("items", "div", null, children),
  ),
);
