import {
  h,
  defineComponent,
  type Child,
  type ComponentContract,
  type Props,
} from "meowjsx";
import { Icon } from "../icons/icon";

export const chatProcessContract = {
  name: "chat-process",
  parts: ["root", "summary", "icon", "expandedIcon", "label", "body"],
} as const satisfies ComponentContract;
export interface ChatProcessProps extends Props {
  label: string;
  icon?: Child;
  open?: boolean;
}
export const ChatProcess = defineComponent<
  ChatProcessProps,
  "chat-process",
  (typeof chatProcessContract.parts)[number]
>(chatProcessContract, ({ label, icon, children, open = false, ...props }, context) =>
  context.part(
    "root",
    "details",
    { ...props, open, "data-process-icon": icon ? "custom" : undefined },
    context.part(
      "summary",
      "summary",
      null,
      context.part(
        "icon",
        "span",
        { "aria-hidden": "true" },
        icon ?? <Icon name="chevron-right" />,
      ),
      icon
        ? context.part(
            "expandedIcon",
            "span",
            { "aria-hidden": "true" },
            <Icon name="chevron-up" />,
          )
        : null,
      context.part("label", "span", null, label),
    ),
    context.part("body", "div", null, children),
  ),
);
