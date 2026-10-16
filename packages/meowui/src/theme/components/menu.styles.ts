import { css, partSelector } from "meowcss/meowjsx";
import { menuContract } from "../../components/menu";
import { uiTokens } from "../tokens";
export const menuStyles = css`
  ${partSelector(menuContract, "branch")} {
    min-width: 0;
  }
  ${partSelector(menuContract, "root")} {
    min-width: 144px;
    max-width: min(360px, 100%);
    font: 13px/20px ${uiTokens.font};
    color: ${uiTokens.foreground};
  }
  ${partSelector(menuContract, "item")} {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    min-height: 34px;
    padding: 6px 8px;
    border: 0;
    border-radius: ${uiTokens.controlRadius};
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }
  ${partSelector(menuContract, "item")}:is(:hover, :focus-visible):not(:disabled) {
    background: ${uiTokens.hover};
    outline: none;
  }
  ${partSelector(menuContract, "item")}:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  ${partSelector(menuContract, "item")}[data-danger="true"] {
    color: ${uiTokens.danger};
  }
  ${partSelector(menuContract, "item")}[data-danger="true"]:is(:hover, :focus-visible):not(:disabled) {
    background: light-dark(rgb(236 19 19 / 5%), rgb(242 90 90 / 15%));
  }
  ${partSelector(menuContract, "label")} {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  ${partSelector(menuContract, "icon")} {
    display: flex;
    width: 14px;
    height: 14px;
    flex: none;
  }
  ${partSelector(menuContract, "icon")} svg {
    width: 14px;
    height: 14px;
  }
  ${partSelector(menuContract, "shortcut")} {
    color: ${uiTokens.captionForeground};
    font-size: 11px;
    line-height: 16px;
    white-space: nowrap;
  }
  ${partSelector(menuContract, "heading")} {
    padding: 6px 8px;
    font-size: 11px;
    line-height: 15px;
    color: ${uiTokens.subtleForeground};
  }
  ${partSelector(menuContract, "separator")} {
    height: 0.5px;
    background: ${uiTokens.borderSoft};
    margin: 3px 2px;
  }
`;
