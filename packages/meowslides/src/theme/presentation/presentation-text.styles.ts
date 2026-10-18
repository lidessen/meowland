import { css, partSelector } from "meowcss/meowjsx";
import {
  presentationTextContract,
  presentationTextOptions,
} from "../../presentation/presentation-text";
import { presentationTokens } from "./presentation.tokens";

const root = partSelector(presentationTextContract, "root");
const content = partSelector(presentationTextContract, "content");

export const presentationTextStyles = css`
  ${root} {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  /* Decorative treatments are progressive enhancements of the same readable text. */
  @media screen and (forced-colors: none) {
    ${root} {
      ${presentationTextOptions.when({ effect: "editorial" })} {
        font-weight: 600;
        letter-spacing: -0.035em;
        line-height: 1.12;
        text-wrap: balance;
      }
      ${presentationTextOptions.when({ effect: "marker" })} {
        font-weight: 600;
        letter-spacing: -0.025em;
        line-height: 1.2;
        text-wrap: balance;
        ${content} {
          background: linear-gradient(
            transparent 72%,
            color-mix(in srgb, ${presentationTokens.accent} 20%, transparent) 72%,
            color-mix(in srgb, ${presentationTokens.accent} 20%, transparent) 94%,
            transparent 94%
          );
          -webkit-box-decoration-break: clone;
          box-decoration-break: clone;
        }
      }
    }
  }
`;
