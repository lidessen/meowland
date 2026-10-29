import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import type { TreeView } from "../../components/tree-view";
import { treeViewLevel } from "../../components/tree-view.options";
const tree = parts<typeof TreeView>("tree-view");
export const treeViewStyles = css`
  ${tree.root},
  ${tree.group} {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  ${tree.root} {
    min-width: 0;
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body} / ${uiTokens.type.line.bodyCompact} ${uiTokens.type.sans};
  }
  ${tree.group}[hidden] {
    display: none;
  }
  ${tree.item} {
    outline: none;
  }
  /* Rows span the full width; depth indents the content, one icon step per level. */
  ${tree.row} {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: 32px;
    padding-block: 4px;
    padding-inline: calc(4px + (${treeViewLevel} - 1) * 20px) 8px;
    border-radius: ${uiTokens.radius.md};
    cursor: pointer;
    transition: background-color ${uiTokens.motion.response} ${uiTokens.motion.ease};
  }
  @media (hover: hover) {
    ${tree.row}:hover {
      background: ${uiTokens.state.hover};
    }
  }
  ${tree.item}:focus-visible > ${tree.row} {
    outline: 2px solid ${uiTokens.state.focus};
    outline-offset: -2px;
  }
  ${tree.item}[aria-selected="true"] > ${tree.row} {
    background: ${uiTokens.accent.selected};
    font-weight: ${uiTokens.type.weight.medium};
  }
  ${tree.item}[aria-disabled="true"] > ${tree.row} {
    color: ${uiTokens.ink.tertiary};
    cursor: not-allowed;
  }
  /* A leaf keeps the chevron's space, so labels at one depth share a start edge. */
  ${tree.toggle} {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: ${uiTokens.icon.size};
    height: ${uiTokens.icon.size};
    color: ${uiTokens.ink.tertiary};
    transition: transform ${uiTokens.motion.response} ${uiTokens.motion.ease};
  }
  ${tree.toggle}[hidden] {
    visibility: hidden;
  }
  ${tree.toggle}[data-open="true"] {
    transform: rotate(90deg);
  }
  ${tree.toggle} svg {
    width: ${uiTokens.icon.small};
    height: ${uiTokens.icon.small};
  }
  ${tree.icon} {
    display: inline-flex;
    flex: none;
    color: ${uiTokens.ink.secondary};
  }
  ${tree.icon} svg {
    width: ${uiTokens.icon.size};
    height: ${uiTokens.icon.size};
  }
  ${tree.label} {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  ${tree.description} {
    flex: none;
    margin-inline-start: auto;
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.caption};
  }
  ${tree.description}[hidden] {
    display: none;
  }
  @media (prefers-reduced-motion: reduce) {
    ${tree.row},
    ${tree.toggle} {
      transition: none;
    }
  }
`;
