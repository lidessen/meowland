import { defineComponent, type Child, type ComponentContract, type Props } from "meowjsx";

export const chatHeaderContract = {
  name: "chat-header",
  parts: ["root", "identity", "eyebrow", "title", "description", "controls", "status", "actions"],
} as const satisfies ComponentContract;

export interface ChatHeaderProps extends Props {
  eyebrow?: string;
  title: string;
  description?: Child;
  status?: Child;
  actions?: Child;
  className?: string;
}

export const ChatHeader = defineComponent<
  ChatHeaderProps,
  typeof chatHeaderContract.name,
  (typeof chatHeaderContract.parts)[number]
>(
  chatHeaderContract,
  ({ eyebrow, title, description, status, actions, className, ...props }, context) =>
    context.part(
      "root",
      "header",
      { ...props, className },
      context.part("identity", "div", null, [
        eyebrow ? context.part("eyebrow", "span", null, eyebrow) : null,
        context.part("title", "h2", null, title),
        description ? context.part("description", "p", null, description) : null,
      ]),
      status || actions
        ? context.part("controls", "div", null, [
            status ? context.part("status", "div", null, status) : null,
            actions ? context.part("actions", "div", null, actions) : null,
          ])
        : null,
    ),
);
