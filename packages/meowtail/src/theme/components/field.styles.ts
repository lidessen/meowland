import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { fieldContract } from "../../components/field";

export const fieldStyles = css`
  :where(${partSelector(fieldContract, "root")}) {
    box-sizing: border-box;
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body} / ${uiTokens.type.leading} ${uiTokens.type.sans};
  }
  ${partSelector(fieldContract, "root")} {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    min-width: 0;
    gap: ${uiTokens.space.group};
  }
  ${partSelector(fieldContract, "label")} {
    font-weight: ${uiTokens.type.weight.medium};
    overflow-wrap: anywhere;
  }
  :where(${partSelector(fieldContract, "description")}, ${partSelector(fieldContract, "error")}) {
    margin: 0;
    font-size: ${uiTokens.type.caption};
    line-height: ${uiTokens.type.line.caption};
    overflow-wrap: anywhere;
  }
  ${partSelector(fieldContract, "description")} {
    color: ${uiTokens.ink.secondary};
  }
  ${partSelector(fieldContract, "error")} {
    color: ${uiTokens.status.danger};
  }
  ${partSelector(fieldContract, "control")} {
    min-width: 0;
  }
`;
