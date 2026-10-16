import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { detailSectionContract } from "../../components/detail-section";
import { layerTokens, lineTokens } from "../palette";

const section = (part: (typeof detailSectionContract.parts)[number]) =>
  partSelector(detailSectionContract, part);

export const detailSectionStyles = css`
  ${section("root")} {
    display: grid;
    gap: 10px;
    padding: 16px 0;
    border-bottom: ${lineTokens.width} solid ${lineTokens.divider};
    font: ${uiTokens.fontBody}/1.6 ${uiTokens.font};
    color: ${uiTokens.foreground};
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
    color: ${uiTokens.mutedForeground};
    font-size: 12px;
    font-weight: 600;
    line-height: 1.5;
  }
  ${section("aside")} {
    color: ${layerTokens.faint};
    font-size: 12px;
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
