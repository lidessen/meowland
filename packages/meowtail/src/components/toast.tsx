import { defineComponent, type Child, type ComponentContract, type Props } from "meowjsx";

export const toastContract = {
  name: "toast",
  parts: ["root", "icon", "message", "actions"],
} as const satisfies ComponentContract;
export interface ToastProps extends Props {
  message: Child;
  icon?: Child;
  actions?: Child;
  role?: "status" | "alert";
  className?: string;
}
/**
 * A short notice that appears over the page. Host owns visibility, lifetime and placement; mounting
 * does not schedule timers.
 */
export const Toast = defineComponent<ToastProps, "toast", (typeof toastContract.parts)[number]>(
  toastContract,
  ({ message, icon, actions, role = "status", className, ...props }, context) =>
    context.part(
      "root",
      "div",
      { ...props, role, "aria-atomic": "true", className },
      icon ? context.part("icon", "span", { "aria-hidden": "true" }, icon) : null,
      context.part("message", "div", null, message),
      actions ? context.part("actions", "div", null, actions) : null,
    ),
);
