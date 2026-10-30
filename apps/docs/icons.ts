import type { IconNode } from "meowtail/icons";
import {
  BellRing,
  Blocks,
  Bot,
  Braces,
  CircleDashed,
  Compass,
  Component,
  FileText,
  House,
  LayoutDashboard,
  LayoutPanelLeft,
  Layers,
  MousePointerClick,
  Newspaper,
  Paintbrush,
  PanelsTopLeft,
  Presentation,
  Rows3,
  Shapes,
  SquareLibrary,
  TextCursorInput,
} from "meowtail/icons/lucide";
import { EXAMPLE_GROUP, FOUNDATIONS_GROUP, UNCATEGORIZED_GROUP } from "./catalog";

/**
 * The site's own wayfinding icons: one per entry page, package and catalog group. The sidebar,
 * the home page and the component index draw from the same map, so a place keeps one icon.
 */
export const PAGE_ICONS = {
  home: House,
  components: Blocks,
  gallery: LayoutPanelLeft,
} satisfies Record<string, IconNode>;

const PACKAGE_ICONS: Record<string, IconNode> = {
  meowjsx: Braces,
  meowcss: Paintbrush,
  meowtail: Component,
  meowslides: Presentation,
  meowbook: SquareLibrary,
  meowpress: Newspaper,
};

/**
 * The groups the site knows: the Meowtail component categories, then the site's own groups. A
 * category the catalog adds later falls back to a neutral shape.
 */
const GROUP_ICONS: Record<string, IconNode> = {
  "Pages and layout": PanelsTopLeft,
  Navigation: Compass,
  "Actions and commands": MousePointerClick,
  "Forms and selection": TextCursorInput,
  "Overlays and disclosure": Layers,
  "Records and surfaces": Rows3,
  "Content and inspection": FileText,
  "Feedback and labels": BellRing,
  "Agent and conversation": Bot,
  [FOUNDATIONS_GROUP]: Shapes,
  [EXAMPLE_GROUP]: LayoutDashboard,
  [UNCATEGORIZED_GROUP]: CircleDashed,
};

/** The icon of a documented package. */
export function packageIcon(name: string): IconNode {
  return PACKAGE_ICONS[name] ?? Component;
}

/** The icon of a catalog group. */
export function groupIcon(label: string): IconNode {
  return GROUP_ICONS[label] ?? Shapes;
}
