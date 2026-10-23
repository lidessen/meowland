import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { focusRing } from "../recipes";
import { segmentedControlContract as segmented } from "../../components/segmented-control";

export const segmentedControlStyles = css`
  ${partSelector(segmented, "root")} {
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }
  ${partSelector(segmented, "legend")} {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
  ${partSelector(segmented, "options")} {
    display: flex;
    gap: 2px;
    /* Same track as Tabs: one control height, concentric radii. */
    padding: ${uiTokens.control.trackInset};
    border-radius: calc(${uiTokens.radius.md} + ${uiTokens.control.trackInset});
    background: ${uiTokens.surface.fill};
  }
  ${partSelector(segmented, "option")} {
    position: relative;
    /* Grow from each label's own width so a long label keeps its padding;
       min-width 0 still lets a narrow container wrap the text. */
    flex: 1 1 auto;
    min-width: 0;
    cursor: pointer;
  }
  ${partSelector(segmented, "input")} {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    cursor: inherit;
  }
  ${partSelector(segmented, "label")} {
    display: block;
    box-sizing: border-box;
    min-height: calc(${uiTokens.control.regular} - 2 * ${uiTokens.control.trackInset});
    padding: 4px 12px;
    border-radius: ${uiTokens.radius.md};
    text-align: center;
    font: 500 ${uiTokens.type.body}/22px ${uiTokens.type.sans};
    color: ${uiTokens.ink.secondary};
  }
  ${partSelector(segmented, "input")}:checked + ${partSelector(segmented, "label")} {
    background: ${uiTokens.control.thumb};
    color: ${uiTokens.ink.primary};
    box-shadow: ${uiTokens.shadow.thumb};
  }
  ${partSelector(segmented, "input")}:focus-visible + ${partSelector(segmented, "label")} {
    ${focusRing({ inset: true })}
  }
  ${partSelector(segmented, "input")}:disabled + ${partSelector(segmented, "label")} {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;
