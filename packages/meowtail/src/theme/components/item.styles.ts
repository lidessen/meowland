import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { focusRing } from "../recipes";
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
    border: 1px solid transparent;
    border-radius: ${uiTokens.radius.lg};
    background: transparent;
    color: ${uiTokens.ink.primary};
    font-family: ${uiTokens.type.sans};
    font-size: ${uiTokens.type.body};
    line-height: ${uiTokens.type.leading};
    text-align: start;
  }
  ${partSelector(itemContract, "root")} {
    ${itemOptions.when({ size: "small" })} {
      min-height: 34px;
      padding: 6px 8px;
      font-size: ${uiTokens.type.label};
      line-height: ${uiTokens.type.line.label};
    }
  }
  ${partSelector(itemContract, "root")} {
    ${itemOptions.when({ variant: "outline" })} {
      border-color: ${uiTokens.line.edge};
      background: ${uiTokens.surface.raised};
    }
  }
  button${partSelector(itemContract, "root")} {
    cursor: pointer;
    transition:
      background-color ${uiTokens.motion.response} ${uiTokens.motion.ease},
      border-color ${uiTokens.motion.response} ${uiTokens.motion.ease};
  }
  button${partSelector(itemContract, "root")}:hover:not(:disabled, [data-selected="true"]) {
    background: ${uiTokens.state.hover};
  }
  /* Selected takes the one selection tint used by navigation, tables and choices; an open
     disclosure is a pressed state, not a selection. */
  ${partSelector(itemContract, "root")}[data-selected="true"] {
    background: ${uiTokens.accent.selected};
  }
  button${partSelector(itemContract, "root")}[aria-expanded="true"] {
    background: ${uiTokens.state.active};
  }
  button${partSelector(itemContract, "root")}:focus-visible {
    ${focusRing()}
  }
  button${partSelector(itemContract, "root")}:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  ${partSelector(itemContract, "leading")},
  ${partSelector(itemContract, "trailing")} {
    display: inline-flex;
    align-items: center;
    gap: ${uiTokens.space.group};
    flex: 0 0 auto;
    color: ${uiTokens.ink.secondary};
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
    font-weight: ${uiTokens.type.weight.medium};
  }
  ${partSelector(itemContract, "meta")},
  ${partSelector(itemContract, "description")},
  ${partSelector(itemContract, "trailing")} {
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.caption};
  }
  ${partSelector(itemContract, "meta")} {
    font-weight: ${uiTokens.type.weight.medium};
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
