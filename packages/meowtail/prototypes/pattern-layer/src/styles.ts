import { css } from "meowcss/meowjsx";
import { uiTokens } from "meowtail/theme";

/**
 * Reference-scene chrome only. The author pages use public components; they do
 * not import or write style-like rules.
 */
export const patternStyles = css`
  html,
  body,
  #app {
    width: 100%;
    height: 100%;
    margin: 0;
    overflow: hidden;
    background: ${uiTokens.surface.canvas};
  }
  body {
    -webkit-text-size-adjust: 100%;
    font-family: ${uiTokens.type.sans};
    color: ${uiTokens.ink.primary};
  }
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .pl-stage {
    min-height: 100svh;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 40px 24px;
    background: ${uiTokens.surface.canvas};
  }
  .pl-stage > * {
    width: 100%;
    max-width: 720px;
    min-width: 0;
  }
`;
