import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { Field } from "../../components/field";
const fieldPartRefs = parts<typeof Field>("field");
export const fieldStyles = css`
  :where(${fieldPartRefs.root}) {
    box-sizing: border-box;
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body} / ${uiTokens.type.leading} ${uiTokens.type.sans};
  }
  ${fieldPartRefs.root} {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    min-width: 0;
    gap: ${uiTokens.space.group};
  }
  ${fieldPartRefs.label} {
    font-weight: ${uiTokens.type.weight.medium};
    overflow-wrap: anywhere;
  }
  :where(${fieldPartRefs.description}, ${fieldPartRefs.error}) {
    margin: 0;
    font-size: ${uiTokens.type.caption};
    line-height: ${uiTokens.type.line.caption};
    overflow-wrap: anywhere;
  }
  ${fieldPartRefs.description} {
    color: ${uiTokens.ink.secondary};
  }
  ${fieldPartRefs.error} {
    color: ${uiTokens.status.danger};
  }
  ${fieldPartRefs.control} {
    min-width: 0;
  }
`;
