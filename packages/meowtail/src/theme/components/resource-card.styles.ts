import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { resourceCardContract } from "../../components/resource-card";
import { accentTokens, layerTokens, lineTokens, radiusTokens } from "../palette";
import { resourceCardTokens } from "./resource-card.tokens";

const card = (part: (typeof resourceCardContract.parts)[number]) =>
  partSelector(resourceCardContract, part);

export const resourceCardStyles = css`
  ${card("root")} {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: ${resourceCardTokens.gap};
    align-content: start;
    min-width: 0;
    padding: ${resourceCardTokens.inset};
    border: ${lineTokens.width} solid ${lineTokens.edge};
    border-radius: ${radiusTokens.card};
    background: ${layerTokens.raised};
    font: ${uiTokens.fontBody}/${uiTokens.leading} ${uiTokens.font};
    color: ${uiTokens.foreground};
    transition: border-color ${uiTokens.durationResponse} ${uiTokens.ease};
  }
  @media (hover: hover) {
    ${card("root")}:hover {
      border-color: color-mix(in srgb, ${uiTokens.foreground} 22%, transparent);
    }
  }
  ${card("root")}[data-tone="muted"] {
    border-style: dashed;
    background: ${layerTokens.sunken};
    color: ${uiTokens.mutedForeground};
  }
  ${card("head")} {
    display: flex;
    flex-wrap: wrap;
    min-width: 0;
    align-items: center;
    gap: 12px;
  }
  ${card("icon")} {
    display: grid;
    place-items: center;
    flex: 0 0 40px;
    width: 40px;
    height: 40px;
    border-radius: 11px;
    background: ${accentTokens.selected};
    color: ${accentTokens.base};
  }
  ${card("root")}[data-tone="muted"] ${card("icon")} {
    background: ${layerTokens.chip};
    color: ${layerTokens.faint};
  }
  ${card("icon")} svg {
    width: 18px;
    height: 18px;
  }
  ${card("copy")} {
    display: grid;
    flex: 1 1 ${uiTokens.gridColumnCompact};
    gap: 1px;
    min-width: 0;
  }
  ${card("title")} {
    margin: 0;
    font-size: ${uiTokens.fontTitle};
    font-weight: 600;
    overflow-wrap: anywhere;
  }
  ${card("subtitle")} {
    color: ${uiTokens.mutedForeground};
    font-size: ${uiTokens.fontCaption};
    overflow-wrap: anywhere;
  }
  ${card("status")} {
    display: inline-flex;
    align-items: center;
    flex: 0 1 auto;
    min-width: 0;
    gap: 6px;
    margin-left: auto;
    color: ${uiTokens.mutedForeground};
    font-size: ${uiTokens.fontCaption};
    overflow-wrap: anywhere;
  }
  ${card("description")} {
    margin: 0;
    color: ${uiTokens.mutedForeground};
    font-size: ${uiTokens.fontBody};
    line-height: ${uiTokens.leading};
    overflow-wrap: anywhere;
  }
  ${card("actions")} {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: ${uiTokens.spaceGroup};
  }
  ${card("identity")} {
    margin-left: auto;
    color: ${uiTokens.mutedForeground};
    font-family: ${uiTokens.mono};
    font-size: ${uiTokens.fontCaption};
    overflow-wrap: anywhere;
  }
  @media (prefers-reduced-motion: reduce) {
    ${card("root")} {
      transition: none;
    }
  }
`;
