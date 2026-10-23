import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { accordionContract } from "../../components/accordion";
import { disclosureContract } from "../../components/disclosure";

const root = partSelector(accordionContract, "root");
const item = partSelector(accordionContract, "item");
const disclosure = partSelector(disclosureContract, "root");
const summary = partSelector(disclosureContract, "summary");
const icon = partSelector(disclosureContract, "icon");
const content = partSelector(disclosureContract, "content");

export const accordionStyles = css`
  ${root} {
    display: grid;
    min-width: 0;
    overflow: hidden;
    border: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    border-radius: ${uiTokens.radius.xl};
    background: ${uiTokens.surface.raised};
    box-shadow: ${uiTokens.shadow.raised};
    color: ${uiTokens.ink.primary};
  }
  ${item} + ${item} {
    border-top: ${uiTokens.line.width} solid ${uiTokens.line.divider};
  }
  ${root} ${disclosure} {
    font-size: ${uiTokens.type.body};
  }
  ${root} ${summary} {
    /* A card-level header: the large control height, the compact inline inset. */
    min-height: ${uiTokens.control.large};
    padding: 10px ${uiTokens.space.insetInline};
    font-weight: 500;
    color: ${uiTokens.ink.primary};
    border-radius: 0;
    transition:
      color ${uiTokens.motion.response} ${uiTokens.motion.ease},
      background-color ${uiTokens.motion.response} ${uiTokens.motion.ease};
  }
  ${root} ${icon} {
    color: ${uiTokens.ink.secondary};
  }
  @media (hover: hover) {
    ${root} ${summary}:hover {
      background: ${uiTokens.state.hover};
      color: ${uiTokens.ink.primary};
    }
  }
  ${root} ${content} {
    padding: 0 ${uiTokens.space.insetInline} ${uiTokens.space.insetInline} 38px;
    color: ${uiTokens.ink.secondary};
    line-height: ${uiTokens.type.leading};
  }
  ${root} ${content} > :first-child {
    margin-block-start: 0;
  }
  ${root} ${content} > :last-child {
    margin-block-end: 0;
  }
  @media (prefers-reduced-motion: reduce) {
    ${root} ${summary} {
      transition: none;
    }
  }
`;
