import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { ChatQuestion } from "../../chat/question";
import type { ActionRow } from "../../components/action-row";
import type { CardFooter } from "../../components/card-footer";
import type { DialogActions } from "../../components/dialog";
import type { IconButton } from "../../components/icon-button";
import { actionRowOptions } from "../../components/action-row.options";
import { selectorForPart } from "../selectors";
const actionRowPartRefs = parts<typeof ActionRow>("action-row");
const cardFooterPartRefs = parts<typeof CardFooter>("card-footer");
const chatQuestionPartRefs = parts<typeof ChatQuestion>("chat-question");
const dialogActionsPartRefs = parts<typeof DialogActions>("dialog-actions");
const iconButtonPartRefs = parts<typeof IconButton>("icon-button");
/*
 * One rule for every row of actions: it stays on one line while it fits and stacks whole when
 * it does not (see observeActionRowFit). Stacked, each text action is a full-width line in DOM
 * order and icon actions stay together on one line, so the row never ends ragged or leaves an
 * action alone. Header action clusters and toolbars keep their own compact rules.
 */
const rows = `:where(${[
  selectorForPart(actionRowPartRefs.root),
  selectorForPart(cardFooterPartRefs.root),
  selectorForPart(dialogActionsPartRefs.root),
  selectorForPart(chatQuestionPartRefs.actions),
].join(", ")})`;
const row = actionRowPartRefs.root;

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
  ${rows}[data-stacked] > :where(${selectorForPart(iconButtonPartRefs.root)}) {
    flex: none;
  }
`;
