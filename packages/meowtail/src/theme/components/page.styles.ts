import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { pageContract } from "../../components/page";

const page = (part: (typeof pageContract.parts)[number]) => partSelector(pageContract, part);

export const pageStyles = css`
  ${page("root")} {
    box-sizing: border-box;
    min-width: 0;
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body} / ${uiTokens.type.leading} ${uiTokens.type.sans};
  }

  /* The identity block: an optional eyebrow sits above PageHeader's h1. */
  ${page("header")} {
    display: grid;
    gap: ${uiTokens.space.group};
    min-width: 0;
  }
  ${page("eyebrow")} {
    margin: 0;
    min-width: 0;
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.caption};
    font-weight: ${uiTokens.type.weight.medium};
    letter-spacing: ${uiTokens.type.trackingCaps};
    line-height: ${uiTokens.type.line.caption};
    overflow-wrap: anywhere;
  }

  /* A toolbar is a control row, not another reading column. */
  ${page("toolbar")} {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: ${uiTokens.space.group};
    min-width: 0;
  }
  ${page("notice")} {
    min-width: 0;
  }

  /* The page owns the vertical rhythm: one section step between regions and
     between the sections in the content column. */
  ${page("header")}, ${page("toolbar")}, ${page("notice")} {
    margin-bottom: ${uiTokens.space.section};
  }
  ${page("content")} {
    display: grid;
    gap: ${uiTokens.space.section};
    min-width: 0;
  }
  ${page("content")} > * {
    min-width: 0;
  }
`;
