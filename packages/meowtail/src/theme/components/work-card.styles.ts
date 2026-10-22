import { css, partSelector } from "meowcss/meowjsx";
import { workCardContract } from "../../components/work-card";
import { uiTokens } from "../tokens";
import { accentTokens, layerTokens, lineTokens, radiusTokens } from "../palette";

const part = (name: (typeof workCardContract.parts)[number]) =>
  partSelector(workCardContract, name);

export const workCardStyles = css`
  ${part("root")} {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 14px;
    box-sizing: border-box;
    width: min(100%, 460px);
    padding: 14px 16px;
    border: ${lineTokens.width} solid ${lineTokens.edge};
    border-radius: ${radiusTokens.card};
    background: ${layerTokens.raised};
    box-shadow: ${uiTokens.shadowRaised};
    color: ${uiTokens.foreground};
    font: ${uiTokens.fontBody}/1.5 ${uiTokens.font};
    text-align: left;
    cursor: pointer;
    transition:
      border-color ${uiTokens.durationResponse} ${uiTokens.ease},
      box-shadow ${uiTokens.durationSettle} ${uiTokens.ease};
  }
  ${part("root")}:hover {
    border-color: color-mix(in srgb, ${accentTokens.base} 50%, transparent);
    box-shadow: 0 2px 12px rgb(0 0 0 / 5%);
  }
  ${part("root")}:focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 2px;
  }
  ${part("icon")} {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: ${radiusTokens.control};
    background: ${accentTokens.soft};
    color: ${accentTokens.base};
  }
  ${part("icon")} svg {
    width: 18px;
    height: 18px;
  }
  ${part("copy")} {
    display: grid;
    gap: 3px;
    min-width: 0;
  }
  ${part("title")} {
    font-weight: 600;
    overflow-wrap: anywhere;
  }
  ${part("status")} {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    color: ${uiTokens.mutedForeground};
    font-size: ${uiTokens.fontLabel};
    line-height: 1.5;
  }
  ${part("detail")}::before {
    content: "·";
    margin-inline-end: 6px;
    color: ${layerTokens.faint};
  }
  ${part("action")} {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: ${accentTokens.base};
    font-size: ${uiTokens.fontLabel};
    white-space: nowrap;
  }
`;
