import {
  derived,
  h,
  isSignal,
  unwrap,
  type Child,
  type MaybeSignal,
  type Props,
  type Context,
} from "meowjsx";

export interface NavListItem {
  id: string;
  label: Child;
  /** When given, the item renders as an anchor and navigates through the host's router. */
  href?: string;
  icon?: Child;
  badge?: Child;
  meta?: Child;
  description?: Child;
  /** Disabled items keep their place but are not focusable and ignore activation. */
  disabled?: boolean;
}

export interface NavListGroup {
  /** Optional id for the group element, for example an in-page anchor target. */
  id?: string;
  /** Optional group title rendered above the list. */
  label?: Child;
  items: readonly NavListItem[];
}

export interface NavListProps extends Props {
  /** The navigation landmark name, rendered as the nav element's `aria-label`. */
  label: string;
  /**
   * The groups and items to render. Fixed for the mount: the list is built once
   * and a later array change is ignored. The host owns filtering and rebuilding.
   */
  groups: readonly NavListGroup[];
  /** The active item id. Pass a Signal to keep `aria-current="page"` live. */
  activeId?: MaybeSignal<string>;
  /**
   * Called with the item when an item without `href` is activated. Items with
   * `href` navigate through their anchor; routing and search filtering stay with
   * the host.
   */
  onSelect?: (item: NavListItem) => void;
  className?: Props["className"];
}

/** True when a slot was given; `false` and `null` mean the slot is omitted. */
function hasSlot(slot: Child): boolean {
  return slot !== undefined && slot !== null && slot !== false;
}

/**
 * Data-first site navigation: labelled groups of links and actions that own the
 * grouping, the active location and the link/button semantics. The host owns
 * routing, search filtering and what an item points at.
 */
export function NavList(
  { label, groups, activeId, onSelect, className, ...props }: NavListProps,
  context: Context<typeof NavList>,
) {
  // The active id may be a Signal; each item binds one derived aria-current value.
  const currentFor = (id: string) =>
    isSignal(activeId)
      ? derived(() => (unwrap(activeId) === id ? "page" : undefined))
      : activeId === id
        ? "page"
        : undefined;

  const itemContent = (item: NavListItem) => [
    hasSlot(item.icon) ? <span ref={[context.parts.icon]}>{item.icon}</span> : null,
    <span ref={[context.parts.label]}>{item.label}</span>,
    hasSlot(item.description) ? (
      <span ref={[context.parts.description]}>{item.description}</span>
    ) : null,
    hasSlot(item.badge) ? <span ref={[context.parts.badge]}>{item.badge}</span> : null,
    hasSlot(item.meta) ? <span ref={[context.parts.meta]}>{item.meta}</span> : null,
  ];

  const itemNode = (item: NavListItem) => {
    // The active id is part of the item contract, so aria-current lives on both shapes.
    const current = currentFor(item.id);
    if (item.href !== undefined) {
      return (
        <a
          href={item.href}
          aria-current={current}
          /* A disabled anchor stays a link but leaves the tab order and activation. */ aria-disabled={
            item.disabled ? "true" : undefined
          }
          tabIndex={item.disabled ? -1 : undefined}
          onClick={item.disabled ? (event: Event) => event.preventDefault() : undefined}
          ref={[context.parts.item]}
        >
          {itemContent(item)}
        </a>
      );
    }
    return (
      <button
        type={"button"}
        disabled={item.disabled === true}
        aria-current={current}
        /* The native disabled flag already blocks activation; the guard keeps it */ /* true for programmatic activation as well. */ onClick={
          item.disabled ? undefined : () => onSelect?.(item)
        }
        ref={[context.parts.item]}
      >
        {itemContent(item)}
      </button>
    );
  };

  const groupNode = (group: NavListGroup) => (
    <section id={group.id ? group.id : undefined} ref={[context.parts.group]}>
      {hasSlot(group.label) ? <h2 ref={[context.parts.groupTitle]}>{group.label}</h2> : null}
      {
        <ul ref={[context.parts.list]}>
          {group.items.map((item) => h("li", null, itemNode(item)))}
        </ul>
      }
    </section>
  );

  return (
    <nav {...props} className={className} aria-label={label} ref={[context.parts.root, props.ref]}>
      {groups.map((group) => groupNode(group))}
    </nav>
  );
}
NavList.meta = {
  name: "nav-list",
  parts: [
    "root",
    "group",
    "groupTitle",
    "list",
    "item",
    "icon",
    "label",
    "badge",
    "meta",
    "description",
  ],
} as const;
