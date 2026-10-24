import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import type { Item } from "../../components/item";
import { itemOptions } from "../../components/item.options";
import { ui } from "../utilities";
const itemPartRefs = parts<typeof Item>("item");
export const itemStyles = css`
  ${itemPartRefs.root} {
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
  ${itemPartRefs.root} {
    ${itemOptions.when({ size: "small" })} {
      min-height: 34px;
      padding: 6px 8px;
      font-size: ${uiTokens.type.label};
      line-height: ${uiTokens.type.line.label};
    }
  }
  ${itemPartRefs.root} {
    ${itemOptions.when({ variant: "outline" })} {
      border-color: ${uiTokens.line.edge};
      background: ${uiTokens.surface.raised};
    }
  }
  button${itemPartRefs.root} {
    cursor: pointer;
    transition:
      background-color ${uiTokens.motion.response} ${uiTokens.motion.ease},
      border-color ${uiTokens.motion.response} ${uiTokens.motion.ease};
  }
  button${itemPartRefs.root}:hover:not(:disabled, [data-selected="true"]) {
    background: ${uiTokens.state.hover};
  }
  /* Selected takes the one selection tint used by navigation, tables and choices; an open
     disclosure is a pressed state, not a selection. */
  ${itemPartRefs.root}[data-selected="true"] {
    background: ${uiTokens.accent.selected};
  }
  button${itemPartRefs.root}[aria-expanded="true"] {
    background: ${uiTokens.state.active};
  }
  button${itemPartRefs.root}:focus-visible {
    ${ui.focus.ring}
  }
  button${itemPartRefs.root}:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  ${itemPartRefs.leading},
  ${itemPartRefs.trailing} {
    display: inline-flex;
    align-items: center;
    gap: ${uiTokens.space.group};
    flex: 0 0 auto;
    color: ${uiTokens.ink.secondary};
  }
  ${itemPartRefs.leading} {
    align-self: flex-start;
    padding-top: 2px;
  }
  ${itemPartRefs.content} {
    display: grid;
    gap: 2px;
    flex: 1 1 auto;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  ${itemPartRefs.title} {
    font-weight: ${uiTokens.type.weight.medium};
  }
  ${itemPartRefs.meta},
  ${itemPartRefs.description},
  ${itemPartRefs.trailing} {
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.caption};
  }
  ${itemPartRefs.meta} {
    font-weight: ${uiTokens.type.weight.medium};
  }
  ${itemPartRefs.trailing} {
    max-width: 40%;
    min-width: 0;
    overflow-wrap: anywhere;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  @media (prefers-reduced-motion: reduce) {
    button${itemPartRefs.root} {
      transition: none;
    }
  }
`;
