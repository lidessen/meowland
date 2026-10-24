import { h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { NavList, type NavListGroup, type NavListItem } from "../../src/components";

const items: readonly NavListItem[] = [
  {
    id: "page",
    label: "Page",
    href: "/components/page",
    icon: "P",
    badge: "New",
    meta: "12",
    description: "The content page composition.",
  },
  { id: "palette", label: "Open command palette" },
  { id: "blocked", label: "Blocked workspace", href: "/blocked", disabled: true },
];

const groups: readonly NavListGroup[] = [
  { id: "components", label: "Components", items },
  { items: [{ id: "home", label: "Home", href: "/" }] },
];

const navList: JSX.Element = (
  <NavList
    label="Documentation"
    groups={groups}
    activeId="page"
    onSelect={(item) => {
      const id: string = item.id;
      void id;
    }}
  />
);
const liveActive: JSX.Element = (
  <NavList label="Documentation" groups={groups} activeId={signal("page")} />
);
void navList;
void liveActive;

// @ts-expect-error The navigation landmark needs its accessible name.
const missingLabel: JSX.Element = <NavList groups={groups} />;
void missingLabel;

// @ts-expect-error Groups are required; an empty array is a valid value.
const missingGroups: JSX.Element = <NavList label="Navigation" />;
void missingGroups;

// @ts-expect-error Every item needs an id for activeId and onSelect to match.
const missingItemId: NavListItem = { label: "Home", href: "/" };
void missingItemId;
