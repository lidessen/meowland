import { css, partSelector } from "meowcss/meowjsx";
import { workCardContract } from "../../components/work-card";
import { uiTokens } from "../tokens";
import { focusRing } from "../recipes";

const part = (name: (typeof workCardContract.parts)[number]) =>
  partSelector(workCardContract, name);

export const workCardStyles = css`
  ${part("root")} {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 14px;
    box-sizing: border-box;
    width: min(100%, 460px);
    padding: ${uiTokens.space.insetBlock} ${uiTokens.space.insetInline};
    border: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    border-radius: ${uiTokens.radius.xl};
    background: ${uiTokens.surface.raised};
    box-shadow: ${uiTokens.shadow.raised};
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body} / ${uiTokens.type.leading} ${uiTokens.type.sans};
    text-align: left;
    cursor: pointer;
    transition:
      border-color ${uiTokens.motion.response} ${uiTokens.motion.ease},
      box-shadow ${uiTokens.motion.settle} ${uiTokens.motion.ease};
  }
  ${part("root")}:hover {
    border-color: color-mix(in srgb, ${uiTokens.accent.base} 50%, transparent);
    box-shadow: ${uiTokens.shadow.raised};
  }
  ${part("root")}:focus-visible {
    ${focusRing()}
  }
  ${part("icon")} {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: ${uiTokens.radius.lg};
    background: ${uiTokens.accent.soft};
    color: ${uiTokens.accent.base};
  }
  ${part("icon")} svg {
    width: ${uiTokens.icon.large};
    height: ${uiTokens.icon.large};
  }
  ${part("copy")} {
    display: grid;
    gap: 4px;
    min-width: 0;
  }
  ${part("title")} {
    font-weight: ${uiTokens.type.weight.semibold};
    overflow-wrap: anywhere;
  }
  /* The status line flows as text, so a long line wraps between words and the
  detail's separator never starts a line of its own. */
  ${part("status")} {
    display: block;
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.label};
    line-height: ${uiTokens.type.line.label};
  }
  ${part("status")} > :first-child {
    margin-inline-end: 6px;
    vertical-align: 0.1em;
  }
  ${part("detail")}::before {
    content: "·";
    margin-inline: 6px;
    color: ${uiTokens.ink.tertiary};
  }
  ${part("action")} {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: ${uiTokens.accent.base};
    font-size: ${uiTokens.type.label};
    white-space: nowrap;
  }
`;
