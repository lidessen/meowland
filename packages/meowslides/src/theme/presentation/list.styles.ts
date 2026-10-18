import { css, partSelector } from "meowcss/meowjsx";
import { presentationListContract } from "../../presentation/list";
import { presentationTokens as tokens } from "./presentation.tokens";

const root = partSelector(presentationListContract, "root");
const item = partSelector(presentationListContract, "item");

export const presentationListStyles = css`
  ${root} {
    box-sizing: border-box;
    min-width: 0;
    margin: 0;
    padding-inline-start: 1.35em;
    color: inherit;
    font-size: ${tokens.fontBody};
    line-height: ${tokens.lineHeight};
    overflow-wrap: anywhere;
  }
  ${item} {
    padding-inline-start: 0.15em;
  }
  ${item} + ${item} {
    margin-block-start: ${tokens.spaceGroup};
  }
  ${item} ${root} {
    margin-block-start: ${tokens.spaceGroup};
    font-size: inherit;
  }
`;
