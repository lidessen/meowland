import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { DescriptionItem, DescriptionList } from "../../components/description-list";
const descriptionListPartRefs = parts<typeof DescriptionList>("description-list");
const descriptionItemPartRefs = parts<typeof DescriptionItem>("description-item");
const list = descriptionListPartRefs.root;
const item = (part: keyof typeof descriptionItemPartRefs) => descriptionItemPartRefs[part];

export const descriptionListStyles = css`
  ${list} {
    display: grid;
    grid-template-columns: fit-content(35%) minmax(0, 1fr);
    column-gap: ${uiTokens.space.section};
    row-gap: ${uiTokens.space.group};
    min-width: 0;
    margin: 0;
    container: meowui-description-list / inline-size;
    font: ${uiTokens.type.body} / ${uiTokens.type.leading} ${uiTokens.type.sans};
    color: ${uiTokens.ink.primary};
  }
  ${item("root")} {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
    align-items: baseline;
    min-width: 0;
  }
  ${item("term")}, ${item("value")} {
    min-width: 0;
    margin: 0;
    overflow-wrap: anywhere;
  }
  ${item("term")} {
    color: ${uiTokens.ink.secondary};
  }
  @container meowui-description-list (max-width: 28rem) {
    ${item("root")} {
      grid-template-columns: minmax(0, 1fr);
      row-gap: ${uiTokens.space.group};
    }
  }
`;
