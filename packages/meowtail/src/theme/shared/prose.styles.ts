import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { accentTokens, lineTokens, radiusTokens } from "../palette";
import { proseContract, proseOptions } from "../../components/prose";
import { chatMessageContract } from "../../chat/message";
import { chatBubbleContract } from "../../chat/bubble";
import { assistantMarkdownContract } from "../../chat/assistant-markdown";

/*
 * One reading rhythm for every place long-form text lands: Prose, chat message
 * content, chat bubbles and rendered assistant markdown. Each owner keeps its
 * own type size and line height; blocks, headings, lists, code, quotes, rules,
 * tables and links read the same everywhere.
 */
const prose = partSelector(proseContract, "root");
const markdown = partSelector(assistantMarkdownContract, "root");
const scope = `:where(${prose}, ${partSelector(chatMessageContract, "content")}, ${partSelector(chatBubbleContract, "root")}, ${markdown})`;

export const proseStyles = css`
  ${prose} {
    min-width: 0;
    color: ${uiTokens.foreground};
    font: ${uiTokens.fontReading}/${uiTokens.leading} ${uiTokens.font};
    overflow-wrap: anywhere;
  }
  ${prose} {
    ${proseOptions.when({ measure: "reading" })} {
      max-inline-size: ${uiTokens.measure};
    }
  }
  :where(${prose}, ${markdown}) {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: ${uiTokens.proseGap};
  }

  ${scope} > :where(p, ul, ol, pre, blockquote, h2, h3, h4, hr, table, figure) {
    margin: 0;
  }
  /* Chat bubbles are not grids, so their blocks space by margin. */
  ${partSelector(chatBubbleContract, "root")} > * + * {
    margin-top: ${uiTokens.proseGap};
  }
  ${scope} > :where(h2, h3, h4) {
    margin-top: ${uiTokens.spaceGroup};
    font-weight: 600;
    line-height: 1.45;
    letter-spacing: -0.01em;
  }
  ${scope} > :where(h2) {
    font-size: 1.15em;
  }
  ${scope} > :where(h3) {
    font-size: 1.05em;
  }
  ${scope} > :where(h4) {
    font-size: 1em;
  }
  ${scope} > :where(h2, h3, h4):first-child {
    margin-top: 0;
  }
  ${scope} > :where(ul, ol) {
    padding-inline-start: 1.3em;
  }
  ${scope} :where(li + li) {
    margin-top: 6px;
  }
  ${scope} :where(li > ul, li > ol) {
    margin-block: 4px 0;
    padding-inline-start: 1.3em;
  }
  ${scope} :where(li > p) {
    margin: 0;
  }
  ${scope} :where(:not(pre) > code) {
    padding: 1px 4px;
    border-radius: ${radiusTokens.mark};
    background: ${uiTokens.surfaceMuted};
    font-family: ${uiTokens.mono};
    font-size: 0.92em;
  }
  /* The same recessed surface CodeBlock and output views use. */
  ${scope} > :where(pre) {
    max-width: 100%;
    overflow-x: auto;
    padding: 14px 16px;
    border: 0;
    border-radius: ${uiTokens.radiusLarge};
    background: ${uiTokens.codeSurface};
    font-family: ${uiTokens.mono};
    font-size: ${uiTokens.fontCode};
    line-height: 1.65;
    white-space: pre;
    overflow-wrap: normal;
  }
  ${scope} > :where(pre:focus-visible) {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 2px;
  }
  ${scope} > :where(blockquote) {
    padding-inline-start: ${uiTokens.spaceSection};
    border-inline-start: 2px solid ${lineTokens.edge};
    color: ${uiTokens.mutedForeground};
  }
  ${scope} > :where(hr) {
    height: 0;
    border: 0;
    border-top: ${lineTokens.width} solid ${lineTokens.divider};
  }
  ${scope} > :where(table) {
    display: block;
    max-width: 100%;
    overflow-x: auto;
    border-collapse: collapse;
  }
  ${scope} :where(th, td) {
    padding: 6px ${uiTokens.spaceGroup};
    border-bottom: ${lineTokens.width} solid ${lineTokens.divider};
    text-align: start;
    vertical-align: top;
  }
  ${scope} :where(th) {
    color: ${uiTokens.mutedForeground};
    font-weight: 500;
  }
  ${scope} :where(a) {
    color: ${accentTokens.ink};
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-decoration-color: color-mix(in srgb, ${accentTokens.ink} 55%, transparent);
    text-underline-offset: 3px;
  }
  ${scope} :where(a:hover) {
    color: ${uiTokens.foreground};
    text-decoration-color: ${uiTokens.foreground};
  }
  ${scope} :where(img) {
    max-width: 100%;
    height: auto;
  }
`;
