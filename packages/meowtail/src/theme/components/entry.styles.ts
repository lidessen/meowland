import { css, parts } from "meowcss/meowjsx";
import type { Entry, EntryList } from "../../components/entry";
import { entryOptions } from "../../components/entry.options";
import { uiTokens } from "../tokens";
import { ui } from "../utilities";

const list = parts<typeof EntryList>("entry-list");
const entry = parts<typeof Entry>("entry");

/*
 * Entries sit on the surrounding surface. A run opens each with a hairline and gives each the same
 * block rhythm; the title is a display-face heading and the standfirst reads in the reading
 * face, so a reading theme restyles the run through its roles alone.
 */
export const entryStyles = css`
  ${list.root} {
    display: grid;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  /* Every entry opens with a hairline, so the run reads as one column under its heading. */
  ${list.root} > ${entry.root} {
    padding-block: ${uiTokens.space.section};
    border-top: ${uiTokens.line.width} solid ${uiTokens.line.divider};
  }
  ${entry.root} {
    display: grid;
    gap: ${uiTokens.space.group};
    min-width: 0;
    margin: 0;
  }
  ${entry.eyebrow} {
    margin: 0;
    ${ui.text.eyebrow}
  }
  ${entry.title} {
    margin: 0;
    color: ${uiTokens.ink.primary};
    font-family: ${uiTokens.type.display};
    font-size: ${uiTokens.type.title};
    font-weight: ${uiTokens.type.weight.display};
    line-height: ${uiTokens.type.line.title};
    letter-spacing: ${uiTokens.type.trackingTight};
    overflow-wrap: anywhere;
  }
  ${entry.link} {
    color: inherit;
    text-decoration-line: none;
    text-decoration-thickness: ${uiTokens.line.width};
    text-underline-offset: 0.18em;
    border-radius: ${uiTokens.radius.xs};
  }
  ${entry.link}:hover {
    color: ${uiTokens.accent.ink};
    text-decoration-line: underline;
    text-decoration-color: ${uiTokens.accent.line};
  }
  ${entry.link}:focus-visible {
    ${ui.focus.ring}
  }
  ${entry.description} {
    margin: 0;
    color: ${uiTokens.ink.secondary};
    font-family: ${uiTokens.type.reading};
    font-size: ${uiTokens.type.body};
    line-height: ${uiTokens.type.line.body};
    overflow-wrap: anywhere;
  }
  ${entry.meta} {
    min-width: 0;
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.caption};
    line-height: ${uiTokens.type.line.caption};
  }
  ${entry.root} {
    ${entryOptions.when({ size: "feature" })} {
      & ${entry.title} {
        font-size: ${uiTokens.type.heading};
        line-height: ${uiTokens.type.line.heading};
      }
      & ${entry.description} {
        color: ${uiTokens.ink.reading};
        font-size: ${uiTokens.type.readingSize};
        line-height: ${uiTokens.type.line.reading};
      }
    }
  }
`;
