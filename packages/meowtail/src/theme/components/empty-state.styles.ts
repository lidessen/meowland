import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { EmptyState } from "../../components/empty-state";
import { emptyStateOptions } from "../../components/empty-state.options";
const emptyStatePartRefs = parts<typeof EmptyState>("empty-state");
export const emptyStateStyles = css`
  :where(${emptyStatePartRefs.root}) {
    box-sizing: border-box;
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body} / ${uiTokens.type.leading} ${uiTokens.type.sans};
  }
  ${emptyStatePartRefs.root} {
    display: grid;
    justify-items: center;
    gap: ${uiTokens.space.section};
    padding: 40px ${uiTokens.space.panel};
    text-align: center;
  }
  ${emptyStatePartRefs.illustration} {
    display: grid;
    justify-items: center;
    color: ${uiTokens.ink.secondary};
  }
  /* Caller artwork fills a 72px mark; the default EmptyStack keeps its own wider size. */
  ${emptyStatePartRefs.illustration} > svg {
    display: block;
    width: 72px;
    height: auto;
    stroke-width: 2.4;
  }
  ${emptyStatePartRefs.title} {
    margin: 0;
    font-family: ${uiTokens.type.display};
    font-size: ${uiTokens.type.title};
    font-weight: ${uiTokens.type.weight.semibold};
    letter-spacing: ${uiTokens.type.trackingTight};
  }
  ${emptyStatePartRefs.description} {
    max-width: 38ch;
    margin: 0;
    color: ${uiTokens.ink.secondary};
  }
  ${emptyStatePartRefs.root} {
    ${emptyStateOptions.when({ size: "compact" })} {
      gap: ${uiTokens.space.group};
      padding: ${uiTokens.space.section};
    }
  }
  ${emptyStatePartRefs.root}[${emptyStateOptions.attribute("size")}="compact"]
  ${emptyStatePartRefs.illustration} {
    display: none;
  }
  ${emptyStatePartRefs.root}[${emptyStateOptions.attribute("size")}="compact"]
  ${emptyStatePartRefs.title} {
    font-size: ${uiTokens.type.body};
  }
`;
