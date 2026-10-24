import { css, parts } from "meowcss/meowjsx";
import { chatTokens, uiTokens } from "../tokens";

import type { ChatComposer } from "../../chat/composer";
import type { ComposerPanel } from "../../chat/composer-panel";
const chatComposerPartRefs = parts<typeof ChatComposer>("chat-composer");
const composerPanelPartRefs = parts<typeof ComposerPanel>("composer-panel");
export const composerPanelStyles = css`
  ${composerPanelPartRefs.root} {
    display: grid;
    gap: ${uiTokens.space.group};
    width: 100%;
    min-width: 0;
    font-family: ${uiTokens.type.sans};
    color: ${uiTokens.ink.primary};
  }
  ${composerPanelPartRefs.surface} {
    min-width: 0;
  }
  ${composerPanelPartRefs.surface}[data-meowui-part] > ${chatComposerPartRefs.root} > ${chatComposerPartRefs.surface} {
    min-width: 0;
    padding: 12px 14px 10px;
    border: 0;
    border-radius: ${chatTokens.composerRadius};
    background: ${uiTokens.surface.fill};
    box-shadow: 0 0 0 ${uiTokens.line.width} ${uiTokens.line.edge};
    transition: border-color ${uiTokens.motion.response} ${uiTokens.motion.ease};
  }
  ${composerPanelPartRefs.surface}[data-meowui-part] > ${chatComposerPartRefs.root} > ${chatComposerPartRefs.surface}:focus-within {
    border-color: ${uiTokens.line.control};
  }
  ${composerPanelPartRefs.meta} {
    min-width: 0;
    padding: 2px 8px 0;
  }
  ${composerPanelPartRefs.surface} ${chatComposerPartRefs.submit} {
    border-radius: 50%;
  }

  @media (pointer: coarse) {
    ${composerPanelPartRefs.surface}[data-meowui-part] ${chatComposerPartRefs.root}[data-meowui-part] ${chatComposerPartRefs.actions}[data-meowui-part] button,
    ${composerPanelPartRefs.surface}[data-meowui-part] ${chatComposerPartRefs.root}[data-meowui-part] ${chatComposerPartRefs.submit} {
      min-width: 44px;
      min-height: 44px;
    }
    ${composerPanelPartRefs.surface}[data-meowui-part] ${chatComposerPartRefs.root}[data-meowui-part] ${chatComposerPartRefs.input} {
      min-height: 44px;
    }
  }
`;
