import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { jsonTreeContract as json } from "../../components/json-tree";
import { jsonBlockContract as block } from "../../components/json-block";

export const jsonStyles = css`
  ${partSelector(json, "root")} {
    position: relative;
    min-width: 0;
    padding: 6px 8px 8px;
    color: ${uiTokens.foreground};
    background: ${uiTokens.inputSurface};
    font: 12px/16px ${uiTokens.mono};
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
    background: light-dark(rgb(60 64 67 / 4%), rgb(232 234 237 / 5%));
  }
  ${partSelector(json, "property")} {
    color: light-dark(#881391, #5db0d7);
  }
  ${partSelector(json, "punctuation")} {
    color: light-dark(#202124, #e8eaed);
  }
  ${partSelector(json, "expander")} {
    position: absolute;
    inset-inline-start: 0;
    top: 2px;
    display: inline-flex;
    color: light-dark(#5f6368, #9aa0a6);
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
    color: light-dark(#c41a16, #f28b82);
  }
  ${partSelector(json, "value")}:is([data-json-type="number"], [data-json-type="boolean"], [data-json-type="null"]) {
    color: light-dark(#1c00cf, #99c8ff);
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
    border-radius: 3px;
    color: light-dark(#5f6368, #9aa0a6);
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
    background: light-dark(rgb(60 64 67 / 8%), rgb(232 234 237 / 10%));
  }
  @media (hover: none) {
    ${partSelector(json, "copy")} {
      opacity: 1;
      pointer-events: auto;
    }
  }
  ${partSelector(json, "feedback")} {
    font: 11px/18px ${uiTokens.font};
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
    font: 13px/24px ${uiTokens.font};
  }
  ${partSelector(block, "body")} {
    max-height: 420px;
    overflow: auto;
  }
  ${partSelector(block, "error")} {
    color: ${uiTokens.danger};
    font: 13px/20px ${uiTokens.font};
  }
  ${partSelector(json, "copy")}:focus-visible, ${partSelector(json, "summary")}:focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 2px;
  }
`;
