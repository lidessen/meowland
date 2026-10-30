import type { IconNode } from "meowtail/icons";
import {
  BellRing,
  Blocks,
  Bot,
  Braces,
  CircleDashed,
  ClipboardList,
  Component,
  House,
  LayoutDashboard,
  LayoutPanelLeft,
  Layers,
  MessagesSquare,
  MousePointerClick,
  Newspaper,
  Paintbrush,
  PanelsTopLeft,
  Presentation,
  Shapes,
  SquareLibrary,
  TextCursorInput,
  Type,
  Workflow,
} from "meowtail/icons/lucide";
import { EXAMPLE_GROUP, UNCATEGORIZED_GROUP } from "./catalog";

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

/** The story groups the site knows; a group a story adds later falls back to a neutral shape. */
const GROUP_ICONS: Record<string, IconNode> = {
  "Basic controls": MousePointerClick,
  Content: Type,
  "Form inputs": TextCursorInput,
  Forms: ClipboardList,
  "Conversation components": MessagesSquare,
  Assistant: Bot,
  "Agent process": Workflow,
  "Overlays and feedback": BellRing,
  "Navigation and layout": PanelsTopLeft,
  Foundations: Layers,
  "Icons and brand": Shapes,
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
