import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { Accordion } from "../../components/accordion";
import type { Disclosure } from "../../components/disclosure";
const accordionPartRefs = parts<typeof Accordion>("accordion");
const disclosurePartRefs = parts<typeof Disclosure>("disclosure");
const root = accordionPartRefs.root;
const item = accordionPartRefs.item;
const disclosure = disclosurePartRefs.root;
const summary = disclosurePartRefs.summary;
const icon = disclosurePartRefs.icon;
const content = disclosurePartRefs.content;

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
    font-weight: ${uiTokens.type.weight.medium};
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
