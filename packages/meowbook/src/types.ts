import type { Child, Runtime, Cleanup, Component } from "meowjsx";

export interface StoryContext {
  runtime: Runtime;
  root: HTMLElement;
  signal: AbortSignal;
  onCleanup(cleanup: Cleanup): void;
  report(message: string): void;
}
export interface EnvironmentContext {
  root: HTMLElement;
  signal: AbortSignal;
  onCleanup(cleanup: Cleanup): void;
  /** Default wrapper; a story can replace it or opt out without losing the environment. */
  setContainer(container: StoryContainer): void;
}
export type StoryContainer = (children: Child, context: StoryContext) => Child;
export type PreviewEnvironment = (context: EnvironmentContext) => Runtime | Promise<Runtime>;
export interface ComponentReplacement {
  component: Component<any, any>;
  replacement: Component<any, any>;
}
export interface Story {
  id: string;
  title?: string;
  group?: string;
  groupOrder?: number;
  /** Component directory and short scenario label; title remains searchable. */
  component?: string;
  variant?: string;
  description?: string;
  covers?: readonly string[];
  container?: StoryContainer | false;
  render(context: StoryContext): Child;
  setup?(context: StoryContext): void | Promise<void>;
  ready?(context: StoryContext): void | Promise<void>;
  replacements?: readonly ComponentReplacement[];
}
export interface StoryEntry {
  id: string;
  title: string;
  file: string;
  exportName: string;
  line: number;
  group?: string;
  groupOrder?: number;
  component?: string;
  variant?: string;
  /** Literal metadata available before loading the story; dynamic values arrive with the canvas. */
  description?: string;
  covers?: readonly string[];
}
export interface StoryConfig {
  /** Workspace root; relative paths below resolve from here. */
  root: string;
  stories: readonly string[];
  preview: string;
  tsconfig: string;
  /** How the gallery presents itself inside a host site; omitted, it is Meowbook's own chrome. */
  gallery?: GalleryConfig;
}
/** A link the gallery shows in its header. */
export interface GalleryLink {
  label: string;
  href: string;
}
/** A theme the canvas environment can paint, named by the canvas `theme` URL parameter. */
export interface GalleryTheme {
  /** The value the environment reads from `?theme=`. */
  value: string;
  label: string;
}
export interface GalleryConfig {
  /** The brand at the top of the catalog. Defaults: "Meowbook", "UI", a notebook mark, "./". */
  brand?: {
    name?: string;
    /** Short tag beside the name; an empty string hides it. */
    tag?: string;
    /** Image URL for the 28px mark, used as given. */
    logo?: string;
    href?: string;
  };
  /** Related pages shown in the header, such as another gallery of the same site. */
  links?: readonly GalleryLink[];
  /**
   * The page that documents a story, shown in the header while the story is current. Runs once
   * per story at build time; only its results reach the browser.
   */
  docsLink?(story: StoryEntry): GalleryLink | undefined;
  /**
   * One appearance for the tool and the story. A host site passes its own storage keys so its
   * pages and the gallery share the reader's choice. A missing key means "auto" and the first
   * theme, so those choices are stored by removing the key.
   */
  appearance?: {
    /** `localStorage` key holding "light" or "dark". Default `meowbook:color-scheme`. */
    schemeStorageKey?: string;
    /** `localStorage` key holding a theme value; required for the choice to persist. */
    themeStorageKey?: string;
    /** Themes the environment can paint; fewer than two shows no theme choice. */
    themes?: readonly GalleryTheme[];
  };
}
/** The browser-side form of `GalleryConfig`, written to `gallery.json` by the build. */
export interface GallerySettings extends Omit<GalleryConfig, "docsLink"> {
  docsLinks?: Readonly<Record<string, GalleryLink>>;
}
