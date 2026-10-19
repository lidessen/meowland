import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { accordionContract } from "../../components/accordion";
import { disclosureContract } from "../../components/disclosure";
import { layerTokens, lineTokens, radiusTokens } from "../palette";

const root = partSelector(accordionContract, "root");
const item = partSelector(accordionContract, "item");
const disclosure = partSelector(disclosureContract, "root");
const summary = partSelector(disclosureContract, "summary");
const content = partSelector(disclosureContract, "content");

export const accordionStyles = css`
  ${root} {
    display: grid;
    min-width: 0;
    overflow: hidden;
    border: ${lineTokens.width} solid ${lineTokens.edge};
    border-radius: ${radiusTokens.card};
    background: ${layerTokens.raised};
    color: ${uiTokens.foreground};
  }
  ${item} + ${item} {
    border-top: ${lineTokens.width} solid ${lineTokens.divider};
  }
  ${root} ${disclosure} {
    font-size: ${uiTokens.fontBody};
  }
  ${root} ${summary} {
    min-height: ${uiTokens.controlHeight};
    padding: 6px 12px;
    color: ${uiTokens.foreground};
    border-radius: 0;
  }
  ${root} ${content} {
    padding: 0 12px 12px 34px;
  }
`;
