import { defineComponent, type Child, type ComponentContract, type Props } from "meowjsx";

export const resourceCardContract = {
  name: "resource-card",
  parts: [
    "root",
    "head",
    "icon",
    "copy",
    "title",
    "subtitle",
    "status",
    "description",
    "actions",
    "identity",
  ],
} as const satisfies ComponentContract;

export interface ResourceCardProps extends Props {
  title: Child;
  /** What kind of thing it is, for example "Channel · 消息卡片". */
  subtitle?: Child;
  icon?: Child;
  /** The state in words with its dot. */
  status?: Child;
  description?: Child;
  actions?: Child;
  /** The checkable technical identity, shown in monospace and low weight. */
  identity?: Child;
  /** "muted" is something present but not running: a dashed outline and quieter text. */
  tone?: "default" | "muted";
  className?: string;
}

/** One prepared capability on an overview page: what it is, whether it runs, what to do next. */
export const ResourceCard = defineComponent<
  ResourceCardProps,
  typeof resourceCardContract.name,
  (typeof resourceCardContract.parts)[number]
>(
  resourceCardContract,
  (
    {
      title,
      subtitle,
      icon,
      status,
      description,
      actions,
      identity,
      tone = "default",
      className,
      children,
      ...props
    },
    context,
  ) =>
    context.part(
      "root",
      "article",
      { ...props, className, "data-tone": tone },
      context.part(
        "head",
        "div",
        null,
        icon ? context.part("icon", "span", { "aria-hidden": "true" }, icon) : null,
        context.part(
          "copy",
          "div",
          null,
          context.part("title", "h3", null, title),
          subtitle ? context.part("subtitle", "span", null, subtitle) : null,
        ),
        status ? context.part("status", "span", null, status) : null,
      ),
      description ? context.part("description", "p", null, description) : null,
      children,
      actions || identity
        ? context.part(
            "actions",
            "div",
            null,
            actions,
            identity ? context.part("identity", "span", null, identity) : null,
          )
        : null,
    ),
);
