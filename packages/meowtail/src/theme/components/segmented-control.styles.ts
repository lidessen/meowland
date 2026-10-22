import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { segmentedControlContract as segmented } from "../../components/segmented-control";
import { layerTokens } from "../palette";

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
    padding: 3px;
    border-radius: 12px;
    background: ${layerTokens.chip};
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
    min-height: 32px;
    padding: 6px 14px;
    border-radius: 9px;
    text-align: center;
    font: 500 13px/20px ${uiTokens.font};
    color: ${uiTokens.mutedForeground};
  }
  ${partSelector(segmented, "input")}:checked + ${partSelector(segmented, "label")} {
    background: ${uiTokens.surface};
    color: ${uiTokens.foreground};
    /* A raised thumb, not a floating panel: hairline plus a short drop. */
    box-shadow:
      0 0 0 0.5px ${uiTokens.borderSubtle},
      0 1px 2px rgb(0 0 0 / 8%);
  }
  ${partSelector(segmented, "input")}:focus-visible + ${partSelector(segmented, "label")} {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 2px;
  }
  ${partSelector(segmented, "input")}:disabled + ${partSelector(segmented, "label")} {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;
