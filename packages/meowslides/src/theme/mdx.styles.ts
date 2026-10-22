import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "meowtail/theme";
import { buttonContract } from "meowtail";
import { presentationImageContract } from "../presentation/image";
import { presentationVideoContract } from "../presentation/media";
import { mdxSlideContract } from "../mdx-contract";
import { presentationTokens as tokens } from "./presentation/presentation.tokens";

const part = (name: (typeof mdxSlideContract.parts)[number]) =>
  partSelector(mdxSlideContract, name);

/** A whole Markdown flow occupies one layout column; paragraphs never become grid tracks. */
export const mdxSlideStyles = css`
  ${part("root")} {
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
  }
  /* Canvas defaults yield to explicit component sizes and host classes. */
  ${part("root")} :where(button, ${partSelector(buttonContract, "root")}) {
    font: inherit;
    min-height: 2em;
    height: auto;
    max-width: 100%;
    padding: 0.25em 0.7em;
    gap: 0.35em;
  }
  ${part("flow")} {
    display: flex;
    flex-direction: column;
    gap: ${tokens.spaceGroup};
    min-width: 0;
    min-height: 0;
    overflow-wrap: anywhere;
  }
  ${part("flow")} > * {
    flex: 0 0 auto;
    min-width: 0;
    margin-block: 0;
  }
  ${part("flow")} > ${partSelector(presentationImageContract, "root")},
  ${part("flow")} > ${partSelector(presentationVideoContract, "root")} {
    flex: 0 1 auto;
    min-height: 0;
  }
  ${part("flow")} :where(ul, ol) {
    margin-block: 0;
    padding-inline-start: 1.3em;
    list-style-position: outside;
  }
  ${part("flow")} :where(ul) {
    list-style-type: disc;
  }
  ${part("flow")} :where(ol) {
    list-style-type: decimal;
  }
  ${part("flow")} :where(li + li, li > ul, li > ol) {
    margin-block-start: ${tokens.spaceGroup};
  }
  ${part("flow")} :where(li > p) {
    margin-block: 0;
  }
  ${part("flow")} :where(blockquote) {
    margin-inline: 0;
    padding-inline-start: ${tokens.spaceGroup};
    border-inline-start: 2px solid ${uiTokens.line.divider};
    color: ${tokens.muted};
  }
  ${part("flow")} :where(pre) {
    overflow: auto;
    white-space: pre;
    padding: ${tokens.spaceGroup};
    border-radius: ${uiTokens.radius.md};
    background: ${uiTokens.surface.fill};
    font-size: ${tokens.fontCaption};
    line-height: ${tokens.lineHeight};
  }
  ${part("flow")} :where(code) {
    font-family: ${uiTokens.type.mono};
  }
  ${part("flow")} :where(table) {
    width: 100%;
    border-collapse: collapse;
    font-size: inherit;
  }
  ${part("flow")} :where(th, td) {
    padding: ${tokens.spaceGroup};
    border-bottom: 1px solid ${uiTokens.line.divider};
    text-align: start;
    overflow-wrap: anywhere;
  }
  ${part("flow")} :where(a) {
    color: ${tokens.accent};
    text-underline-offset: 0.14em;
  }
`;
