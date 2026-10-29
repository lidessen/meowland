import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import type { Pagination } from "../../components/pagination";
import { ui } from "../utilities";
const pagination = parts<typeof Pagination>("pagination");
export const paginationStyles = css`
  /* A container, so a narrow bar trades the numbered pages for the page fact instead of wrapping. */
  ${pagination.root} {
    container: meowui-pagination / inline-size;
    box-sizing: border-box;
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${uiTokens.space.group};
    min-width: 0;
    ${ui.text.body}
  }
  ${pagination.list} {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    min-width: 0;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  ${pagination.item} {
    display: contents;
  }
  ${pagination.previous}, ${pagination.next}, ${pagination.page} {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-width: ${uiTokens.control.regular};
    min-height: ${uiTokens.control.regular};
    padding: 0 10px;
    border: 0;
    border-radius: ${uiTokens.radius.lg};
    background: transparent;
    color: ${uiTokens.ink.secondary};
    font: ${uiTokens.type.weight.medium} ${uiTokens.type.body} / ${uiTokens.type.line.body}
      ${uiTokens.type.sans};
    font-variant-numeric: tabular-nums;
    ${ui.interactive.flat}
    @media (hover: hover) {
      &:hover:not([aria-disabled="true"]) {
        color: ${uiTokens.ink.primary};
      }
    }
    /* Tertiary ink alone is too close to the resting ink; fade like a disabled Button. */
    &[aria-disabled="true"] {
      opacity: 0.4;
    }
  }
  ${pagination.previous} svg,
  ${pagination.next} svg {
    width: ${uiTokens.icon.size};
    height: ${uiTokens.icon.size};
    flex-shrink: 0;
  }
  /* The current page is where the reader is, painted like the current navigation item. */
  ${pagination.page}[aria-current="page"] {
    color: ${uiTokens.ink.primary};
    background-color: ${uiTokens.accent.selected};
  }
  /* Hover and busy keep the current page as it is: it is still where the reader is. */
  ${pagination.page}[aria-current="page"]:is(:hover, [aria-disabled="true"]) {
    color: ${uiTokens.ink.primary};
    background-color: ${uiTokens.accent.selected};
    opacity: 1;
  }
  ${pagination.gap} {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: ${uiTokens.control.small};
    min-height: ${uiTokens.control.regular};
    color: ${uiTokens.ink.tertiary};
  }
  ${pagination.status} {
    padding-inline: ${uiTokens.space.group};
    color: ${uiTokens.ink.secondary};
    font-variant-numeric: tabular-nums;
  }
  /* With a known total the numbered pages carry the position; the fact stands in when they do not fit. */
  ${pagination.list} + ${pagination.status} {
    display: none;
  }
  @container meowui-pagination (max-width: 32rem) {
    ${pagination.list} {
      display: none;
    }
    ${pagination.list} + ${pagination.status} {
      display: inline;
    }
  }
  ${pagination.root}[aria-busy="true"] {
    cursor: progress;
  }
`;
