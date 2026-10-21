import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { pageContract } from "../../components/page";

const page = (part: (typeof pageContract.parts)[number]) => partSelector(pageContract, part);

export const pageStyles = css`
  ${page("root")} {
    box-sizing: border-box;
    min-width: 0;
    color: ${uiTokens.foreground};
    font: ${uiTokens.fontBody}/${uiTokens.leading} ${uiTokens.font};
  }

  /* The identity block: an optional eyebrow sits above PageHeader's h1. */
  ${page("header")} {
    display: grid;
    gap: ${uiTokens.spaceGroup};
    min-width: 0;
  }
  ${page("eyebrow")} {
    margin: 0;
    min-width: 0;
    color: ${uiTokens.mutedForeground};
    font-size: ${uiTokens.fontCaption};
    font-weight: 500;
    letter-spacing: 0.04em;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  /* A toolbar is a control row, not another reading column. */
  ${page("toolbar")} {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: ${uiTokens.spaceGroup};
    min-width: 0;
  }
  ${page("notice")} {
    min-width: 0;
  }

  /* The page owns the vertical rhythm: one section step between regions and
     between the sections in the content column. */
  ${page("header")}, ${page("toolbar")}, ${page("notice")} {
    margin-bottom: ${uiTokens.spaceSection};
  }
  ${page("content")} {
    display: grid;
    gap: ${uiTokens.spaceSection};
    min-width: 0;
  }
  ${page("content")} > * {
    min-width: 0;
  }
`;
