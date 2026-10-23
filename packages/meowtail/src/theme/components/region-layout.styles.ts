import { css, partSelector } from "meowcss/meowjsx";
import { regionLayoutContract } from "../../components/region-layout";
import { uiTokens } from "../tokens";
import { focusRing } from "../recipes";

export const regionLayoutStyles = css`
  ${partSelector(regionLayoutContract, "root")} {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }
  ${partSelector(regionLayoutContract, "grid")} {
    display: grid;
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }
  ${partSelector(regionLayoutContract, "region")} {
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    contain: layout paint;
  }
  ${partSelector(regionLayoutContract, "region")}[hidden],
  ${partSelector(regionLayoutContract, "back")}[hidden] {
    display: none;
  }
  ${partSelector(regionLayoutContract, "content")} > * {
    flex-shrink: 0;
    min-width: 0;
    max-width: 100%;
  }
  ${partSelector(regionLayoutContract, "content")}[data-scroll-owner="content"] > * {
    flex: 1;
    min-height: 0;
  }
  ${partSelector(regionLayoutContract, "back")} {
    align-self: start;
    flex-shrink: 0;
    min-height: ${uiTokens.control.regular};
    margin-bottom: ${uiTokens.space.group};
    padding: 0 ${uiTokens.control.inset};
    color: ${uiTokens.ink.primary};
    background: transparent;
    border: 0;
    border-radius: ${uiTokens.radius.lg};
    font: inherit;
    cursor: pointer;
  }
  ${partSelector(regionLayoutContract, "back")}:focus-visible {
    ${focusRing({ inset: true })}
  }
`;
