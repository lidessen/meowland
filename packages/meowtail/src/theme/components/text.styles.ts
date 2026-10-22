import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { textContract, textOptions } from "../../components/text";

const root = partSelector(textContract, "root");

export const textStyles = css`
  ${root} {
    margin: 0;
    min-width: 0;
    color: ${uiTokens.foreground};
    font: ${uiTokens.fontBody}/${uiTokens.leading} ${uiTokens.font};
    overflow-wrap: anywhere;
  }
  ${root} {
    ${textOptions.when({ variant: "secondary" })} {
      color: ${uiTokens.mutedForeground};
    }
  }
  ${root} {
    ${textOptions.when({ variant: "caption" })} {
      color: ${uiTokens.mutedForeground};
      font-size: ${uiTokens.fontCaption};
      line-height: 1.5;
    }
  }
  /* The shared small-caps label role: menu headings, navigation groups, specimen labels. */
  ${root} {
    ${textOptions.when({ variant: "eyebrow" })} {
      color: ${uiTokens.subtleForeground};
      font-size: ${uiTokens.fontMicro};
      font-weight: 500;
      line-height: 16px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
  }
`;
