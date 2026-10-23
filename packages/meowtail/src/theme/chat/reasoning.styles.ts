import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { focusRing } from "../recipes";
import { chatReasoningContract } from "../../chat/reasoning";

const part = (name: (typeof chatReasoningContract.parts)[number]) =>
  partSelector(chatReasoningContract, name);

export const chatReasoningStyles = css`
  ${part("root")} {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    min-width: 0;
    padding-block: 4px;
    color: ${uiTokens.ink.secondary};
  }
  /* The same row as ChatProcess: a glyph box, then a one-line label. */
  ${part("summary")} {
    display: flex;
    align-items: center;
    gap: 4px;
    width: fit-content;
    max-width: 100%;
    list-style: none;
    cursor: pointer;
    color: ${uiTokens.ink.primary};
    font-size: ${uiTokens.type.body};
    line-height: ${uiTokens.type.line.bodyCompact};
  }
  ${part("root")}:not([data-active="true"]) > ${part("summary")} {
    color: ${uiTokens.ink.secondary};
  }
  ${part("summary")}::-webkit-details-marker {
    display: none;
  }
  ${part("root")}:not([data-active="true"]) > ${part("summary")}:hover {
    color: ${uiTokens.ink.primary};
  }
  ${part("summary")}:focus-visible {
    ${focusRing()}
    border-radius: ${uiTokens.radius.md};
  }
  ${part("icon")} {
    display: grid;
    place-items: center;
    flex: none;
    width: 20px;
    height: 20px;
  }
  /* The thinking glyph: nine 2px dots whose opacity travels across the lattice. */
  ${part("root")}[data-active="true"] ${part("icon")} {
    grid-template-columns: repeat(3, 2.5px);
    grid-auto-rows: 2.5px;
    gap: 3px;
    place-content: center;
    color: ${uiTokens.ink.secondary};
  }
  ${part("icon")} [data-reasoning-dot] {
    border-radius: 50%;
    corner-shape: round;
    background: currentColor;
    opacity: 0.2;
    animation: ui-reasoning-wave ${uiTokens.motion.sweep} ${uiTokens.motion.ease} infinite;
  }
  ${part("icon")} [data-reasoning-dot]:nth-child(2),
  ${part("icon")} [data-reasoning-dot]:nth-child(4) {
    animation-delay: calc(${uiTokens.motion.sweep} * 0.1);
  }
  ${part("icon")} [data-reasoning-dot]:nth-child(3),
  ${part("icon")} [data-reasoning-dot]:nth-child(5),
  ${part("icon")} [data-reasoning-dot]:nth-child(7) {
    animation-delay: calc(${uiTokens.motion.sweep} * 0.2);
  }
  ${part("icon")} [data-reasoning-dot]:nth-child(6),
  ${part("icon")} [data-reasoning-dot]:nth-child(8) {
    animation-delay: calc(${uiTokens.motion.sweep} * 0.3);
  }
  ${part("icon")} [data-reasoning-dot]:nth-child(9) {
    animation-delay: calc(${uiTokens.motion.sweep} * 0.4);
  }
  @keyframes ui-reasoning-wave {
    0%,
    100% {
      opacity: 0.2;
    }
    35% {
      opacity: 0.95;
    }
  }
  ${part("icon")} svg {
    width: ${uiTokens.icon.small};
    height: ${uiTokens.icon.small};
    transition: transform ${uiTokens.motion.settle} ${uiTokens.motion.ease};
  }
  ${part("root")}[open] > ${part("summary")} ${part("icon")} svg {
    transform: rotate(90deg);
  }
  ${part("label")} {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  ${part("body")} {
    display: grid;
    min-width: 0;
    gap: ${uiTokens.space.group};
    padding-top: ${uiTokens.space.group};
  }
  ${part("text")} {
    margin: 0;
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.body};
    line-height: ${uiTokens.type.line.body};
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  /* While the model works, only the newest lines show; older ones fade under the top edge.
     The body anchors its content to the bottom, so no script measures or scrolls it. */
  ${part("root")}[data-active="true"] > ${part("body")} {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: ${uiTokens.space.group};
    max-height: 184px;
    overflow: hidden;
    padding-bottom: 12px;
    mask-image: linear-gradient(
      to bottom,
      transparent,
      black 32px,
      black calc(100% - 20px),
      transparent
    );
  }
  @media (prefers-reduced-motion: reduce) {
    ${part("icon")} svg {
      transition: none;
    }
    ${part("icon")} [data-reasoning-dot] {
      animation: none;
      opacity: 0.5;
    }
  }
`;
