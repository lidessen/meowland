import { css, partSelector } from "meowcss/meowjsx";
import { checkboxContract } from "../../components/checkbox";
import { switchContract } from "../../components/switch";
import { uiTokens } from "../tokens";
import { focusRing } from "../recipes";

export const toggleStyles = css`
  :where(${partSelector(checkboxContract, "root")}, ${partSelector(switchContract, "root")}) {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body}/20px ${uiTokens.type.sans};
    cursor: pointer;
  }
  ${partSelector(checkboxContract, "input")} {
    flex: 0 0 auto;
    width: 16px;
    height: 16px;
    margin: 0;
    accent-color: ${uiTokens.action.primary};
    cursor: inherit;
  }
  ${partSelector(switchContract, "input")} {
    position: absolute;
    width: 36px;
    height: 20px;
    margin: 0;
    opacity: 0;
    cursor: inherit;
  }
  ${partSelector(switchContract, "track")} {
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
  ${partSelector(switchContract, "thumb")} {
    display: block;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    corner-shape: round;
    background: ${uiTokens.control.knob};
    transition: transform ${uiTokens.motion.settle} ${uiTokens.motion.ease};
  }
  ${partSelector(switchContract, "input")}:checked + ${partSelector(switchContract, "track")} {
    background: ${uiTokens.action.primary};
  }
  ${partSelector(switchContract, "input")}:checked + ${partSelector(switchContract, "track")} ${partSelector(switchContract, "thumb")} {
    transform: translateX(16px);
    background: ${uiTokens.action.onPrimary};
  }
  :where(${partSelector(checkboxContract, "input")}:focus-visible, ${partSelector(switchContract, "input")}:focus-visible + ${partSelector(switchContract, "track")}) {
    ${focusRing()}
  }
  :where(${partSelector(checkboxContract, "root")}, ${partSelector(switchContract, "root")}):has(input:disabled) {
    cursor: default;
    opacity: 0.5;
  }
  ${partSelector(checkboxContract, "root")}[data-label-hidden] {
    gap: 0;
  }
  ${partSelector(checkboxContract, "label")}[data-label-hidden] {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
  @media (prefers-reduced-motion: reduce) {
    ${partSelector(switchContract, "thumb")} {
      transition: none;
    }
  }
  @media (forced-colors: active) {
    ${partSelector(switchContract, "track")} {
      border: 1px solid ButtonText;
    }
    ${partSelector(switchContract, "thumb")} {
      background: ButtonText;
    }
    ${partSelector(switchContract, "input")}:checked + ${partSelector(switchContract, "track")} {
      background: Highlight;
    }
    ${partSelector(switchContract, "input")}:checked + ${partSelector(switchContract, "track")} ${partSelector(switchContract, "thumb")} {
      background: HighlightText;
    }
  }
`;
