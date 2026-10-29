/** The root attribute the theme reads to tell pointer focus from keyboard focus. */
export const focusModalityAttribute = "data-meowui-focus-modality";

export type FocusModality = "pointer" | "keyboard";

const installs = new WeakMap<Document, { count: number; uninstall: () => void }>();

/** Self-contained, so a static page can run its source as an inline script. */
function track(document: Document) {
  const attribute = "data-meowui-focus-modality";
  const modifiers = new Set(["Shift", "Control", "Alt", "Meta", "CapsLock", "Fn", "OS"]);
  const root = document.documentElement;
  let pointerSeen = false;
  const set = (modality: FocusModality) => {
    if (root.getAttribute(attribute) !== modality) root.setAttribute(attribute, modality);
  };
  const onPointer = () => {
    pointerSeen = true;
    set("pointer");
  };
  const onKey = (event: KeyboardEvent) => {
    // A lone modifier or an application shortcut is not a move through the page.
    if (modifiers.has(event.key) || event.metaKey || event.ctrlKey || event.altKey) return;
    set("keyboard");
  };
  const onClick = (event: MouseEvent) => {
    // An activation with no pointer behind it comes from assistive technology.
    if (event.detail === 0 && !pointerSeen) set("keyboard");
    pointerSeen = false;
  };
  const options = { capture: true, passive: true } as const;
  document.addEventListener("pointerdown", onPointer, options);
  document.addEventListener("keydown", onKey, options);
  document.addEventListener("click", onClick, options);
  return () => {
    document.removeEventListener("pointerdown", onPointer, options);
    document.removeEventListener("keydown", onKey, options);
    document.removeEventListener("click", onClick, options);
    root.removeAttribute(attribute);
  };
}

/**
 * The same tracker as an inline script for pages rendered ahead of time, which have no module of
 * their own to call `installFocusModality` from. It stays installed for the page's life.
 */
export const focusModalityScript = `(${track.toString()})(document);`;

/**
 * Track whether the reader is using a pointer or the keyboard, so the theme draws focus rings for
 * keyboard focus only. Browsers decide `:focus-visible` differently: Safari also matches it when
 * script moves focus after a tap, which rings whatever the reader just touched. With the tracker
 * installed, a tap hides those rings; any keystroke brings them back, and text entry keeps its
 * focus state either way. Without it, the theme follows the browser's own `:focus-visible`.
 *
 * Call it once per document next to `applyTheme`; calls are counted, and the last returned
 * function removes the listeners and the attribute. Styles inside shadow roots do not see the
 * attribute on the document element.
 */
export function installFocusModality(document: Document): () => void {
  const existing = installs.get(document);
  const entry = existing ?? { count: 0, uninstall: track(document) };
  entry.count++;
  installs.set(document, entry);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--entry.count > 0) return;
    installs.delete(document);
    entry.uninstall();
  };
}
