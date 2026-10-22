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
    font: ${uiTokens.fontBody}/20px ${uiTokens.font};
    color: ${uiTokens.foreground};
  }
  ${partSelector(menuContract, "item")} {
    display: flex;
    align-items: center;
    gap: ${uiTokens.spaceGroup};
    width: 100%;
    min-height: 32px;
    padding: 6px 10px;
    border: 0;
    /* Concentric with the panel: card radius minus the panel's 6px inset. */
    border-radius: ${uiTokens.radiusSmall};
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: background-color ${uiTokens.durationResponse} ${uiTokens.ease};
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
    background: color-mix(in srgb, ${uiTokens.danger} 10%, transparent);
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
    width: ${uiTokens.iconSize};
    height: ${uiTokens.iconSize};
    flex: none;
    color: ${uiTokens.mutedForeground};
  }
  ${partSelector(menuContract, "icon")} svg {
    width: ${uiTokens.iconSize};
    height: ${uiTokens.iconSize};
  }
  ${partSelector(menuContract, "shortcut")} {
    color: ${uiTokens.captionForeground};
    font-size: ${uiTokens.fontMicro};
    line-height: 16px;
    white-space: nowrap;
  }
  ${partSelector(menuContract, "heading")} {
    padding: 8px 10px 4px;
    font-size: ${uiTokens.fontMicro};
    font-weight: 500;
    line-height: 15px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: ${uiTokens.subtleForeground};
  }
  /* Separators run to the panel edges, so groups read as bands. */
  ${partSelector(menuContract, "separator")} {
    height: 0.5px;
    background: ${uiTokens.borderSoft};
    margin: 5px -6px;
  }
  @media (prefers-reduced-motion: reduce) {
    ${partSelector(menuContract, "item")} {
      transition: none;
    }
  }
`;
