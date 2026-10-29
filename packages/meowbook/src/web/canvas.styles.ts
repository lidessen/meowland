import { css } from "meowcss";
import { uiTokens } from "meowtail/theme";

export const canvasStyles = css`
  html,
  body {
    margin: 0;
    min-width: 0;
  }
  /* The canvas is its own document, so the host page's setting does not reach it: Mobile Safari
   would outline every tapped target in the story, in the playground and in embedded examples. */
  html {
    -webkit-tap-highlight-color: transparent;
  }
  /* System-color fallbacks follow the consumer's inherited color-scheme without
   importing a theme or assigning a scheme to the story itself. */
  #story-state {
    font:
      12px/1.5 system-ui,
      sans-serif;
    color: var(${uiTokens.ink.secondary.name}, color-mix(in srgb, CanvasText 75%, Canvas));
    background: var(${uiTokens.surface.canvas.name}, Canvas);
  }
  #story-state:empty {
    display: none;
  }
  #story-state:not(:empty) {
    padding: 8px 16px;
  }
  #story-state[data-status="error"] {
    color: color-mix(in srgb, CanvasText 80%, var(${uiTokens.status.danger.name}, #c43131));
    background: color-mix(in srgb, Canvas 90%, var(${uiTokens.status.danger.name}, #c43131));
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  #story-state[data-status="error"] > strong {
    display: block;
    margin-bottom: 4px;
  }
  #story-state[data-status="error"] button {
    margin-top: 8px;
    min-height: 32px;
    padding: 4px 10px;
    border: 1px solid currentColor;
    border-radius: var(${uiTokens.radius.lg.name}, 6px);
    color: inherit;
    background: transparent;
    font: inherit;
    cursor: pointer;
  }
  #story-state[data-status="error"] button:focus-visible {
    outline: 2px solid var(${uiTokens.state.focus.name}, currentColor);
    outline-offset: 2px;
  }
  #story-replacement-details {
    color: var(${uiTokens.ink.secondary.name}, color-mix(in srgb, CanvasText 75%, Canvas));
    background: var(${uiTokens.surface.canvas.name}, Canvas);
    font: 12px/1.5 var(${uiTokens.type.sans.name}, system-ui, sans-serif);
  }
  #story-replacement-details > summary {
    padding: 8px 16px;
    min-height: 32px;
    cursor: pointer;
  }
  #story-replacement-details > summary:focus-visible {
    outline: 2px solid var(${uiTokens.state.focus.name}, currentColor);
    outline-offset: -2px;
  }
  @media (pointer: coarse) {
    #story-state[data-status="error"] button,
    #story-replacement-details > summary {
      min-height: 44px;
    }
  }
  #story-root {
    min-width: 0;
  }
  html[data-meowbook-capture="true"] #story-state,
  html[data-meowbook-capture="true"] #story-replacement-details,
  html[data-meowbook-capture="true"] #story-measurements {
    display: none;
  }

  #story-measurements {
    position: fixed;
    inset: 0;
    overflow: hidden;
    z-index: 2147483646;
    pointer-events: none;
    font:
      11px/1.4 system-ui,
      sans-serif;
    color: #18263b;
  }
  #story-measurements .measurement-box {
    position: absolute;
    box-sizing: border-box;
    border: 1px solid #4875c9;
  }
  #story-measurements .measurement-box > span {
    position: absolute;
    left: 0;
    top: 0;
    transform: translateY(-100%);
    white-space: nowrap;
    padding: 1px 3px;
    background: #e6eeff;
    color: #18263b;
    font:
      10px/1.3 ui-monospace,
      monospace;
  }
  #story-measurements .measurement-active {
    background: #4875c926;
    outline: 2px solid #254eaa;
    z-index: 1;
  }
  #story-measurements .measurement-placeholder {
    position: absolute;
    background: #aab4c4;
    border-radius: 2px;
  }
  #story-measurements .measurement-padding,
  #story-measurements .measurement-margin {
    position: absolute;
    box-sizing: border-box;
    border-style: solid;
    border-color: #49b58355;
  }
  #story-measurements .measurement-margin {
    border-color: #e6a44766;
  }
  #story-measurements [data-kind="text"] {
    border-color: #9567c0;
  }
  #story-measurements [data-kind="structure"] {
    border-style: dashed;
    border-color: #4875c966;
  }
  #story-measurements .measurement-active > span {
    visibility: visible;
  }
  #story-replacements {
    font: 11px/1.5 monospace;
    white-space: pre-wrap;
    padding: 8px 16px;
    color: var(${uiTokens.ink.secondary.name}, color-mix(in srgb, CanvasText 75%, Canvas));
    background: var(${uiTokens.surface.canvas.name}, Canvas);
    overflow-wrap: anywhere;
  }
  [data-meowbook-placeholder] {
    max-width: 100%;
    box-sizing: border-box;
    display: grid;
    place-items: center;
    padding: 12px;
    overflow-wrap: anywhere;
    text-align: center;
    border: 1px dashed
      var(${uiTokens.line.control.name}, color-mix(in srgb, CanvasText 40%, Canvas));
    border-radius: var(${uiTokens.radius.lg.name}, 6px);
    background: var(${uiTokens.surface.fill.name}, color-mix(in srgb, Canvas 94%, CanvasText));
    color: var(${uiTokens.ink.secondary.name}, color-mix(in srgb, CanvasText 75%, Canvas));
    font: 12px/1.5 var(${uiTokens.type.sans.name}, system-ui, sans-serif);
  }
`;
