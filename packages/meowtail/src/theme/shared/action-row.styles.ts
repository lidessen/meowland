import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { actionRowContract, actionRowOptions } from "../../components/action-row";
import { cardFooterContract } from "../../components/card-footer";
import { dialogActionsContract } from "../../components/dialog";
import { iconButtonContract } from "../../components/icon-button";
import { chatQuestionContract } from "../../chat/question";

/*
 * One rule for every row of actions: it stays on one line while it fits and stacks whole when
 * it does not (see observeActionRowFit). Stacked, each text action is a full-width line in DOM
 * order and icon actions stay together on one line, so the row never ends ragged or leaves an
 * action alone. Header action clusters and toolbars keep their own compact rules.
 */
const rows = `:where(${[
  partSelector(actionRowContract, "root"),
  partSelector(cardFooterContract, "root"),
  partSelector(dialogActionsContract, "root"),
  partSelector(chatQuestionContract, "actions"),
].join(", ")})`;
const row = partSelector(actionRowContract, "root");

export const actionRowStyles = css`
  ${row} {
    display: flex;
    align-items: center;
    gap: ${uiTokens.space.group};
    min-width: 0;
  }
  ${row} {
    ${actionRowOptions.when({ align: "end" })} {
      justify-content: flex-end;
    }
  }
  ${rows} {
    flex-wrap: wrap;
  }
  /* The fit check lays the row out on one line at natural widths for one read. */
  ${rows}[data-measuring] {
    flex-wrap: nowrap;
  }
  ${rows}[data-measuring] > * {
    flex: none;
  }
  ${rows}[data-stacked] > * {
    flex: 1 0 100%;
    min-width: 0;
  }
  ${rows}[data-stacked] > :where(${partSelector(iconButtonContract, "root")}) {
    flex: none;
  }
`;
