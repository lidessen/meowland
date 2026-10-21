import {
  defineComponent,
  derived,
  h,
  isSignal,
  unwrap,
  type Child,
  type ComponentContract,
  type MaybeSignal,
  type Props,
} from "meowjsx";

export const navListContract = {
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
} as const satisfies ComponentContract;

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
  className?: string;
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
export const NavList = defineComponent<
  NavListProps,
  typeof navListContract.name,
  (typeof navListContract.parts)[number]
>(navListContract, ({ label, groups, activeId, onSelect, className, ...props }, context) => {
  // The active id may be a Signal; each item binds one derived aria-current value.
  const currentFor = (id: string) =>
    isSignal(activeId)
      ? derived(() => (unwrap(activeId) === id ? "page" : undefined))
      : activeId === id
        ? "page"
        : undefined;

  const itemContent = (item: NavListItem) => [
    hasSlot(item.icon) ? context.part("icon", "span", null, item.icon) : null,
    context.part("label", "span", null, item.label),
    hasSlot(item.description) ? context.part("description", "span", null, item.description) : null,
    hasSlot(item.badge) ? context.part("badge", "span", null, item.badge) : null,
    hasSlot(item.meta) ? context.part("meta", "span", null, item.meta) : null,
  ];

  const itemNode = (item: NavListItem) => {
    // The active id is part of the item contract, so aria-current lives on both shapes.
    const current = currentFor(item.id);
    if (item.href !== undefined) {
      return context.part(
        "item",
        "a",
        {
          href: item.href,
          "aria-current": current,
          // A disabled anchor stays a link but leaves the tab order and activation.
          "aria-disabled": item.disabled ? "true" : undefined,
          tabIndex: item.disabled ? -1 : undefined,
          onClick: item.disabled ? (event: Event) => event.preventDefault() : undefined,
        },
        itemContent(item),
      );
    }
    return context.part(
      "item",
      "button",
      {
        type: "button",
        disabled: item.disabled === true,
        "aria-current": current,
        // The native disabled flag already blocks activation; the guard keeps it
        // true for programmatic activation as well.
        onClick: item.disabled ? undefined : () => onSelect?.(item),
      },
      itemContent(item),
    );
  };

  const groupNode = (group: NavListGroup) =>
    context.part(
      "group",
      "section",
      group.id ? { id: group.id } : null,
      hasSlot(group.label) ? context.part("groupTitle", "h2", null, group.label) : null,
      context.part(
        "list",
        "ul",
        null,
        group.items.map((item) => h("li", null, itemNode(item))),
      ),
    );

  return context.part(
    "root",
    "nav",
    { ...props, className, "aria-label": label },
    groups.map((group) => groupNode(group)),
  );
});
