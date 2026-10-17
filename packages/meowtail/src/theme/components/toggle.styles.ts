import { css, partSelector } from "meowcss/meowjsx";
import { checkboxContract } from "../../components/checkbox";
import { switchContract } from "../../components/switch";
import { uiTokens } from "../tokens";

export const toggleStyles = css`
  :where(${partSelector(checkboxContract, "root")}, ${partSelector(switchContract, "root")}) {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: ${uiTokens.foreground};
    font: ${uiTokens.fontBody}/20px ${uiTokens.font};
    cursor: pointer;
  }
  ${partSelector(checkboxContract, "input")} {
    flex: 0 0 auto;
    width: 16px;
    height: 16px;
    margin: 0;
    accent-color: ${uiTokens.primary};
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
    border-radius: 999px;
    corner-shape: round;
    background: ${uiTokens.borderSubtle};
    pointer-events: none;
  }
  ${partSelector(switchContract, "thumb")} {
    display: block;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    corner-shape: round;
    background: ${uiTokens.switchThumb};
    transition: transform 120ms ease;
  }
  ${partSelector(switchContract, "input")}:checked + ${partSelector(switchContract, "track")} {
    background: ${uiTokens.primary};
  }
  ${partSelector(switchContract, "input")}:checked + ${partSelector(switchContract, "track")} ${partSelector(switchContract, "thumb")} {
    transform: translateX(16px);
    background: ${uiTokens.onPrimary};
  }
  :where(${partSelector(checkboxContract, "input")}:focus-visible, ${partSelector(switchContract, "input")}:focus-visible + ${partSelector(switchContract, "track")}) {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 2px;
  }
  :where(${partSelector(checkboxContract, "root")}, ${partSelector(switchContract, "root")}):has(input:disabled) {
    cursor: default;
    opacity: 0.5;
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
