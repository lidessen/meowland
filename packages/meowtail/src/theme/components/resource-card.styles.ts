import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { ResourceCard } from "../../components/resource-card";
const resourceCardPartRefs = parts<typeof ResourceCard>("resource-card");
const card = (part: keyof typeof resourceCardPartRefs) => resourceCardPartRefs[part];

export const resourceCardStyles = css`
  ${card("root")} {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: ${uiTokens.space.insetBlock};
    align-content: start;
    min-width: 0;
    padding: ${uiTokens.space.insetInline};
    border: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    border-radius: ${uiTokens.radius.xl};
    background: ${uiTokens.surface.raised};
    box-shadow: ${uiTokens.shadow.raised};
    font: ${uiTokens.type.body} / ${uiTokens.type.leading} ${uiTokens.type.sans};
    color: ${uiTokens.ink.primary};
    transition: border-color ${uiTokens.motion.response} ${uiTokens.motion.ease};
  }
  @media (hover: hover) {
    ${card("root")}:hover {
      border-color: color-mix(in srgb, ${uiTokens.ink.primary} 22%, transparent);
    }
  }
  ${card("root")}[data-tone="muted"] {
    border-style: dashed;
    background: ${uiTokens.surface.fill};
    color: ${uiTokens.ink.secondary};
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
    border-radius: ${uiTokens.radius.lg};
    background: ${uiTokens.accent.selected};
    color: ${uiTokens.accent.base};
  }
  ${card("root")}[data-tone="muted"] ${card("icon")} {
    background: ${uiTokens.surface.fill};
    color: ${uiTokens.ink.tertiary};
  }
  ${card("icon")} svg {
    width: ${uiTokens.icon.large};
    height: ${uiTokens.icon.large};
  }
  ${card("copy")} {
    display: grid;
    flex: 1 1 ${uiTokens.layout.gridCompact};
    gap: 1px;
    min-width: 0;
  }
  ${card("title")} {
    margin: 0;
    font-family: ${uiTokens.type.display};
    font-size: ${uiTokens.type.title};
    font-weight: ${uiTokens.type.weight.semibold};
    letter-spacing: ${uiTokens.type.trackingTight};
    overflow-wrap: anywhere;
  }
  ${card("subtitle")} {
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.caption};
    overflow-wrap: anywhere;
  }
  ${card("status")} {
    display: inline-flex;
    align-items: center;
    flex: 0 1 auto;
    min-width: 0;
    gap: 6px;
    margin-left: auto;
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.caption};
    overflow-wrap: anywhere;
  }
  ${card("description")} {
    margin: 0;
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.body};
    line-height: ${uiTokens.type.leading};
    overflow-wrap: anywhere;
  }
  ${card("actions")} {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: ${uiTokens.space.group};
  }
  ${card("identity")} {
    margin-left: auto;
    color: ${uiTokens.ink.secondary};
    font-family: ${uiTokens.type.mono};
    font-size: ${uiTokens.type.caption};
    overflow-wrap: anywhere;
  }
  @media (prefers-reduced-motion: reduce) {
    ${card("root")} {
      transition: none;
    }
  }

  @media (pointer: coarse) {
    ${card("actions")}[data-meowui-part] > * {
      min-width: 44px;
      min-height: 44px;
    }
  }
`;
