import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import {
  dialogActionsContract,
  dialogContract,
  dialogHeaderContract,
  dialogPanelContract,
} from "../../components/dialog";
import { pageFrameContract } from "../../components/page-frame";

export const dialogStyles = css`
  :where(${partSelector(dialogContract, "root")}) {
    box-sizing: border-box;
    color: ${uiTokens.foreground};
    font: ${uiTokens.fontBody}/${uiTokens.leading} ${uiTokens.font};
  }
  ${partSelector(dialogContract, "root")} {
    background: ${uiTokens.surface};
    border: 0;
    border-radius: ${uiTokens.dialogRadius};
  }
  ${partSelector(dialogPanelContract, "root")} {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    height: 100%;
    max-height: inherit;
    margin: 0;
    padding: 0;
  }
  ${partSelector(dialogPanelContract, "root")} > ${partSelector(pageFrameContract, "root")} {
    flex: 1;
  }
  /* Keep panel insets inside the body scrollport so edge controls retain their focus ink. */
  ${partSelector(dialogPanelContract, "root")} > ${partSelector(pageFrameContract, "root")} > ${partSelector(pageFrameContract, "header")} {
    padding: ${uiTokens.spacePanel} ${uiTokens.spacePanel} 0;
  }
  ${partSelector(dialogPanelContract, "root")} > ${partSelector(pageFrameContract, "root")} > ${partSelector(pageFrameContract, "body")} {
    padding: ${uiTokens.spacePanel};
  }
  ${partSelector(dialogPanelContract, "root")} > ${partSelector(pageFrameContract, "root")} > ${partSelector(pageFrameContract, "header")} + ${partSelector(pageFrameContract, "body")} {
    padding-top: ${uiTokens.spaceSection};
  }
  ${partSelector(dialogContract, "root")} {
    width: min(380px, calc(100vw - 48px));
    max-height: calc(100dvh - 48px);
    padding: 0;
    overflow: hidden;
    box-shadow: ${uiTokens.shadowPanel};
  }
  ${partSelector(dialogContract, "root")}::backdrop {
    background: ${uiTokens.backdrop};
  }
  :where(${partSelector(dialogHeaderContract, "root")}, ${partSelector(dialogActionsContract, "root")}) {
    display: flex;
    align-items: center;
    gap: ${uiTokens.spaceGroup};
  }
  ${partSelector(dialogHeaderContract, "root")} {
    justify-content: space-between;
    align-items: flex-start;
    min-width: 0;
    margin-bottom: ${uiTokens.spaceSection};
  }
  ${partSelector(dialogPanelContract, "root")} > ${partSelector(pageFrameContract, "root")} > ${partSelector(pageFrameContract, "header")} > ${partSelector(dialogHeaderContract, "root")} {
    margin-bottom: 0;
  }
  ${partSelector(dialogActionsContract, "root")} {
    justify-content: flex-end;
    margin-top: ${uiTokens.spaceSection};
    flex-wrap: wrap;
  }
  ${partSelector(dialogHeaderContract, "title")} {
    margin: 0;
    font-size: ${uiTokens.fontTitle};
    font-weight: 500;
    line-height: 24px;
    overflow-wrap: anywhere;
  }
  ${partSelector(dialogHeaderContract, "identity")} {
    min-width: 0;
  }
  ${partSelector(dialogHeaderContract, "actions")} {
    flex-shrink: 0;
  }
  ${partSelector(dialogHeaderContract, "eyebrow")} {
    margin: 0 0 ${uiTokens.spaceGroup};
    font-size: ${uiTokens.fontCaption};
    color: ${uiTokens.mutedForeground};
  }
  ${partSelector(dialogHeaderContract, "description")} {
    margin: ${uiTokens.spaceGroup} 0 0;
    color: ${uiTokens.mutedForeground};
  }
`;
