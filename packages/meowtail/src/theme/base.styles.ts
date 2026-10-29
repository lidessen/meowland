import { css } from "meowcss/meowjsx";
import { logoTokens, uiTokens } from "./tokens";
import { ui } from "./utilities";
export const cornerShapeStyles = css`
  @supports (corner-shape: superellipse(1.5)) {
    :where([data-meowui-part]),
    :where([data-meowui-part])::before,
    :where([data-meowui-part])::after {
      corner-shape: superellipse(1.5);
    }
  }
`;

/* The floor for anything inside a Meowland region, library part or host element:
   border-box sizing, media that never overflows its column, code in the mono
   face, controls in the surrounding type, one keyboard focus outline and no
   browser tap highlight. It is first in the theme and has zero specificity, so
   every family rule and every host rule overrides it. It deliberately resets no
   margins, headings or lists: copy and long-form reading take Text and Prose
   instead. */
/** Elements that take typed text: they keep their focus state whatever moved focus there. */
export const textEntry = [
  'input:not([type="button"], [type="checkbox"], [type="color"], [type="file"], [type="image"], [type="radio"], [type="range"], [type="reset"], [type="submit"])',
  "textarea",
  "select",
  '[contenteditable]:not([contenteditable="false"])',
  '[role="textbox"]',
].join(", ");

export const foundationStyles = css`
  :where(
    [data-meowui-theme-root="meowui"],
    [data-meowui-theme-root="meowui"] *,
    [data-meowui-theme-root="meowui"] ::before,
    [data-meowui-theme-root="meowui"] ::after
  ) {
    box-sizing: border-box;
  }
  :where([data-meowui-theme-root="meowui"] :is(img, video)) {
    max-width: 100%;
  }
  :where([data-meowui-theme-root="meowui"] :is(img, video):not([height])) {
    height: auto;
  }
  :where([data-meowui-theme-root="meowui"] :is(code, kbd, samp, pre)) {
    font-family: ${uiTokens.type.mono};
  }
  :where([data-meowui-theme-root="meowui"] :is(button, input, select, textarea, optgroup)) {
    font: inherit;
    letter-spacing: inherit;
  }
  :where([data-meowui-theme-root="meowui"] :focus-visible) {
    ${ui.focus.ring}
  }
  /* After a tap the reader needs no ring: browsers disagree on :focus-visible, and Safari matches
     it when script moves focus, so the ring lands on what was just touched. With the focus
     modality tracker from meowtail/web, pointer input hides every outline ring until the next
     keystroke; text entry keeps its focus state, since the caret's field must stay marked.
     !important because each family's own ring is more specific than this floor. */
  :where([data-meowui-focus-modality="pointer"])
  :where([data-meowui-theme-root="meowui"], [data-meowui-theme-root="meowui"] *):focus-visible:not(${textEntry}) {
    outline: none !important;
  }
  /* Mobile Safari outlines tapped targets; every control here shows its own pressed or checked
     state instead. The property inherits, so the root covers parts and host elements alike. */
  :where([data-meowui-theme-root="meowui"]) {
    -webkit-tap-highlight-color: transparent;
  }
  /* One quiet scrollbar for every scroll region: a thin control-line thumb on no track. */
  :where([data-meowui-theme-root="meowui"], [data-meowui-theme-root="meowui"] *) {
    scrollbar-width: thin;
    scrollbar-color: ${uiTokens.line.control} transparent;
  }
`;

export const baseStyles = css`
  /* Establish UI typography at an entry root without resetting an author's
     typography when a nested region changes its theme or appearance. */
  :where([data-meowui-theme-root="meowui"]:not([data-meowui-theme-root] *)) {
    font-family: ${uiTokens.type.sans};
    font-size: ${uiTokens.type.body};
    line-height: ${uiTokens.type.leading};
  }
  /* Unlike typography, ink must resolve again at a local appearance boundary. */
  :where(
    [data-meowui-theme-root="meowui"],
    [data-meowui-theme-root="meowui"]
      [data-meowui-scope]:not([data-meowui-theme-root]:not([data-meowui-theme-root="meowui"]))
  ) {
    color: ${uiTokens.ink.primary};
  }
  :where([data-meowui-theme-root="meowui"]) {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-autospace: normal;
  }
  .meow-icon {
    flex-shrink: 0;
    vertical-align: middle;
    stroke-width: ${uiTokens.icon.stroke};
  }
  .meowland-mark-silhouette {
    fill: var(${logoTokens.ink.name}, currentColor);
  }
`;
