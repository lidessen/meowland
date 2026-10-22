import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { radiusTokens } from "../palette";
import { codeHighlightTokens } from "../shared/code-highlight.tokens";
import { jsonTreeContract as json } from "../../components/json-tree";
import { jsonBlockContract as block } from "../../components/json-block.contract";

export const jsonStyles = css`
  ${partSelector(json, "root")} {
    position: relative;
    min-width: 0;
    padding: 6px 8px 8px;
    color: ${uiTokens.foreground};
    background: transparent;
    font: ${uiTokens.fontCode}/16px ${uiTokens.mono};
  }
  ${partSelector(json, "summary")} {
    position: relative;
    min-height: 16px;
    padding: 0 22px 0 14px;
    list-style: none;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  summary${partSelector(json, "summary")} {
    cursor: pointer;
  }
  ${partSelector(json, "summary")}::-webkit-details-marker {
    display: none;
  }
  ${partSelector(json, "summary")}:hover,
  ${partSelector(json, "summary")}:focus-visible {
    background: ${uiTokens.hover};
  }
  ${partSelector(json, "property")} {
    color: ${codeHighlightTokens.function};
  }
  ${partSelector(json, "punctuation")} {
    color: ${uiTokens.foreground};
  }
  ${partSelector(json, "expander")} {
    position: absolute;
    inset-inline-start: 0;
    top: 2px;
    display: inline-flex;
    color: ${uiTokens.mutedForeground};
  }
  details[open] > ${partSelector(json, "summary")} > ${partSelector(json, "expander")} {
    transform: rotate(90deg);
  }
  ${partSelector(json, "children")} {
    padding-left: 14px;
  }
  ${partSelector(json, "children")} > ${partSelector(json, "root")} {
    padding: 0;
  }
  ${partSelector(json, "value")} {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  ${partSelector(json, "value")}[data-json-type="string"] {
    color: ${codeHighlightTokens.string};
  }
  ${partSelector(json, "value")}:is([data-json-type="number"], [data-json-type="boolean"], [data-json-type="null"]) {
    color: ${codeHighlightTokens.constant};
  }
  ${partSelector(json, "copy")} {
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
    border-radius: ${radiusTokens.mark};
    color: ${uiTokens.mutedForeground};
    background: transparent;
    opacity: 0;
    pointer-events: none;
    cursor: pointer;
  }
  ${partSelector(json, "children")} > ${partSelector(json, "root")} > ${partSelector(json, "copy")} {
    top: 0;
    right: 0;
  }
  ${partSelector(json, "root")}:hover:not(:has(${partSelector(json, "children")}:hover)) > ${partSelector(json, "copy")},
  ${partSelector(json, "root")}:has(> details > ${partSelector(json, "summary")}:focus-visible) > ${partSelector(json, "copy")},
  ${partSelector(json, "copy")}:focus-visible {
    opacity: 1;
    pointer-events: auto;
  }
  ${partSelector(json, "copy")}:hover {
    background: ${uiTokens.active};
  }
  @media (hover: none) {
    ${partSelector(json, "copy")} {
      opacity: 1;
      pointer-events: auto;
    }
  }
  ${partSelector(json, "feedback")} {
    font: ${uiTokens.fontMicro}/18px ${uiTokens.font};
    color: ${uiTokens.mutedForeground};
  }
  ${partSelector(block, "root")} {
    padding: 8px;
    border-radius: ${uiTokens.radiusLarge};
    background: ${uiTokens.codeSurface};
  }
  ${partSelector(block, "summary")} {
    cursor: pointer;
    color: ${uiTokens.mutedForeground};
    font: ${uiTokens.fontLabel}/24px ${uiTokens.font};
  }
  ${partSelector(block, "body")} {
    max-height: 420px;
    overflow: auto;
  }
  ${partSelector(block, "error")} {
    color: ${uiTokens.danger};
    font: ${uiTokens.fontLabel}/20px ${uiTokens.font};
  }
  ${partSelector(json, "copy")}:focus-visible, ${partSelector(json, "summary")}:focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 2px;
  }

  /* Native summaries draw the same rotating chevron as Disclosure. */
  :where(${partSelector(block, "summary")}) {
    display: flex;
    align-items: center;
    gap: 6px;
    list-style: none;
  }
  :where(${partSelector(block, "summary")})::-webkit-details-marker {
    display: none;
  }
  :where(${partSelector(block, "summary")})::before {
    content: "";
    flex: none;
    width: 14px;
    height: 14px;
    background: currentColor;
    mask: ${uiTokens.chevronMask} center / 14px 14px no-repeat;
    transition: transform ${uiTokens.durationSettle} ${uiTokens.ease};
  }
  :where(details[open] > ${partSelector(block, "summary")})::before {
    transform: rotate(90deg);
  }
  @media (prefers-reduced-motion: reduce) {
    :where(${partSelector(block, "summary")})::before {
      transition: none;
    }
  }
`;
