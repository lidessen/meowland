import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { timelineContract, timelineItemContract } from "../../components/timeline";
import { accentTokens, lineTokens, statusTokens } from "../palette";

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
    width: ${lineTokens.width};
    flex: 1;
    margin-top: 6px;
    background: ${lineTokens.edge};
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
    font-weight: 500;
    overflow-wrap: anywhere;
  }
  ${entry("state")} {
    font-size: 12px;
    color: ${uiTokens.mutedForeground};
  }
  ${entry("root")}[data-state="processing"] ${entry("state")} {
    color: ${accentTokens.base};
  }
  ${entry("root")}[data-state="returned"] ${entry("state")},
  ${entry("root")}[data-state="success"] ${entry("state")} {
    color: ${statusTokens.successInk};
  }
  ${entry("root")}[data-state="warning"] ${entry("state")} {
    color: ${statusTokens.warning};
  }
  ${entry("root")}[data-state="danger"] ${entry("state")} {
    color: ${statusTokens.danger};
  }
  ${entry("description")} {
    margin: 0;
    color: ${uiTokens.mutedForeground};
    font-size: 12.5px;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }
  ${entry("actions")} {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 4px;
  }
`;
