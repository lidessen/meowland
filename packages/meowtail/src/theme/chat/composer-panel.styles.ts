import { css, partSelector } from "meowcss/meowjsx";
import { chatTokens, uiTokens } from "../tokens";
import { composerPanelContract } from "../../chat/composer-panel";
import { chatComposerContract } from "../../chat/composer";

export const composerPanelStyles = css`
  ${partSelector(composerPanelContract, "root")} {
    display: grid;
    gap: ${uiTokens.space.group};
    width: 100%;
    min-width: 0;
    font-family: ${uiTokens.type.sans};
    color: ${uiTokens.ink.primary};
  }
  ${partSelector(composerPanelContract, "surface")} {
    min-width: 0;
  }
  ${partSelector(composerPanelContract, "surface")}[data-meowui-part] > ${partSelector(chatComposerContract, "root")} > ${partSelector(chatComposerContract, "surface")} {
    min-width: 0;
    padding: 12px 14px 10px;
    border: 0;
    border-radius: ${chatTokens.composerRadius};
    background: ${uiTokens.surface.fill};
    box-shadow: 0 0 0 ${uiTokens.line.width} ${uiTokens.line.edge};
    transition: border-color ${uiTokens.motion.response} ${uiTokens.motion.ease};
  }
  ${partSelector(composerPanelContract, "surface")}[data-meowui-part] > ${partSelector(chatComposerContract, "root")} > ${partSelector(chatComposerContract, "surface")}:focus-within {
    border-color: ${uiTokens.line.control};
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
