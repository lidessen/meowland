import { css, parts } from "meowcss/meowjsx";
import type { PresentationLayout } from "../../presentation/layout";
import { presentationTokens as tokens } from "./presentation.tokens";

const part = parts<typeof PresentationLayout>("presentation-layout");

export const presentationLayoutStyles = css`
  ${part.root} {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    gap: ${tokens.spaceSection};
  }
  :where(${part.header}, ${part.footer}) {
    flex: 0 0 auto;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  ${part.body} {
    display: grid;
    flex: 1 1 0;
    min-width: 0;
    min-height: 0;
    grid-template-columns: minmax(0, 1fr);
    gap: inherit;
  }
  ${part.body} > * {
    min-width: 0;
    min-height: 0;
  }
  ${part.root}[data-columns="equal"] > ${part.body} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  ${part.root}[data-columns="3"] > ${part.body} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  ${part.root}[data-columns="wide-start"] > ${part.body} {
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  }
  ${part.root}[data-columns="wide-end"] > ${part.body} {
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  }
  ${part.root}[data-gap="none"] {
    gap: 0;
  }
  ${part.root}[data-gap="compact"] {
    gap: ${tokens.spaceGroup};
  }
  ${part.root}[data-gap="relaxed"] {
    gap: ${tokens.spacePanel};
  }
`;
