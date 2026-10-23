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
    font: ${uiTokens.type.body}/20px ${uiTokens.type.sans};
    color: ${uiTokens.ink.primary};
  }
  ${partSelector(menuContract, "item")} {
    display: flex;
    align-items: center;
    gap: ${uiTokens.space.group};
    width: 100%;
    min-height: 32px;
    padding: 6px 10px;
    border: 0;
    /* Concentric with the panel: card radius minus the panel's 6px inset. */
    border-radius: ${uiTokens.radius.md};
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: background-color ${uiTokens.motion.response} ${uiTokens.motion.ease};
  }
  ${partSelector(menuContract, "item")}:is(:hover, :focus-visible):not(:disabled) {
    background: ${uiTokens.state.hover};
    outline: none;
  }
  ${partSelector(menuContract, "item")}:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  ${partSelector(menuContract, "item")}[data-danger="true"] {
    color: ${uiTokens.status.danger};
  }
  ${partSelector(menuContract, "item")}[data-danger="true"]:is(:hover, :focus-visible):not(:disabled) {
    background: color-mix(in srgb, ${uiTokens.status.danger} 10%, transparent);
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
    width: ${uiTokens.icon.size};
    height: ${uiTokens.icon.size};
    flex: none;
    color: ${uiTokens.ink.secondary};
  }
  ${partSelector(menuContract, "icon")} svg {
    width: ${uiTokens.icon.size};
    height: ${uiTokens.icon.size};
  }
  ${partSelector(menuContract, "shortcut")} {
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.micro};
    line-height: 16px;
    white-space: nowrap;
  }
  ${partSelector(menuContract, "heading")} {
    padding: 8px 10px 4px;
    font-size: ${uiTokens.type.micro};
    font-weight: 500;
    line-height: 15px;
    letter-spacing: ${uiTokens.type.trackingCaps};
    text-transform: uppercase;
    color: ${uiTokens.ink.tertiary};
  }
  /* Separators run to the panel edges, so groups read as bands. */
  ${partSelector(menuContract, "separator")} {
    height: 0.5px;
    background: ${uiTokens.line.divider};
    margin: 4px -6px;
  }
  @media (prefers-reduced-motion: reduce) {
    ${partSelector(menuContract, "item")} {
      transition: none;
    }
  }
`;
