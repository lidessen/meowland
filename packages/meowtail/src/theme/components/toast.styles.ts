import { css, partSelector } from "meowcss/meowjsx";
import { toastContract } from "../../components/toast";
import { uiTokens } from "../tokens";
export const toastStyles = css`
  ${partSelector(toastContract, "root")} {
    display: flex;
    align-items: center;
    gap: 10px;
    width: fit-content;
    max-width: 100%;
    box-sizing: border-box;
    padding: 12px 16px;
    border-radius: ${uiTokens.radiusLarge};
    background: ${uiTokens.toastSurface};
    color: ${uiTokens.toastForeground};
    box-shadow: ${uiTokens.shadowPanel};
    font: ${uiTokens.fontBody}/22px ${uiTokens.font};
  }
  ${partSelector(toastContract, "message")} {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  ${partSelector(toastContract, "icon")} {
    display: flex;
    flex: none;
  }
  ${partSelector(toastContract, "actions")} {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  ${partSelector(toastContract, "actions")} :is(button, a) {
    min-height: 0;
    padding: 0;
    margin-inline: 3px;
    border: 0;
    background: transparent;
    color: #7aaaff;
    font: inherit;
    text-decoration: none;
    cursor: pointer;
  }
  ${partSelector(toastContract, "actions")} :is(button, a):hover:not(:disabled) {
    background: transparent;
    opacity: 0.8;
  }
`;
