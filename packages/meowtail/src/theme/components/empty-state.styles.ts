import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { emptyStateContract, emptyStateOptions } from "../../components/empty-state";

export const emptyStateStyles = css`
  :where(${partSelector(emptyStateContract, "root")}) {
    box-sizing: border-box;
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body} / ${uiTokens.type.leading} ${uiTokens.type.sans};
  }
  ${partSelector(emptyStateContract, "root")} {
    display: grid;
    justify-items: center;
    gap: ${uiTokens.space.section};
    padding: 40px ${uiTokens.space.panel};
    text-align: center;
  }
  ${partSelector(emptyStateContract, "illustration")} {
    display: grid;
    justify-items: center;
    color: ${uiTokens.ink.secondary};
  }
  /* Caller artwork fills a 72px mark; the default EmptyStack keeps its own wider size. */
  ${partSelector(emptyStateContract, "illustration")} > svg {
    display: block;
    width: 72px;
    height: auto;
    stroke-width: 2.4;
  }
  ${partSelector(emptyStateContract, "title")} {
    margin: 0;
    font-size: ${uiTokens.type.title};
    font-weight: ${uiTokens.type.weight.semibold};
    letter-spacing: ${uiTokens.type.trackingTight};
  }
  ${partSelector(emptyStateContract, "description")} {
    max-width: 38ch;
    margin: 0;
    color: ${uiTokens.ink.secondary};
  }
  ${partSelector(emptyStateContract, "root")} {
    ${emptyStateOptions.when({ size: "compact" })} {
      gap: ${uiTokens.space.group};
      padding: ${uiTokens.space.section};
    }
  }
  ${partSelector(emptyStateContract, "root")}[${emptyStateOptions.attribute("size")}="compact"]
  ${partSelector(emptyStateContract, "illustration")} {
    display: none;
  }
  ${partSelector(emptyStateContract, "root")}[${emptyStateOptions.attribute("size")}="compact"]
  ${partSelector(emptyStateContract, "title")} {
    font-size: ${uiTokens.type.body};
  }
`;
