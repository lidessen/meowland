import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { FieldGroup } from "../../components/field-group";
const fieldGroupPartRefs = parts<typeof FieldGroup>("field-group");
export const fieldGroupStyles = css`
  ${fieldGroupPartRefs.root} {
    min-inline-size: 0;
    margin: 0;
    padding: 0;
    border: 0;
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body} / ${uiTokens.type.leading} ${uiTokens.type.sans};
  }
  ${fieldGroupPartRefs.legend} {
    padding: 0;
    margin-bottom: ${uiTokens.space.group};
    font-weight: ${uiTokens.type.weight.semibold};
    overflow-wrap: anywhere;
  }
  ${fieldGroupPartRefs.description} {
    margin: 0 0 ${uiTokens.space.section};
    color: ${uiTokens.ink.secondary};
  }
  ${fieldGroupPartRefs.content} {
    display: grid;
    gap: ${uiTokens.space.section};
    min-width: 0;
  }
  ${fieldGroupPartRefs.root}:disabled > ${fieldGroupPartRefs.legend} {
    color: ${uiTokens.ink.tertiary};
  }
`;
