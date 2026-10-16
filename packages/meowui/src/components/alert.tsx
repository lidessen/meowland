import { defineComponent, type Child, type Props } from "meowjsx";
import { defineOptions } from "meowcss";
import { defineStyleProps, type StyledComponentContract, type ThemedProps } from "meowcss/meowjsx";

export const alertOptions = defineOptions("alert", {
  tone: ["info", "success", "warning", "danger"],
});

export const alertContract = {
  name: "alert",
  parts: ["root", "title", "body", "actions"],
  styleProps: defineStyleProps(alertOptions, {
    defaults: { tone: "info" },
    parts: ["root", "title"],
  }),
} as const satisfies StyledComponentContract;
export interface AlertProps extends Props, ThemedProps<typeof alertOptions> {
  title?: Child;
  role?: "status" | "alert";
  actions?: Child;
  className?: string;
}
/** Urgency is explicit, independent of the visual tone. */
export const Alert = defineComponent<AlertProps, "alert", "root" | "title" | "body" | "actions">(
  alertContract,
  ({ title, role = "status", actions, children, className, ...props }, context) =>
    context.part(
      "root",
      "div",
      { ...props, className, role, "aria-atomic": "true" },
      title ? context.part("title", "strong", null, title) : null,
      context.part("body", "div", null, children),
      actions ? context.part("actions", "div", null, actions) : null,
    ),
);
