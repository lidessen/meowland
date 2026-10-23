import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { focusRing } from "../recipes";
import { proseContract, proseOptions } from "../../components/prose";
import { chatMessageContract } from "../../chat/message";
import { chatBubbleContract } from "../../chat/bubble";
import { assistantMarkdownContract } from "../../chat/assistant-markdown";

/*
 * One reading rhythm for every place long-form text lands: Prose, chat message
 * content, chat bubbles and rendered assistant markdown. Each owner keeps its
 * own type size and line height; blocks, lists, code, quotes, rules, tables and
 * links read the same everywhere, and headings step down the type ramp.
 */
const prose = partSelector(proseContract, "root");
const markdown = partSelector(assistantMarkdownContract, "root");
const scope = `:where(${prose}, ${partSelector(chatMessageContract, "content")}, ${partSelector(chatBubbleContract, "root")}, ${markdown})`;

export const proseStyles = css`
  ${prose} {
    min-width: 0;
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body} / ${uiTokens.type.line.reading} ${uiTokens.type.sans};
    overflow-wrap: anywhere;
  }
  ${prose} {
    ${proseOptions.when({ measure: "reading" })} {
      max-inline-size: ${uiTokens.layout.measure};
    }
  }
  :where(${prose}, ${markdown}) {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: ${uiTokens.space.prose};
  }

  ${scope} > :where(p, ul, ol, pre, blockquote, h2, h3, h4, hr, table, figure) {
    margin: 0;
  }
  /* Chat bubbles are not grids, so their blocks space by margin. */
  ${partSelector(chatBubbleContract, "root")} > * + * {
    margin-top: ${uiTokens.space.prose};
  }
  /* Headings step down the type ramp. Inside a conversation they stay compact: h2 is a title,
     h3 and h4 are semibold body. Standalone Prose is a reading page, so h2 is a heading and h3 a
     title. */
  ${scope} > :where(h2, h3, h4) {
    margin-top: ${uiTokens.space.group};
    font-weight: ${uiTokens.type.weight.semibold};
    letter-spacing: ${uiTokens.type.trackingTight};
  }
  ${scope} > :where(h2) {
    font-size: ${uiTokens.type.title};
    line-height: ${uiTokens.type.line.title};
  }
  ${scope} > :where(h3, h4) {
    font-size: ${uiTokens.type.body};
    line-height: ${uiTokens.type.line.body};
  }
  ${prose} > :where(h2) {
    font-size: ${uiTokens.type.heading};
    line-height: ${uiTokens.type.line.heading};
  }
  ${prose} > :where(h3) {
    font-size: ${uiTokens.type.title};
    line-height: ${uiTokens.type.line.title};
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
  ${scope} > :where(ul, ol) {
    padding-inline-start: 20px;
  }
  ${scope} :where(li > ul, li > ol) {
    margin-block: 4px 0;
    padding-inline-start: 1.3em;
  }
  ${scope} :where(li > p) {
    margin: 0;
  }
  ${scope} :where(:not(pre) > code) {
    padding: 2px 6px;
    border-radius: ${uiTokens.radius.md};
    background: ${uiTokens.surface.fill};
    font-family: ${uiTokens.type.mono};
    font-size: 0.93em;
  }
  /* The same recessed surface CodeBlock and output views use. */
  ${scope} > :where(pre) {
    max-width: 100%;
    overflow-x: auto;
    padding: 14px 16px;
    border: 0;
    border-radius: ${uiTokens.radius.xl};
    background: ${uiTokens.surface.fill};
    font-family: ${uiTokens.type.mono};
    font-size: ${uiTokens.type.code};
    line-height: ${uiTokens.type.line.code};
    white-space: pre;
    overflow-wrap: normal;
  }
  ${scope} > :where(pre:focus-visible) {
    ${focusRing()}
  }
  ${scope} > :where(blockquote) {
    padding-inline-start: ${uiTokens.space.section};
    border-inline-start: 2px solid ${uiTokens.line.edge};
    color: ${uiTokens.ink.secondary};
  }
  ${scope} > :where(hr) {
    height: 0;
    border: 0;
    border-top: ${uiTokens.line.width} solid ${uiTokens.line.divider};
  }
  ${scope} > :where(table) {
    display: block;
    max-width: 100%;
    overflow-x: auto;
    border-collapse: collapse;
  }
  ${scope} :where(th, td) {
    padding: 6px ${uiTokens.space.group};
    border-bottom: ${uiTokens.line.width} solid ${uiTokens.line.divider};
    text-align: start;
    vertical-align: top;
  }
  ${scope} :where(th) {
    color: ${uiTokens.ink.secondary};
    font-weight: ${uiTokens.type.weight.medium};
  }
  ${scope} :where(a) {
    color: ${uiTokens.accent.ink};
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-decoration-color: color-mix(in srgb, ${uiTokens.accent.ink} 55%, transparent);
    text-underline-offset: 3px;
  }
  ${scope} :where(a:hover) {
    color: ${uiTokens.ink.primary};
    text-decoration-color: ${uiTokens.ink.primary};
  }
  ${scope} :where(img) {
    max-width: 100%;
    height: auto;
  }
`;
