import type { Cleanup, ContainerContext, RuntimePlugin } from "meowjsx";
import type { MaybeSignal } from "meowjsx/signal";
import type { Selection, ThemeDefinition } from "meowcss";
import { applyTheme, mountStyles } from "meowcss/web";
import { installFocusModality } from "./focus-modality";
import { pageAttribute } from "../shared/page-attribute";

export interface MeowUIThemeOptions {
  /** The theme every Web mount delivers, such as `standardTheme` from `meowtail/theme`. */
  readonly theme: ThemeDefinition;
  /** The root selection, such as `standardOptions.select({ scheme: "dark" })`; a Signal stays live. */
  readonly config?: MaybeSignal<Selection>;
  /**
   * Whether the mount owns the page: the document element takes the theme's canvas and color
   * scheme, so a dark scheme does not sit on a white page. Defaults to true; pass false for a
   * region embedded in a page whose ground belongs to someone else.
   */
  readonly page?: boolean;
}

/** The documents whose page a theme plugin paints, with the number of mounts holding it. */
const pages = new WeakMap<Document, { count: number; release: Cleanup }>();

/**
 * Paints the page for one more mount. The first holder binds the document element; later holders
 * share that binding, and its theme and selection, until the last one releases it.
 */
function holdPage(
  document: Document,
  root: Element,
  theme: ThemeDefinition,
  config: MaybeSignal<Selection> | undefined,
): Cleanup {
  let entry = pages.get(document);
  if (!entry) {
    const html = document.documentElement;
    // A container that is the document element already carries the theme attributes.
    const removeTheme = root === html ? undefined : applyTheme(html, theme, config);
    html.setAttribute(pageAttribute, "");
    const created = {
      count: 0,
      release: () => {
        pages.delete(document);
        html.removeAttribute(pageAttribute);
        removeTheme?.();
      },
    };
    pages.set(document, (entry = created));
  }
  entry.count++;
  const held = entry;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--held.count === 0) held.release();
  };
}

/** The containers a theme plugin currently binds, so a second mount into one fails loudly. */
const bound = new WeakSet<Element>();

function prepare(
  { theme, config, page = true }: MeowUIThemeOptions,
  { container, target }: ContainerContext,
): Cleanup | undefined {
  if (target !== "web") return undefined;
  const root = container as Element;
  const document = root.ownerDocument;
  if (root.getRootNode() !== document && root.isConnected) {
    throw new Error(
      "meowtail theme delivery needs a container in the document, not in a shadow root; mount the stylesheet in the shadow root yourself and omit createMeowUITheme",
    );
  }
  if (bound.has(root)) {
    throw new Error(
      "meowtail theme delivery already binds this container; unmount the earlier render or render into a child element",
    );
  }
  const releases: Cleanup[] = [];
  try {
    releases.push(mountStyles(document, theme.cssText));
    releases.push(applyTheme(root, theme, config));
    releases.push(installFocusModality(document));
    if (page) releases.push(holdPage(document, root, theme, config));
  } catch (error) {
    for (const release of releases.reverse()) release();
    throw error;
  }
  bound.add(root);
  return () => {
    bound.delete(root);
    for (const release of releases.reverse()) release();
  };
}

/**
 * The runtime plugin that makes each Web mount render styled: it puts the theme's stylesheet in
 * the container's document (shared with any other holder of the same text), binds the theme
 * attributes to the container, paints the page with the theme's canvas and color scheme (unless
 * `page: false`) and tracks focus modality. Install it next to `createMeowUI`:
 *
 * ```ts
 * createRuntime({
 *   plugins: [
 *     createMeowUI({ components: meowUIComponents }),
 *     createMeowUITheme({ theme: standardTheme }),
 *   ],
 * });
 * ```
 *
 * Static output does not run it; deliver CSS at build time and use `themeAttributes` there.
 */
export function createMeowUITheme(options: MeowUIThemeOptions): RuntimePlugin {
  return {
    name: "meow-ui-theme",
    prepareContainer: (context) => prepare(options, context),
  };
}
