import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import type { Form } from "../../components/form";
const form = parts<typeof Form>("form");
export const formStyles = css`
  /* Fields, then the outcome, then the actions: each a section step apart. */
  ${form.root} {
    display: grid;
    gap: ${uiTokens.space.section};
    min-width: 0;
  }
  ${form.body} {
    display: grid;
    gap: ${uiTokens.space.section};
    min-width: 0;
  }
  ${form.error},
  ${form.actions} {
    display: contents;
  }
  ${form.status} {
    margin: 0;
    color: ${uiTokens.ink.secondary};
    font: ${uiTokens.type.caption} / ${uiTokens.type.line.caption} ${uiTokens.type.sans};
  }
  ${form.error}[hidden],
  ${form.status}[hidden] {
    display: none;
  }
  ${form.root}[aria-busy="true"] {
    cursor: progress;
  }
`;
