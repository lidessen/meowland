import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { textContract, textOptions } from "../../components/text";

const root = partSelector(textContract, "root");

export const textStyles = css`
  ${root} {
    margin: 0;
    min-width: 0;
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body}/${uiTokens.type.leading} ${uiTokens.type.sans};
    overflow-wrap: anywhere;
  }
  ${root} {
    ${textOptions.when({ variant: "secondary" })} {
      color: ${uiTokens.ink.secondary};
    }
  }
  ${root} {
    ${textOptions.when({ variant: "caption" })} {
      color: ${uiTokens.ink.secondary};
      font-size: ${uiTokens.type.caption};
      line-height: 1.5;
    }
  }
  /* The shared small-caps label role: menu headings, navigation groups, specimen labels. */
  ${root} {
    ${textOptions.when({ variant: "eyebrow" })} {
      color: ${uiTokens.ink.tertiary};
      font-size: ${uiTokens.type.micro};
      font-weight: 500;
      line-height: 16px;
      letter-spacing: ${uiTokens.type.trackingCaps};
      text-transform: uppercase;
    }
  }
`;
