import { h, defineComponent, type ComponentContract, type Props } from "meowjsx";
import { Icon } from "../icons/icon";

export const chatSourcesContract = {
  name: "chat-sources",
  parts: ["root", "summary", "icon", "list", "item", "link", "description"],
} as const satisfies ComponentContract;

export interface ChatSource {
  title: string;
  url: string;
  description?: string;
}
export interface ChatSourcesProps extends Props {
  items: readonly ChatSource[];
  label?: string;
}
/** The sources an answer cites, as a collapsible list of links. */
export const ChatSources = defineComponent<
  ChatSourcesProps,
  "chat-sources",
  (typeof chatSourcesContract.parts)[number]
>(chatSourcesContract, ({ items, label = "Sources", ...props }, context) => {
  const links = items.filter(({ url }) => {
    try {
      return ["http:", "https:"].includes(new URL(url).protocol);
    } catch {
      return false;
    }
  });
  if (!links.length) return null;
  return context.part(
    "root",
    "details",
    props,
    context.part(
      "summary",
      "summary",
      null,
      context.part("icon", "span", { "aria-hidden": "true" }, <Icon name="chevron-right" />),
      `${label} · ${links.length}`,
    ),
    context.part(
      "list",
      "ul",
      null,
      links.map(({ title, url, description }) =>
        context.part(
          "item",
          "li",
          null,
          context.part("link", "a", { href: url, target: "_blank", rel: "noreferrer" }, title),
          description ? context.part("description", "small", null, description) : null,
        ),
      ),
    ),
  );
});
