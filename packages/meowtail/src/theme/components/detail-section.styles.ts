import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { detailSectionContract } from "../../components/detail-section";

const section = (part: (typeof detailSectionContract.parts)[number]) =>
  partSelector(detailSectionContract, part);

export const detailSectionStyles = css`
  ${section("root")} {
    display: grid;
    gap: 10px;
    padding: 16px 0;
    border-bottom: ${uiTokens.line.width} solid ${uiTokens.line.divider};
    font: ${uiTokens.type.body}/1.6 ${uiTokens.type.sans};
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
    font-weight: 500;
    line-height: 16px;
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
