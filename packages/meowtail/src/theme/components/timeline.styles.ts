import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { timelineContract, timelineItemContract } from "../../components/timeline";

const timeline = partSelector(timelineContract, "root");
const entry = (part: (typeof timelineItemContract.parts)[number]) =>
  partSelector(timelineItemContract, part);

export const timelineStyles = css`
  ${timeline} {
    display: grid;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  ${entry("root")} {
    position: relative;
    display: grid;
    grid-template-columns: 14px minmax(0, 1fr);
    column-gap: 12px;
  }
  ${entry("marker")} {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 6px;
  }
  /* One hairline joins the markers; the last event ends it. */
  ${entry("marker")}::after {
    content: "";
    width: ${uiTokens.line.width};
    flex: 1;
    margin-top: 6px;
    background: ${uiTokens.line.edge};
  }
  ${entry("root")}:last-child ${entry("marker")}::after {
    display: none;
  }
  ${entry("content")} {
    display: grid;
    gap: 4px;
    min-width: 0;
    padding-bottom: 16px;
  }
  ${entry("root")}:last-child ${entry("content")} {
    padding-bottom: 0;
  }
  ${entry("head")} {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 4px 8px;
    min-width: 0;
  }
  ${entry("title")} {
    font-weight: ${uiTokens.type.weight.medium};
    overflow-wrap: anywhere;
  }
  /* The rail's dot carries the state's color; the word beside the title stays a quiet caption. */
  ${entry("state")} {
    font-size: ${uiTokens.type.caption};
    color: ${uiTokens.ink.tertiary};
  }
  ${entry("description")} {
    margin: 0;
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.label};
    line-height: ${uiTokens.type.line.label};
    overflow-wrap: anywhere;
  }
  ${entry("actions")} {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 4px;
  }
`;
