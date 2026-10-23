import { css } from "meowcss/meowjsx";
import { defineTokens, compileTokens } from "meowcss";
import { uiTokens } from "meowtail/theme";
const languageLine = `calc(${uiTokens.type.body} * ${uiTokens.type.leading})`;
const languageTokens = defineTokens("language", {
  line: languageLine,
  halfLine: `calc(${languageLine} / 2)`,
});
const languageDeclarations = compileTokens(languageTokens, {
  constants: ".language-board",
  sources: [],
});

export const languageStyles = css`
  ${languageDeclarations}
  /* The specimen board arranges real components; their appearance belongs to the theme. */
  .language-board {
    font-size: ${uiTokens.type.body};
    line-height: ${uiTokens.type.leading};
    max-width: 1440px;
    margin-inline: auto;
    display: grid;
    gap: calc(${languageTokens.line} * 1.5);
  }
  .language-board h1,
  .language-board h2,
  .language-board h3,
  .language-board p {
    margin: 0;
  }
  .language-heading {
    display: flex;
    justify-content: space-between;
    align-items: end;
    gap: ${languageTokens.line};
    padding-block: 0 ${languageTokens.line};
    border-bottom: 1px solid ${uiTokens.line.control};
  }
  .language-eyebrow,
  .language-board code {
    font-family: ${uiTokens.type.mono};
    font-size: ${uiTokens.type.caption};
    font-weight: ${uiTokens.type.weight.regular};
    color: ${uiTokens.ink.secondary};
  }
  .language-eyebrow {
    letter-spacing: 0.08em;
  }
  .language-heading h1 {
    font-family: ${uiTokens.type.sans};
    font-size: ${uiTokens.type.pageTitle};
    line-height: ${uiTokens.type.line.pageTitle};
    letter-spacing: -0.02em;
    margin-block: ${languageTokens.halfLine};
  }
  .language-heading p,
  .language-edition,
  .language-note {
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.body};
  }
  .language-edition {
    text-align: right;
    flex-shrink: 0;
    line-height: ${uiTokens.type.leading};
  }
  .language-band {
    display: grid;
    gap: ${languageTokens.halfLine};
  }
  .language-band > h2 {
    display: flex;
    align-items: baseline;
    gap: ${languageTokens.halfLine};
    font-size: 1em;
    font-weight: ${uiTokens.type.weight.semibold};
  }
  .language-band > h2 > span {
    font: ${uiTokens.type.caption}/${uiTokens.type.leading} ${uiTokens.type.mono};
    color: ${uiTokens.ink.secondary};
  }
  .language-board small {
    font-size: ${uiTokens.type.caption};
    color: ${uiTokens.ink.secondary};
    font-weight: ${uiTokens.type.weight.regular};
  }
  .language-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: ${uiTokens.space.panel};
    align-items: start;
  }
  .language-sheet {
    min-width: 0;
    background: ${uiTokens.surface.overlay};
    padding: ${uiTokens.space.panel};
    display: flex;
    flex-direction: column;
    gap: ${uiTokens.space.section};
  }
  .language-sheet h3 {
    font-size: 1em;
    display: flex;
    justify-content: space-between;
    gap: ${languageTokens.halfLine};
  }
  .language-palette {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: ${languageTokens.halfLine};
  }
  .language-swatch {
    display: grid;
    gap: 0;
    min-width: 0;
  }
  .language-swatch > span {
    height: ${uiTokens.control.regular};
    margin-bottom: calc(${languageTokens.halfLine} / 2);
    border: 1px solid ${uiTokens.line.control};
  }
  .language-swatch strong {
    font-size: 1em;
    font-weight: ${uiTokens.type.weight.medium};
  }
  .language-swatch code {
    font-size: ${uiTokens.type.caption};
    overflow-wrap: anywhere;
  }
  .language-semantic-colors {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: ${languageTokens.halfLine};
  }
  .language-semantic-colors > span {
    display: flex;
    align-items: center;
    gap: calc(${languageTokens.halfLine} / 2);
  }
  .language-semantic-colors i {
    width: 0.5em;
    height: 0.5em;
    border-radius: 50%;
  }
  .language-type-specimen {
    font-size: 3em;
    line-height: 1;
    letter-spacing: -0.04em;
  }
  .language-type-specimen > span {
    font-family: ${uiTokens.type.sans};
    color: ${uiTokens.ink.secondary};
  }
  .language-display-specimen {
    font-family: ${uiTokens.type.sans};
    font-size: ${uiTokens.type.pageTitle};
    font-weight: ${uiTokens.type.weight.semibold};
    line-height: ${uiTokens.type.line.pageTitle};
  }
  .language-type-row {
    display: grid;
    grid-template-columns: 4em minmax(0, 1fr);
    gap: ${languageTokens.halfLine};
    align-items: baseline;
  }
  .language-spacing {
    display: grid;
    gap: ${languageTokens.halfLine};
  }
  .language-spacing > div {
    display: flex;
    align-items: center;
    gap: ${languageTokens.line};
  }
  .language-spacing code {
    width: 4em;
  }
  .language-spacing span {
    height: 1em;
    background: ${uiTokens.action.primary};
  }
  .language-shapes {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: ${languageTokens.line};
  }
  .language-shapes > div {
    display: grid;
    gap: ${languageTokens.halfLine};
  }
  .language-shapes span {
    width: 100%;
    height: calc(${languageTokens.line} * 2);
    background: ${uiTokens.action.soft};
    border: 1px solid ${uiTokens.line.control};
  }
  .language-samples {
    display: grid;
    gap: ${uiTokens.space.section};
  }
  .language-input-pair {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, ${uiTokens.layout.gridNormal}), 1fr));
    gap: ${uiTokens.space.section};
  }
  .language-input-pair > * {
    min-width: 0;
  }
  .language-compositions {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    gap: ${languageTokens.line};
    align-items: start;
  }
  .language-conversation,
  .language-context {
    min-width: 0;
    display: grid;
    gap: ${languageTokens.line};
  }
  .language-context h3 {
    font-size: ${uiTokens.type.title};
  }
  .language-context p {
    line-height: ${uiTokens.type.leading};
  }
  .language-icon-strip {
    display: flex;
    justify-content: space-between;
    gap: ${languageTokens.halfLine};
    padding: ${languageTokens.line};
    background: ${uiTokens.surface.overlay};
  }
  @media (max-width: 1000px) {
    .language-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .language-grid > :last-child {
      grid-column: 1 / -1;
    }
    .language-compositions {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  @media (max-width: 600px) {
    .language-heading {
      align-items: start;
    }
    .language-edition {
      display: none;
    }
    .language-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
`;
