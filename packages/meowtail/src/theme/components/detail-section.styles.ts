import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { DetailSection } from "../../components/detail-section";
const detailSectionPartRefs = parts<typeof DetailSection>("detail-section");
const section = (part: keyof typeof detailSectionPartRefs) => detailSectionPartRefs[part];

export const detailSectionStyles = css`
  ${section("root")} {
    display: grid;
    gap: 10px;
    padding: 16px 0;
    border-bottom: ${uiTokens.line.width} solid ${uiTokens.line.divider};
    font: ${uiTokens.type.body} / ${uiTokens.type.leading} ${uiTokens.type.sans};
    color: ${uiTokens.ink.primary};
  }
  ${section("root")}:last-child {
    border-bottom: 0;
  }
  ${section("header")} {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  ${section("title")} {
    margin: 0;
    /* The shared small-caps group label. */
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.micro};
    font-weight: ${uiTokens.type.weight.medium};
    line-height: ${uiTokens.type.line.micro};
    letter-spacing: ${uiTokens.type.trackingCaps};
    text-transform: uppercase;
  }
  ${section("aside")} {
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.caption};
  }
  ${section("body")} {
    display: grid;
    gap: 8px;
    min-width: 0;
  }
  ${section("body")} > p {
    margin: 0;
  }
`;
