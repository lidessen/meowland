import { css, partSelector } from "meowcss/meowjsx";
import { text } from "../recipes";
import { textContract, textOptions } from "../../components/text";

const root = partSelector(textContract, "root");

export const textStyles = css`
  ${root} {
    margin: 0;
    min-width: 0;
    ${text("body")}
    overflow-wrap: anywhere;
  }
  ${root} {
    ${textOptions.when({ variant: "secondary" })} {
      ${text("secondary")}
    }
  }
  ${root} {
    ${textOptions.when({ variant: "label" })} {
      ${text("label")}
    }
  }
  ${root} {
    ${textOptions.when({ variant: "caption" })} {
      ${text("caption")}
    }
  }
  /* The shared small-caps label role: menu headings, navigation groups, specimen labels. */
  ${root} {
    ${textOptions.when({ variant: "eyebrow" })} {
      ${text("eyebrow")}
    }
  }
`;
