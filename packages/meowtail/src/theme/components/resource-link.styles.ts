import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { focusRing } from "../recipes";
import { resourceLinkContract } from "../../components/resource-link";

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
    padding: ${uiTokens.space.insetBlock} ${uiTokens.space.insetInline};
    border: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    border-radius: ${uiTokens.radius.xl};
    background: ${uiTokens.surface.raised};
    box-shadow: ${uiTokens.shadow.raised};
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body}/1.5 ${uiTokens.type.sans};
    text-align: left;
    text-decoration: none;
    cursor: pointer;
    transition: border-color ${uiTokens.motion.response} ${uiTokens.motion.ease};
  }
  ${link("root")}:hover {
    border-color: color-mix(in srgb, ${uiTokens.ink.primary} 24%, transparent);
  }
  ${link("root")}:focus-visible {
    ${focusRing()}
  }
  ${link("icon")} {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: ${uiTokens.radius.md};
    background: ${uiTokens.surface.fill};
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
    font-size: ${uiTokens.type.body};
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  ${link("detail")} {
    overflow: hidden;
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.caption};
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  ${link("trailing")} {
    display: grid;
    place-items: center;
    color: ${uiTokens.ink.tertiary};
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
