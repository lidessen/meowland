import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { resourceLinkContract } from "../../components/resource-link";
import { layerTokens, lineTokens } from "../palette";

const link = (part: (typeof resourceLinkContract.parts)[number]) =>
  partSelector(resourceLinkContract, part);

export const resourceLinkStyles = css`
  ${link("root")} {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    box-sizing: border-box;
    width: 100%;
    padding: 12px;
    border: ${lineTokens.width} solid ${lineTokens.edge};
    border-radius: ${uiTokens.radiusLarge};
    background: ${layerTokens.raised};
    box-shadow: ${uiTokens.shadowRaised};
    color: ${uiTokens.foreground};
    font: ${uiTokens.fontBody}/1.5 ${uiTokens.font};
    text-align: left;
    text-decoration: none;
    cursor: pointer;
    transition: border-color ${uiTokens.durationResponse} ${uiTokens.ease};
  }
  ${link("root")}:hover {
    border-color: color-mix(in srgb, ${uiTokens.foreground} 24%, transparent);
  }
  ${link("root")}:focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 2px;
  }
  ${link("icon")} {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: ${uiTokens.radiusSmall};
    background: ${layerTokens.chip};
  }
  ${link("icon")} svg {
    width: 16px;
    height: 16px;
  }
  ${link("copy")} {
    display: grid;
    gap: 2px;
    min-width: 0;
  }
  ${link("title")} {
    overflow: hidden;
    font-size: ${uiTokens.fontBody};
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  ${link("detail")} {
    overflow: hidden;
    color: ${uiTokens.mutedForeground};
    font-size: ${uiTokens.fontCaption};
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  ${link("trailing")} {
    display: grid;
    place-items: center;
    color: ${layerTokens.faint};
  }
  @media (pointer: coarse) {
    ${link("root")} {
      min-height: 44px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    ${link("root")} {
      transition: none;
    }
  }
`;
