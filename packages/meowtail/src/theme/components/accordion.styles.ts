import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { accordionContract } from "../../components/accordion";
import { disclosureContract } from "../../components/disclosure";
import { layerTokens, lineTokens, radiusTokens } from "../palette";

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
    border: ${lineTokens.width} solid ${lineTokens.edge};
    border-radius: ${radiusTokens.card};
    background: ${layerTokens.raised};
    box-shadow: ${uiTokens.shadowRaised};
    color: ${uiTokens.foreground};
  }
  ${item} + ${item} {
    border-top: ${lineTokens.width} solid ${lineTokens.divider};
  }
  ${root} ${disclosure} {
    font-size: ${uiTokens.fontBody};
  }
  ${root} ${summary} {
    min-height: 44px;
    padding: 12px 16px;
    font-weight: 500;
    color: ${uiTokens.foreground};
    border-radius: 0;
    transition:
      color ${uiTokens.durationResponse} ${uiTokens.ease},
      background-color ${uiTokens.durationResponse} ${uiTokens.ease};
  }
  ${root} ${icon} {
    color: ${uiTokens.mutedForeground};
  }
  @media (hover: hover) {
    ${root} ${summary}:hover {
      background: ${layerTokens.sunken};
      color: ${uiTokens.foreground};
    }
  }
  ${root} ${content} {
    padding: 0 16px 16px 38px;
    color: ${uiTokens.mutedForeground};
    line-height: ${uiTokens.leading};
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
