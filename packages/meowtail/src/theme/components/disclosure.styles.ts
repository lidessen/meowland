import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { disclosureContract } from "../../components/disclosure";

export const disclosureStyles = css`
  ${partSelector(disclosureContract, "root")} {
    min-width: 0;
    color: ${uiTokens.foreground};
    font-family: ${uiTokens.font};
    font-size: ${uiTokens.fontLabel};
  }

  ${partSelector(disclosureContract, "summary")} {
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: 24px;
    line-height: 24px;
    box-sizing: border-box;
    padding: 0;
    border-radius: ${uiTokens.controlRadius};
    color: ${uiTokens.subtleForeground};
    cursor: pointer;
    list-style: none;
    overflow-wrap: anywhere;
    transition: color ${uiTokens.durationResponse} ease;
  }

  ${partSelector(disclosureContract, "summary")}::-webkit-details-marker {
    display: none;
  }
  ${partSelector(disclosureContract, "summary")}::marker {
    content: "";
  }
  @media (hover: hover) {
    ${partSelector(disclosureContract, "summary")}:hover {
      color: ${uiTokens.mutedForeground};
    }
  }
  ${partSelector(disclosureContract, "summary")}:focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 2px;
  }

  ${partSelector(disclosureContract, "icon")} {
    display: inline-flex;
    flex: 0 0 auto;
    width: ${uiTokens.iconSize};
    height: ${uiTokens.iconSize};
    align-items: center;
    justify-content: center;
    transition: transform ${uiTokens.durationSettle} ${uiTokens.ease};
  }
  ${partSelector(disclosureContract, "icon")} > svg {
    width: 14px;
    height: 14px;
  }
  ${partSelector(disclosureContract, "root")}[open] > ${partSelector(disclosureContract, "summary")} > ${partSelector(disclosureContract, "icon")} {
    transform: rotate(90deg);
  }

  ${partSelector(disclosureContract, "content")} {
    min-width: 0;
    padding: 4px 0 4px 22px;
    overflow-wrap: anywhere;
    line-height: ${uiTokens.leading};
  }

  @media (pointer: coarse) {
    ${partSelector(disclosureContract, "summary")} {
      min-height: 44px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    ${partSelector(disclosureContract, "summary")},
    ${partSelector(disclosureContract, "icon")} {
      transition: none;
    }
  }
`;
