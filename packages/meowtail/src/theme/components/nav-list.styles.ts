import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { navListContract } from "../../components/nav-list";

const list = (part: (typeof navListContract.parts)[number]) => partSelector(navListContract, part);

export const navListStyles = css`
  ${list("root")} {
    box-sizing: border-box;
    display: grid;
    gap: ${uiTokens.spaceSection};
    min-width: 0;
    color: ${uiTokens.foreground};
    font: ${uiTokens.fontBody}/${uiTokens.leading} ${uiTokens.font};
  }

  /* A group is one heading and its rows; the group headings carry the sidebar rhythm. */
  ${list("group")} {
    display: grid;
    gap: ${uiTokens.spaceGroup};
    min-width: 0;
  }
  ${list("groupTitle")} {
    margin: 0;
    min-width: 0;
    padding-inline: ${uiTokens.spaceGroup};
    color: ${uiTokens.mutedForeground};
    font-size: ${uiTokens.fontCaption};
    font-weight: 500;
    line-height: 1.5;
    letter-spacing: 0.02em;
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
    min-height: ${uiTokens.controlHeight};
    padding: 5px ${uiTokens.spaceGroup};
    border: 0;
    border-radius: ${uiTokens.controlRadius};
    color: ${uiTokens.foreground};
    background: transparent;
    font: inherit;
    line-height: inherit;
    text-align: left;
    text-decoration: none;
    cursor: pointer;
  }
  ${list("item")}:focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 2px;
  }
  ${list("item")}[aria-current="page"] {
    color: ${uiTokens.foreground};
    background: ${uiTokens.primarySoft};
    font-weight: 500;
  }
  @media (hover: hover) {
    ${list("item")}:hover:not(:disabled):not([aria-disabled="true"]):not([aria-current="page"]) {
      background: ${uiTokens.hover};
    }
  }
  ${list("item")}:is(:disabled, [aria-disabled="true"]) {
    color: ${uiTokens.subtleForeground};
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
    width: ${uiTokens.iconSize};
    height: calc(${uiTokens.fontBody} * ${uiTokens.leading});
    margin-inline-end: ${uiTokens.spaceGroup};
    color: inherit;
  }
  ${list("icon")} svg {
    display: block;
    width: ${uiTokens.iconSize};
    height: ${uiTokens.iconSize};
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
    color: ${uiTokens.mutedForeground};
    font-size: ${uiTokens.fontCaption};
    line-height: 1.5;
    overflow-wrap: anywhere;
  }
  ${list("badge")} {
    grid-area: badge;
    align-self: center;
    justify-self: end;
    max-width: 100%;
    margin-inline-start: ${uiTokens.spaceGroup};
    color: ${uiTokens.mutedForeground};
    font-size: ${uiTokens.fontCaption};
    line-height: 1.5;
    overflow-wrap: anywhere;
  }
  ${list("meta")} {
    grid-area: meta;
    align-self: center;
    justify-self: end;
    max-width: 100%;
    margin-inline-start: ${uiTokens.spaceGroup};
    color: ${uiTokens.subtleForeground};
    font-size: ${uiTokens.fontCaption};
    line-height: 1.5;
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
  }

  @media (pointer: coarse) {
    ${list("item")} {
      min-height: 44px;
    }
  }
`;
