import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { composerPanelContract } from "../../chat/composer-panel";
import { chatComposerContract } from "../../chat/composer";

export const composerPanelStyles = css`
  ${partSelector(composerPanelContract, "root")} {
    display: grid;
    gap: ${uiTokens.spaceGroup};
    width: 100%;
    min-width: 0;
    font-family: ${uiTokens.font};
    color: ${uiTokens.foreground};
  }
  ${partSelector(composerPanelContract, "surface")} {
    min-width: 0;
  }
  ${partSelector(composerPanelContract, "surface")}[data-meowui-part] > ${partSelector(chatComposerContract, "root")} > ${partSelector(chatComposerContract, "surface")} {
    min-width: 0;
    padding: 12px 14px 10px;
    border: 1px solid ${uiTokens.borderSoft};
    border-radius: 24px;
    background: ${uiTokens.surface};
    box-shadow: 0 1px 2px rgb(0 0 0 / 12%);
    transition: border-color ${uiTokens.durationResponse} ${uiTokens.ease};
  }
  ${partSelector(composerPanelContract, "surface")}[data-meowui-part] > ${partSelector(chatComposerContract, "root")} > ${partSelector(chatComposerContract, "surface")}:focus-within {
    border-color: ${uiTokens.border};
  }
  ${partSelector(composerPanelContract, "meta")} {
    min-width: 0;
    padding: 2px 8px 0;
  }
  ${partSelector(composerPanelContract, "surface")} ${partSelector(chatComposerContract, "submit")} {
    border-radius: 50%;
  }

  @media (pointer: coarse) {
    ${partSelector(composerPanelContract, "surface")}[data-meowui-part] ${partSelector(chatComposerContract, "root")}[data-meowui-part] ${partSelector(chatComposerContract, "actions")}[data-meowui-part] button,
    ${partSelector(composerPanelContract, "surface")}[data-meowui-part] ${partSelector(chatComposerContract, "root")}[data-meowui-part] ${partSelector(chatComposerContract, "submit")} {
      min-width: 44px;
      min-height: 44px;
    }
    ${partSelector(composerPanelContract, "surface")}[data-meowui-part] ${partSelector(chatComposerContract, "root")}[data-meowui-part] ${partSelector(chatComposerContract, "input")} {
      min-height: 44px;
    }
  }
`;
