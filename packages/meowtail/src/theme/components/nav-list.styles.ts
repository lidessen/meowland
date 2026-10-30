import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import type { NavList } from "../../components/nav-list";
import { ui } from "../utilities";
const navListPartRefs = parts<typeof NavList>("nav-list");
const list = (part: keyof typeof navListPartRefs) => navListPartRefs[part];

export const navListStyles = css`
  ${list("root")} {
    box-sizing: border-box;
    display: grid;
    gap: ${uiTokens.space.section};
    min-width: 0;
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body} / ${uiTokens.type.leading} ${uiTokens.type.sans};
  }

  /* A group is one heading and its rows; the group headings carry the sidebar rhythm. */
  ${list("group")} {
    display: grid;
    gap: ${uiTokens.space.group};
    min-width: 0;
  }
  ${list("groupTitle")} {
    margin: 0;
    min-width: 0;
    padding-inline: ${uiTokens.space.group};
    /* A navigation heading reads in sentence case: a reader scans and returns to it, so it is
       not the small-caps label Menu and ChoiceSelect use for their short group notes. */
    color: ${uiTokens.ink.primary};
    font-size: ${uiTokens.type.caption};
    font-weight: ${uiTokens.type.weight.semibold};
    line-height: ${uiTokens.type.line.caption};
    overflow-wrap: anywhere;
  }
  ${list("list")} {
    display: grid;
    gap: 2px;
    margin: 0;
    padding: 0;
    min-width: 0;
    list-style: none;
  }
  /* The native list item is structural only; the row itself is the labelled part. */
  ${list("list")} > li {
    display: grid;
    min-width: 0;
  }

  ${list("item")} {
    box-sizing: border-box;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto auto;
    grid-template-areas:
      "icon label badge meta"
      "icon description description description";
    align-items: center;
    align-content: center;
    width: 100%;
    min-height: ${uiTokens.control.regular};
    padding: 4px ${uiTokens.space.group};
    border: 0;
    border-radius: ${uiTokens.radius.lg};
    color: ${uiTokens.ink.primary};
    background: transparent;
    font: inherit;
    line-height: inherit;
    text-align: left;
    text-decoration: none;
    cursor: pointer;
  }
  ${list("item")}:focus-visible {
    ${ui.focus.ring}
  }
  ${list("item")}[aria-current="page"] {
    color: ${uiTokens.ink.primary};
    background: ${uiTokens.accent.selected};
    font-weight: ${uiTokens.type.weight.medium};
  }
  @media (hover: hover) {
    ${list("item")}:hover:not(:disabled):not([aria-disabled="true"]):not([aria-current="page"]) {
      background: ${uiTokens.state.hover};
    }
  }
  ${list("item")}:is(:disabled, [aria-disabled="true"]) {
    color: ${uiTokens.ink.tertiary};
    cursor: not-allowed;
  }
  ${list("item")}:is(:disabled, [aria-disabled="true"]) ${list("description")} {
    color: inherit;
  }

  ${list("icon")} {
    grid-area: icon;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    /* Center on the label's line box, not on a label plus description. */
    align-self: start;
    flex: none;
    width: ${uiTokens.icon.size};
    height: calc(${uiTokens.type.body} * ${uiTokens.type.leading});
    margin-inline-end: ${uiTokens.space.group};
    color: inherit;
  }
  ${list("icon")} svg {
    display: block;
    width: ${uiTokens.icon.size};
    height: ${uiTokens.icon.size};
  }
  ${list("label")} {
    grid-area: label;
    align-self: center;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  ${list("description")} {
    grid-area: description;
    align-self: start;
    min-width: 0;
    margin-top: 2px;
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.caption};
    line-height: ${uiTokens.type.line.caption};
    overflow-wrap: anywhere;
  }
  ${list("badge")} {
    grid-area: badge;
    align-self: center;
    justify-self: end;
    max-width: 100%;
    margin-inline-start: ${uiTokens.space.group};
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.caption};
    line-height: ${uiTokens.type.line.caption};
    overflow-wrap: anywhere;
  }
  ${list("meta")} {
    grid-area: meta;
    align-self: center;
    justify-self: end;
    max-width: 100%;
    margin-inline-start: ${uiTokens.space.group};
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.caption};
    line-height: ${uiTokens.type.line.caption};
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
  }

  @media (pointer: coarse) {
    ${list("item")} {
      min-height: 44px;
    }
  }
`;
