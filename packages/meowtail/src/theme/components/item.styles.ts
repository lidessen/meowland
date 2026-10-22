import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { itemContract, itemOptions } from "../../components/item";

export const itemStyles = css`
  ${partSelector(itemContract, "root")} {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    min-height: 40px;
    padding: 8px 12px;
    border: 0.5px solid transparent;
    border-radius: ${uiTokens.controlRadius};
    background: transparent;
    color: ${uiTokens.foreground};
    font-family: ${uiTokens.font};
    font-size: ${uiTokens.fontBody};
    line-height: 1.5;
    text-align: start;
  }
  ${partSelector(itemContract, "root")} {
    ${itemOptions.when({ size: "small" })} {
      min-height: 34px;
      padding: 6px 8px;
      font-size: ${uiTokens.fontLabel};
      line-height: 20px;
    }
  }
  ${partSelector(itemContract, "root")} {
    ${itemOptions.when({ variant: "outline" })} {
      border-color: ${uiTokens.border};
      background: ${uiTokens.background};
    }
  }
  button${partSelector(itemContract, "root")} {
    cursor: pointer;
    transition:
      background-color ${uiTokens.durationResponse} ${uiTokens.ease},
      border-color ${uiTokens.durationResponse} ${uiTokens.ease};
  }
  button${partSelector(itemContract, "root")}:hover:not(:disabled) {
    background: ${uiTokens.hover};
  }
  ${partSelector(itemContract, "root")}[data-selected="true"],
  button${partSelector(itemContract, "root")}[aria-expanded="true"] {
    background: ${uiTokens.hover};
  }
  button${partSelector(itemContract, "root")}:focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 2px;
  }
  button${partSelector(itemContract, "root")}:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  ${partSelector(itemContract, "leading")},
  ${partSelector(itemContract, "trailing")} {
    display: inline-flex;
    align-items: center;
    gap: ${uiTokens.spaceGroup};
    flex: 0 0 auto;
    color: ${uiTokens.mutedForeground};
  }
  ${partSelector(itemContract, "leading")} {
    align-self: flex-start;
    padding-top: 2px;
  }
  ${partSelector(itemContract, "content")} {
    display: grid;
    gap: 2px;
    flex: 1 1 auto;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  ${partSelector(itemContract, "title")} {
    font-weight: 500;
  }
  ${partSelector(itemContract, "meta")},
  ${partSelector(itemContract, "description")},
  ${partSelector(itemContract, "trailing")} {
    color: ${uiTokens.mutedForeground};
    font-size: ${uiTokens.fontCaption};
  }
  ${partSelector(itemContract, "meta")} {
    font-weight: 500;
  }
  ${partSelector(itemContract, "trailing")} {
    max-width: 40%;
    min-width: 0;
    overflow-wrap: anywhere;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  @media (prefers-reduced-motion: reduce) {
    button${partSelector(itemContract, "root")} {
      transition: none;
    }
  }
`;
