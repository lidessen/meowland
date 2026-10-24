import { css, parts } from "meowcss/meowjsx";
import type { Text } from "../../components/text";
import { textOptions } from "../../components/text.options";
import { ui } from "../utilities";
const textPartRefs = parts<typeof Text>("text");
const root = textPartRefs.root;

export const textStyles = css`
  ${root} {
    margin: 0;
    min-width: 0;
    ${ui.text.body}
    overflow-wrap: anywhere;
  }
  ${root} {
    ${textOptions.when({ variant: "secondary" })} {
      ${ui.text.secondary}
    }
  }
  ${root} {
    ${textOptions.when({ variant: "label" })} {
      ${ui.text.label}
    }
  }
  ${root} {
    ${textOptions.when({ variant: "caption" })} {
      ${ui.text.caption}
    }
  }
  /* The shared small-caps label role: menu headings, navigation groups, specimen labels. */
  ${root} {
    ${textOptions.when({ variant: "eyebrow" })} {
      ${ui.text.eyebrow}
    }
  }
`;
