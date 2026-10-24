import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import type { Disclosure } from "../../components/disclosure";
import { ui } from "../utilities";
const disclosurePartRefs = parts<typeof Disclosure>("disclosure");
export const disclosureStyles = css`
  ${disclosurePartRefs.root} {
    min-width: 0;
    color: ${uiTokens.ink.primary};
    font-family: ${uiTokens.type.sans};
    font-size: ${uiTokens.type.label};
  }

  ${disclosurePartRefs.summary} {
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: 24px;
    line-height: ${uiTokens.type.line.reading};
    box-sizing: border-box;
    padding: 0;
    border-radius: ${uiTokens.radius.lg};
    color: ${uiTokens.ink.tertiary};
    cursor: pointer;
    list-style: none;
    overflow-wrap: anywhere;
    transition: color ${uiTokens.motion.response} ${uiTokens.motion.ease};
  }

  ${disclosurePartRefs.summary}::-webkit-details-marker {
    display: none;
  }
  ${disclosurePartRefs.summary}::marker {
    content: "";
  }
  @media (hover: hover) {
    ${disclosurePartRefs.summary}:hover {
      color: ${uiTokens.ink.secondary};
    }
  }
  ${disclosurePartRefs.summary}:focus-visible {
    ${ui.focus.ring}
  }

  ${disclosurePartRefs.icon} {
    display: inline-flex;
    flex: 0 0 auto;
    width: ${uiTokens.icon.size};
    height: ${uiTokens.icon.size};
    align-items: center;
    justify-content: center;
    transition: transform ${uiTokens.motion.settle} ${uiTokens.motion.ease};
  }
  ${disclosurePartRefs.icon} > svg {
    width: ${uiTokens.icon.small};
    height: ${uiTokens.icon.small};
  }
  ${disclosurePartRefs.root}[open] > ${disclosurePartRefs.summary} > ${disclosurePartRefs.icon} {
    transform: rotate(90deg);
  }

  ${disclosurePartRefs.content} {
    min-width: 0;
    padding: 4px 0 4px 22px;
    overflow-wrap: anywhere;
    line-height: ${uiTokens.type.leading};
  }

  @media (pointer: coarse) {
    ${disclosurePartRefs.summary} {
      min-height: 44px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    ${disclosurePartRefs.summary},
    ${disclosurePartRefs.icon} {
      transition: none;
    }
  }
`;
