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
    border-radius: ${uiTokens.radius.xl};
    background: ${uiTokens.inverse.surface};
    color: ${uiTokens.inverse.ink};
    box-shadow: ${uiTokens.shadow.float};
    font: ${uiTokens.type.body}/22px ${uiTokens.type.sans};
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
    color: ${uiTokens.inverse.action};
    font: inherit;
    text-decoration: none;
    cursor: pointer;
  }
  ${partSelector(toastContract, "actions")} :is(button, a):hover:not(:disabled) {
    background: transparent;
    opacity: 0.8;
  }
`;
