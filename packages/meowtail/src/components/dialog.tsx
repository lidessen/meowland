import { defineComponent, h, type Child, type ComponentContract, type Props } from "meowjsx";
import { actionRowRef } from "../shared/action-row-fit";
import { PageFrame } from "./page-frame";

export const dialogContract = {
  name: "dialog",
  parts: ["root"],
} as const satisfies ComponentContract;

export interface DialogProps extends Props {
  labelledBy?: string;
  describedBy?: string;
  className?: string;
}

/** The native dialog element, themed; Modal builds a complete dialog on top of it. */
export const Dialog = defineComponent<
  DialogProps,
  typeof dialogContract.name,
  (typeof dialogContract.parts)[number]
>(dialogContract, ({ labelledBy, describedBy, className, children, ...props }, context) =>
  context.part(
    "root",
    "dialog",
    {
      ...props,
      className,
      "aria-labelledby": labelledBy,
      "aria-describedby": describedBy,
    },
    children,
  ),
);

export const dialogPanelContract = {
  name: "dialog-panel",
  parts: ["root"],
} as const satisfies ComponentContract;

export interface DialogPanelProps extends Props {
  as?: "div" | "form";
  header?: Child;
  className?: string;
}

/** The body of a dialog, with an optional header that stays in place while the body scrolls. */
export const DialogPanel = defineComponent<
  DialogPanelProps,
  typeof dialogPanelContract.name,
  (typeof dialogPanelContract.parts)[number]
>(dialogPanelContract, ({ as = "div", header, className, children, ...props }, context) =>
  context.part(
    "root",
    as,
    { ...props, className },
    h(PageFrame, { variant: "workspace", scrollOwner: "layout", header }, children),
  ),
);

export const dialogHeaderContract = {
  name: "dialog-header",
  parts: ["root", "identity", "eyebrow", "title", "description", "actions"],
} as const satisfies ComponentContract;

export interface DialogHeaderProps extends Props {
  title: Child;
  eyebrow?: Child;
  description?: Child;
  actions?: Child;
  titleId?: string;
  descriptionId?: string;
  className?: string;
}

/** The title block of a dialog: an optional eyebrow, the title, a description and actions. */
export const DialogHeader = defineComponent<
  DialogHeaderProps,
  typeof dialogHeaderContract.name,
  (typeof dialogHeaderContract.parts)[number]
>(
  dialogHeaderContract,
  ({ title, eyebrow, description, actions, titleId, descriptionId, className }, context) =>
    context.part(
      "root",
      "header",
      { className },
      context.part(
        "identity",
        "div",
        null,
        eyebrow ? context.part("eyebrow", "span", null, eyebrow) : null,
        context.part("title", "h2", titleId ? { id: titleId } : null, title),
        description
          ? context.part(
              "description",
              "p",
              descriptionId ? { id: descriptionId } : null,
              description,
            )
          : null,
      ),
      actions ? context.part("actions", "div", null, actions) : null,
    ),
);

export const dialogActionsContract = {
  name: "dialog-actions",
  parts: ["root"],
} as const satisfies ComponentContract;

export interface DialogActionsProps extends Props {
  className?: string;
}

/** The row of buttons that ends a dialog; it stacks whole when it does not fit, like ActionRow. */
export const DialogActions = defineComponent<
  DialogActionsProps,
  typeof dialogActionsContract.name,
  (typeof dialogActionsContract.parts)[number]
>(dialogActionsContract, ({ children, className, ...props }, context) =>
  context.part("root", "div", { ...props, className, ref: actionRowRef(props.ref) }, children),
);
