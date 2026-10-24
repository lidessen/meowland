import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { codeHighlightTokens } from "../shared/code-highlight.tokens";

import type { JsonBlock } from "../../components/json-block";
import type { JsonTree } from "../../components/json-tree";
import { ui } from "../utilities";
const jsonBlockPartRefs = parts<typeof JsonBlock>("json-block");
const jsonTreePartRefs = parts<typeof JsonTree>("json-tree");
export const jsonStyles = css`
  ${jsonTreePartRefs.root} {
    position: relative;
    min-width: 0;
    padding: 6px 8px 8px;
    color: ${uiTokens.ink.primary};
    background: transparent;
    font: ${uiTokens.type.code} / ${uiTokens.type.line.micro} ${uiTokens.type.mono};
  }
  ${jsonTreePartRefs.summary} {
    position: relative;
    min-height: 16px;
    padding: 0 22px 0 14px;
    list-style: none;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  summary${jsonTreePartRefs.summary} {
    cursor: pointer;
  }
  ${jsonTreePartRefs.summary}::-webkit-details-marker {
    display: none;
  }
  ${jsonTreePartRefs.summary}:hover,
  ${jsonTreePartRefs.summary}:focus-visible {
    background: ${uiTokens.state.hover};
  }
  ${jsonTreePartRefs.property} {
    color: ${codeHighlightTokens.function};
  }
  ${jsonTreePartRefs.punctuation} {
    color: ${uiTokens.ink.primary};
  }
  ${jsonTreePartRefs.expander} {
    position: absolute;
    inset-inline-start: 0;
    top: 2px;
    display: inline-flex;
    color: ${uiTokens.ink.secondary};
  }
  details[open] > ${jsonTreePartRefs.summary} > ${jsonTreePartRefs.expander} {
    transform: rotate(90deg);
  }
  ${jsonTreePartRefs.children} {
    padding-left: 14px;
  }
  ${jsonTreePartRefs.children} > ${jsonTreePartRefs.root} {
    padding: 0;
  }
  ${jsonTreePartRefs.value} {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  ${jsonTreePartRefs.value}[data-json-type="string"] {
    color: ${codeHighlightTokens.string};
  }
  ${jsonTreePartRefs.value}:is([data-json-type="number"], [data-json-type="boolean"], [data-json-type="null"]) {
    color: ${codeHighlightTokens.constant};
  }
  ${jsonTreePartRefs.copy} {
    position: absolute;
    right: 8px;
    top: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border: 0;
    padding: 0;
    border-radius: ${uiTokens.radius.xs};
    color: ${uiTokens.ink.secondary};
    background: transparent;
    opacity: 0;
    pointer-events: none;
    cursor: pointer;
  }
  ${jsonTreePartRefs.children} > ${jsonTreePartRefs.root} > ${jsonTreePartRefs.copy} {
    top: 0;
    right: 0;
  }
  ${jsonTreePartRefs.root}:hover:not(:has(${jsonTreePartRefs.children}:hover)) > ${jsonTreePartRefs.copy},
  ${jsonTreePartRefs.root}:has(> details > ${jsonTreePartRefs.summary}:focus-visible) > ${jsonTreePartRefs.copy},
  ${jsonTreePartRefs.copy}:focus-visible {
    opacity: 1;
    pointer-events: auto;
  }
  ${jsonTreePartRefs.copy}:hover {
    background: ${uiTokens.state.active};
  }
  @media (hover: none) {
    ${jsonTreePartRefs.copy} {
      opacity: 1;
      pointer-events: auto;
    }
  }
  ${jsonTreePartRefs.feedback} {
    font: ${uiTokens.type.micro} / ${uiTokens.type.line.caption} ${uiTokens.type.sans};
    color: ${uiTokens.ink.secondary};
  }
  ${jsonBlockPartRefs.root} {
    padding: 8px;
    border-radius: ${uiTokens.radius.xl};
    background: ${uiTokens.surface.fill};
  }
  ${jsonBlockPartRefs.summary} {
    cursor: pointer;
    color: ${uiTokens.ink.secondary};
    font: ${uiTokens.type.label} / ${uiTokens.type.line.reading} ${uiTokens.type.sans};
  }
  ${jsonBlockPartRefs.body} {
    max-height: 420px;
    overflow: auto;
  }
  ${jsonBlockPartRefs.error} {
    color: ${uiTokens.status.danger};
    font: ${uiTokens.type.label} / ${uiTokens.type.line.label} ${uiTokens.type.sans};
  }
  ${jsonTreePartRefs.copy}:focus-visible, ${jsonTreePartRefs.summary}:focus-visible {
    ${ui.focus.ring}
  }

  /* Native summaries draw the same rotating chevron as Disclosure. */
  :where(${jsonBlockPartRefs.summary}) {
    display: flex;
    align-items: center;
    gap: 6px;
    list-style: none;
  }
  :where(${jsonBlockPartRefs.summary})::-webkit-details-marker {
    display: none;
  }
  :where(${jsonBlockPartRefs.summary})::before {
    content: "";
    flex: none;
    width: 14px;
    height: 14px;
    background: currentColor;
    mask: ${uiTokens.glyph.chevron} center / 14px 14px no-repeat;
    transition: transform ${uiTokens.motion.settle} ${uiTokens.motion.ease};
  }
  :where(details[open] > ${jsonBlockPartRefs.summary})::before {
    transform: rotate(90deg);
  }
  @media (prefers-reduced-motion: reduce) {
    :where(${jsonBlockPartRefs.summary})::before {
      transition: none;
    }
  }
`;
