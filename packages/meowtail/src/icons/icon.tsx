// Fragment is required by the classic JSX transform for the local settings group.
// eslint-disable-next-line no-unused-vars
import { h, Fragment, type Child } from "meowjsx";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Brain,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  ExternalLink,
  Eye,
  File,
  FileText,
  Folder,
  FolderOpen,
  Gauge,
  History,
  List,
  ListChecks,
  LoaderCircle,
  Map,
  Mic,
  Menu,
  MessageSquare,
  Minus,
  Network,
  NotebookTabs,
  PanelLeft,
  Paperclip,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Square,
  Terminal,
  Timer,
  UserRound,
  Wrench,
  X,
  Database,
  type IconNode,
} from "lucide";
import { IconFrame } from "./icon-frame";

function renderNodes(nodes: IconNode): Child {
  return nodes.map(([tag, attrs]) => h(tag, attrs));
}

// Local optical tuning: the upstream gear reads larger and rounder at the
// standard theme's 16px icon size, so the semantic set keeps this adjustment.
const settings = () => (
  <>
    <path
      d="M9.5 3h5l.6 2.5 2.2 1.3 2.5-.7 2.5 4.3-1.9 1.8v2.6l1.9 1.8-2.5 4.3-2.5-.7-2.2 1.3-.6 2.5h-5l-.6-2.5-2.2-1.3-2.5.7-2.5-4.3 1.9-1.8v-2.6l-1.9-1.8 2.5-4.3 2.5.7 2.2-1.3z"
      transform="translate(0 -1.5) scale(1 .95)"
    />
    <circle cx="12" cy="12" r="3" />
  </>
);

const shapes = {
  terminal: () => renderNodes(Terminal),
  menu: () => renderNodes(Menu),
  settings,
  "arrow-up": () => renderNodes(ArrowUp),
  "list-checks": () => renderNodes(ListChecks),
  "message-square": () => renderNodes(MessageSquare),
  map: () => renderNodes(Map),
  "user-round": () => renderNodes(UserRound),
  "notebook-tabs": () => renderNodes(NotebookTabs),
  "refresh-cw": () => renderNodes(RefreshCw),
  paperclip: () => renderNodes(Paperclip),
  "arrow-down": () => renderNodes(ArrowDown),
  "arrow-left": () => renderNodes(ArrowLeft),
  "arrow-right": () => renderNodes(ArrowRight),
  "arrow-up-right": () => renderNodes(ArrowUpRight),
  "file-text": () => renderNodes(FileText),
  file: () => renderNodes(File),
  folder: () => renderNodes(Folder),
  "folder-open": () => renderNodes(FolderOpen),
  copy: () => renderNodes(Copy),
  x: () => renderNodes(X),
  "chevron-down": () => renderNodes(ChevronDown),
  "chevron-left": () => renderNodes(ChevronLeft),
  "chevron-right": () => renderNodes(ChevronRight),
  "chevron-up": () => renderNodes(ChevronUp),
  search: () => renderNodes(Search),
  plus: () => renderNodes(Plus),
  minus: () => renderNodes(Minus),
  "panel-left": () => renderNodes(PanelLeft),
  list: () => renderNodes(List),
  network: () => renderNodes(Network),
  "external-link": () => renderNodes(ExternalLink),
  brain: () => renderNodes(Brain),
  eye: () => renderNodes(Eye),
  wrench: () => renderNodes(Wrench),
  "loader-circle": () => renderNodes(LoaderCircle),
  square: () => renderNodes(Square),
  mic: () => renderNodes(Mic),
  "shield-check": () => renderNodes(ShieldCheck),
  gauge: () => renderNodes(Gauge),
  timer: () => renderNodes(Timer),
  database: () => renderNodes(Database),
  history: () => renderNodes(History),
};

export type IconName = keyof typeof shapes;
export const iconNames = Object.keys(shapes) as IconName[];

export interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  /** Omit for decorative icons. Icon-only controls should label the control itself. */
  label?: string;
}

export function Icon({ name, size = 18, className, label }: IconProps): Child {
  return (
    <IconFrame size={size} className={className} label={label} dataIcon={name}>
      {shapes[name]()}
    </IconFrame>
  );
}
