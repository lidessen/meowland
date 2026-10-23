import { css, partSelector } from "meowcss/meowjsx";
import { chatTaskContract } from "../../chat/task";
import { uiTokens } from "../tokens";

const part = (name: (typeof chatTaskContract.parts)[number]) =>
  partSelector(chatTaskContract, name);

export const chatTaskStyles = css`
  ${part("root")} {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-content: start;
    gap: ${uiTokens.space.group};
    min-width: 0;
    max-width: 100%;
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body}/${uiTokens.type.leading} ${uiTokens.type.sans};
    overflow-wrap: anywhere;
  }
  /* Title, then its state badge right beside it, then the host's fact on its own row. */
  ${part("header")} {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px ${uiTokens.space.group};
    min-width: 0;
  }
  ${part("title")} {
    flex: 0 1 auto;
    min-width: 0;
    font-weight: 600;
  }
  /* The state badge comes from shared/state-badge.styles.ts; the fact line takes its own row. */
  ${part("fact")} {
    flex: 1 0 100%;
    min-width: 0;
    margin-top: -2px;
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.caption};
    line-height: 18px;
    overflow-wrap: anywhere;
  }
  ${part("description")}, ${part("execution")}, ${part("reply")} {
    min-width: 0;
    margin: 0;
    white-space: pre-wrap;
    color: ${uiTokens.ink.secondary};
  }
  ${part("progress")} {
    display: grid;
    gap: ${uiTokens.space.group};
    min-width: 0;
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.caption};
  }
  ${part("progressLabel")} {
    min-width: 0;
    line-height: 1.4;
  }
  ${part("progressBar")} {
    display: contents;
  }
  ${part("body")} {
    display: grid;
    align-content: start;
    gap: ${uiTokens.space.section};
    box-sizing: border-box;
    min-width: 0;
    padding-inline-start: ${uiTokens.space.section};
    border-inline-start: 1px solid ${uiTokens.line.divider};
  }
  ${part("body")} > :first-child {
    margin-block-start: 0;
  }
  ${part("body")} > :last-child {
    margin-block-end: 0;
  }
  ${part("footer")} {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: ${uiTokens.space.group};
    min-width: 0;
  }
  ${part("root")} > [hidden], ${part("body")}:empty, ${part("footer")}:empty {
    display: none;
  }
`;
