import { css, parts } from "meowcss/meowjsx";

import { uiTokens } from "../tokens";
import type { Checkbox } from "../../components/checkbox";
import type { Switch } from "../../components/switch";
import { ui } from "../utilities";
const checkboxPartRefs = parts<typeof Checkbox>("checkbox");
const switchPartRefs = parts<typeof Switch>("switch");
export const toggleStyles = css`
  :where(${checkboxPartRefs.root}, ${switchPartRefs.root}) {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body} / ${uiTokens.type.line.bodyCompact} ${uiTokens.type.sans};
    cursor: pointer;
  }
  ${checkboxPartRefs.input} {
    flex: 0 0 auto;
    width: 16px;
    height: 16px;
    margin: 0;
    accent-color: ${uiTokens.action.primary};
    cursor: inherit;
  }
  ${switchPartRefs.input} {
    position: absolute;
    width: 36px;
    height: 20px;
    margin: 0;
    opacity: 0;
    cursor: inherit;
  }
  ${switchPartRefs.track} {
    box-sizing: border-box;
    flex: 0 0 auto;
    width: 36px;
    height: 20px;
    padding: 2px;
    border-radius: ${uiTokens.radius.full};
    corner-shape: round;
    background: ${uiTokens.line.edge};
    pointer-events: none;
  }
  ${switchPartRefs.thumb} {
    display: block;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    corner-shape: round;
    background: ${uiTokens.control.knob};
    transition: transform ${uiTokens.motion.settle} ${uiTokens.motion.ease};
  }
  ${switchPartRefs.input}:checked + ${switchPartRefs.track} {
    background: ${uiTokens.action.primary};
  }
  ${switchPartRefs.input}:checked + ${switchPartRefs.track} ${switchPartRefs.thumb} {
    transform: translateX(16px);
    background: ${uiTokens.action.onPrimary};
  }
  :where(${checkboxPartRefs.input}:focus-visible, ${switchPartRefs.input}:focus-visible + ${switchPartRefs.track}) {
    ${ui.focus.ring}
  }
  :where(${checkboxPartRefs.root}, ${switchPartRefs.root}):has(input:disabled) {
    cursor: default;
    opacity: 0.5;
  }
  ${checkboxPartRefs.root}[data-label-hidden] {
    gap: 0;
  }
  ${checkboxPartRefs.label}[data-label-hidden] {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
  @media (prefers-reduced-motion: reduce) {
    ${switchPartRefs.thumb} {
      transition: none;
    }
  }
  @media (forced-colors: active) {
    ${switchPartRefs.track} {
      border: 1px solid ButtonText;
    }
    ${switchPartRefs.thumb} {
      background: ButtonText;
    }
    ${switchPartRefs.input}:checked + ${switchPartRefs.track} {
      background: Highlight;
    }
    ${switchPartRefs.input}:checked + ${switchPartRefs.track} ${switchPartRefs.thumb} {
      background: HighlightText;
    }
  }
`;
