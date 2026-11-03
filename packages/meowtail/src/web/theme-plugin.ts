import type { Cleanup, ContainerContext, RuntimePlugin } from "meowjsx";
import type { MaybeSignal } from "meowjsx/signal";
import type { Selection, ThemeDefinition } from "meowcss";
import { applyTheme, mountStyles } from "meowcss/web";
import { installFocusModality } from "./focus-modality";

export interface MeowUIThemeOptions {
  /** The theme every Web mount delivers, such as `standardTheme` from `meowtail/theme`. */
  readonly theme: ThemeDefinition;
  /** The root selection, such as `standardOptions.select({ scheme: "dark" })`; a Signal stays live. */
  readonly config?: MaybeSignal<Selection>;
}

/** The containers a theme plugin currently binds, so a second mount into one fails loudly. */
const bound = new WeakSet<Element>();

function prepare(
  { theme, config }: MeowUIThemeOptions,
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
 * attributes to the container and tracks focus modality. Install it next to `createMeowUI`:
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
