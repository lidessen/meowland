import { h, type Context, type Props } from "meowjsx";
import { Icon } from "../icons/icon";

export interface ChatSourcesProps extends Props {
  items: readonly ChatSource[];
  label?: string;
}

export interface ChatSource {
  title: string;
  url: string;
  description?: string;
}

/** The sources an answer cites, as a collapsible list of links. */
export function ChatSources(
  { items, label = "Sources", ref, ...props }: ChatSourcesProps,
  context: Context<typeof ChatSources>,
) {
  const links = items.filter(({ url }) => {
    try {
      return ["http:", "https:"].includes(new URL(url).protocol);
    } catch {
      return false;
    }
  });
  if (!links.length) return null;
  const parts = context.parts;
  return (
    <details {...props} ref={[parts.root, ref]}>
      <summary ref={parts.summary}>
        <span aria-hidden="true" ref={parts.icon}>
          <Icon name="chevron-right" />
        </span>
        {`${label} · ${links.length}`}
      </summary>
      <ul ref={parts.list}>
        {links.map(({ title, url, description }) => (
          <li ref={parts.item}>
            <a href={url} target="_blank" rel="noreferrer" ref={parts.link}>
              {title}
            </a>
            {description ? <small ref={parts.description}>{description}</small> : null}
          </li>
        ))}
      </ul>
    </details>
  );
}

ChatSources.meta = {
  name: "chat-sources",
  parts: ["root", "summary", "icon", "list", "item", "link", "description"],
} as const;
