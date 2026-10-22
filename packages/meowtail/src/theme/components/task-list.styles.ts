import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { layerTokens, lineTokens } from "../palette";
import { taskListContract } from "../../components/task-list";

const part = (name: (typeof taskListContract.parts)[number]) =>
  partSelector(taskListContract, name);
const markers = `:where(${part("marker")}, ${part("itemMarker")})`;
/* Each marker reads the state of its own row; the header marker reads the list's aggregate. */
const state = (value: string) =>
  `:where(${part("root")}[data-execution-state="${value}"] > ${part("summary")} > ${part("marker")}, ${part("item")}[data-execution-state="${value}"] > ${part("itemMarker")})`;

export const taskListStyles = css`
  /* An in-flow surface: the raised layer on the edge hairline. */
  ${part("root")} {
    display: grid;
    min-width: 0;
    overflow: hidden;
    border: ${lineTokens.width} solid ${lineTokens.edge};
    border-radius: ${uiTokens.radiusLarge};
    background: ${layerTokens.raised};
    box-shadow: ${uiTokens.shadowRaised};
    color: ${uiTokens.foreground};
    font: ${uiTokens.fontBody}/${uiTokens.leading} ${uiTokens.font};
  }
  ${part("summary")} {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    padding: 0 14px 0 16px;
    list-style: none;
    cursor: pointer;
    user-select: none;
  }
  ${part("summary")}::-webkit-details-marker {
    display: none;
  }
  ${part("summary")}:focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: -2px;
    border-radius: ${uiTokens.radiusLarge};
  }
  ${part("title")} {
    min-width: 0;
    flex: 1 1 auto;
    font-weight: 500;
    letter-spacing: -0.01em;
  }
  ${part("count")} {
    color: ${uiTokens.mutedForeground};
    font-variant-numeric: tabular-nums;
    font-size: ${uiTokens.fontLabel};
  }
  ${part("chevron")} {
    display: grid;
    place-items: center;
    color: ${uiTokens.subtleForeground};
    transition: transform ${uiTokens.durationSettle} ${uiTokens.ease};
  }
  ${part("chevron")} svg {
    width: 14px;
    height: 14px;
  }
  ${part("root")}[open] > ${part("summary")} ${part("chevron")} {
    transform: rotate(180deg);
  }
  ${part("list")} {
    display: grid;
    gap: 2px;
    margin: 0;
    padding: 0 14px 12px 16px;
    list-style: none;
  }
  ${part("item")} {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    min-height: 28px;
  }
  ${part("label")} {
    min-width: 0;
    flex: 1 1 auto;
    overflow-wrap: anywhere;
    color: ${uiTokens.mutedForeground};
    transition: color ${uiTokens.durationSettle} ${uiTokens.ease};
  }
  ${part("item")}:is([data-execution-state="running"], [data-execution-state="waiting"], [data-execution-state="error"]) > ${part("label")} {
    color: ${uiTokens.foreground};
  }
  /* The decoration sits on the text itself: the shimmer wrapper is an inline block,
     which an ancestor's line-through does not reach. */
  ${part("item")}:is([data-execution-state="success"], [data-execution-state="complete"], [data-execution-state="cancelled"]) > ${part("label")},
  ${part("item")}:is([data-execution-state="success"], [data-execution-state="complete"], [data-execution-state="cancelled"]) > ${part("label")} * {
    color: ${uiTokens.subtleForeground};
    text-decoration: line-through;
    text-decoration-thickness: 1px;
    text-decoration-color: ${uiTokens.subtleForeground};
  }
  /* The state is announced as text; the marker and strikethrough only show it. */
  ${part("state")} {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  ${part("progress")} {
    flex: none;
    font-variant-numeric: tabular-nums;
  }

  /* Markers: a dashed ring waits, a ring with an arrow is current, a filled disc is done. */
  ${markers} {
    position: relative;
    flex: none;
    box-sizing: border-box;
    width: 16px;
    height: 16px;
    border: 1.5px dashed ${uiTokens.subtleForeground};
    border-radius: 50%;
  }
  ${markers}::after {
    content: "";
    position: absolute;
    inset: 0;
    margin: auto;
    width: 10px;
    height: 10px;
    mask: none center / contain no-repeat;
  }
  ${state("running")} {
    border-style: solid;
    border-color: ${uiTokens.foreground};
  }
  ${part("item")}[data-execution-state="running"] > ${part("itemMarker")}::after {
    width: 9px;
    height: 9px;
    background: ${uiTokens.foreground};
    mask-image: ${uiTokens.arrowMask};
  }
  /* The header ring turns while anything runs. */
  ${part("root")}[data-execution-state="running"] > ${part("summary")} > ${part("marker")} {
    border-color: ${uiTokens.borderStrong};
    border-top-color: ${uiTokens.foreground};
    animation: ui-task-list-turn 0.9s linear infinite;
  }
  ${state("success")}, ${state("complete")} {
    border: 0;
    background: ${uiTokens.mutedForeground};
  }
  ${state("error")} {
    border: 0;
    background: ${uiTokens.danger};
  }
  :is(${state("success")}, ${state("complete")}, ${state("error")})::after {
    background: ${layerTokens.raised};
    mask-image: ${uiTokens.checkMask};
  }
  ${state("error")}::after {
    mask-image: ${uiTokens.crossMask};
  }
  ${state("waiting")} {
    border-style: solid;
    border-color: ${uiTokens.warning};
  }
  ${state("waiting")}::after {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${uiTokens.warning};
  }
  ${state("cancelled")} {
    border-style: solid;
  }
  ${state("cancelled")}::after {
    width: 8px;
    height: 1.5px;
    background: ${uiTokens.subtleForeground};
  }
  @keyframes ui-task-list-turn {
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    ${part("root")} > ${part("summary")} > ${part("marker")} {
      animation: none;
    }
    ${part("chevron")}, ${part("label")} {
      transition: none;
    }
  }
`;
