import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { focusRing } from "../recipes";
import { taskListContract } from "../../components/task-list";

const part = (name: (typeof taskListContract.parts)[number]) =>
  partSelector(taskListContract, name);
const row = (states: string) =>
  `${part("item")}:is(${states
    .split(" ")
    .map((state) => `[data-execution-state="${state}"]`)
    .join(", ")})`;
const finished = row("success complete");
const struck = row("success complete cancelled");
const header = (state: string) =>
  `${part("root")}[data-execution-state="${state}"] > ${part("summary")} > ${part("marker")}`;

/* Finished and waiting ink is the foreground at reduced strength, not a second grey,
   so every state stays one hue and only steps back. */
const doneInk = `color-mix(in srgb, ${uiTokens.ink.primary} 45%, transparent)`;
const pendingInk = `color-mix(in srgb, ${uiTokens.ink.secondary} 60%, transparent)`;

export const taskListStyles = css`
  /* A flat in-flow card: the raised layer on a crisp edge. */
  ${part("root")} {
    display: grid;
    min-width: 0;
    overflow: hidden;
    border: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    border-radius: ${uiTokens.radius.xl};
    background: ${uiTokens.surface.raised};
    box-shadow: ${uiTokens.shadow.raised};
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body} / ${uiTokens.type.line.bodyCompact} ${uiTokens.type.sans};
  }
  ${part("summary")} {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: ${uiTokens.space.insetBlock} ${uiTokens.space.insetInline};
    list-style: none;
    cursor: pointer;
    user-select: none;
  }
  ${part("summary")}::-webkit-details-marker {
    display: none;
  }
  ${part("summary")}:focus-visible {
    ${focusRing({ inset: true })}
    border-radius: ${uiTokens.radius.xl};
  }
  ${part("title")} {
    min-width: 0;
    flex: 1 1 auto;
    font-weight: ${uiTokens.type.weight.semibold};
  }
  ${part("count")} {
    color: ${uiTokens.ink.secondary};
    font-variant-numeric: tabular-nums;
  }
  ${part("chevron")} {
    display: grid;
    place-items: center;
    margin-inline-start: -8px;
    color: ${uiTokens.ink.secondary};
    transition: transform ${uiTokens.motion.settle} ${uiTokens.motion.ease};
  }
  ${part("chevron")} svg {
    width: ${uiTokens.icon.small};
    height: ${uiTokens.icon.small};
  }
  ${part("root")}[open] > ${part("summary")} ${part("chevron")} {
    transform: rotate(180deg);
  }
  ${part("list")} {
    display: grid;
    margin: -4px 0 0;
    padding: 0 ${uiTokens.space.insetInline} ${uiTokens.space.group};
    list-style: none;
  }
  ${part("item")} {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    min-width: 0;
    padding-block: 3px;
  }
  ${part("label")} {
    position: relative;
    min-width: 0;
    flex: 0 1 auto;
    margin-inline-end: auto;
    overflow-wrap: anywhere;
    color: ${uiTokens.ink.secondary};
    transition: color ${uiTokens.motion.settle} ${uiTokens.motion.ease};
  }
  ${row("running waiting error")} > ${part("label")} {
    color: ${uiTokens.ink.primary};
  }
  ${struck} > ${part("label")} {
    color: ${doneInk};
  }
  /* The strike is drawn across the label when a step finishes, not switched on. */
  ${part("label")}::after {
    content: "";
    position: absolute;
    inset-inline-start: 0;
    top: 50%;
    width: 0;
    height: 1px;
    background: currentColor;
    transition: width ${uiTokens.motion.draw} ${uiTokens.motion.ease};
  }
  ${struck} > ${part("label")}::after {
    width: 100%;
  }
  /* The state is announced as text; the marker and strike only show it. */
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

  /* Row markers, 14px on the first line: an open ring waits, a ring with an arrow is
     current, a filled disc with a knocked-out check is done. */
  :where(${part("marker")}, ${part("itemMarker")}) {
    position: relative;
    flex: none;
    box-sizing: border-box;
    width: 14px;
    height: 14px;
    margin-top: 3px;
    border: 1.5px dashed ${pendingInk};
    border-radius: 50%;
    corner-shape: round;
    transition:
      background-color ${uiTokens.motion.settle} ${uiTokens.motion.ease},
      border-color ${uiTokens.motion.settle} ${uiTokens.motion.ease};
  }
  ${part("marker")} {
    margin-top: 0;
  }
  :where(${part("marker")}, ${part("itemMarker")})::after {
    content: "";
    position: absolute;
    inset: 0;
    margin: auto;
    width: 9px;
    height: 9px;
    mask: none center / contain no-repeat;
  }
  ${row("running")} > ${part("itemMarker")} {
    border: 1.5px solid ${uiTokens.ink.primary};
  }
  ${row("running")} > ${part("itemMarker")}::after {
    width: 8px;
    height: 8px;
    background: ${uiTokens.ink.primary};
    mask-image: ${uiTokens.glyph.arrow};
  }
  ${finished} > ${part("itemMarker")} {
    border: 0;
    background: ${doneInk};
  }
  ${finished} > ${part("itemMarker")}::after,
  ${header("success")}::after {
    background: ${uiTokens.surface.raised};
    mask-image: ${uiTokens.glyph.check};
  }
  ${row("error")} > ${part("itemMarker")},
  ${header("error")} {
    border: 0;
    background: ${uiTokens.status.danger};
  }
  ${row("error")} > ${part("itemMarker")}::after,
  ${header("error")}::after {
    background: ${uiTokens.surface.raised};
    mask-image: ${uiTokens.glyph.cross};
  }
  ${row("waiting")} > ${part("itemMarker")},
  ${header("waiting")} {
    border: 1.5px solid ${uiTokens.status.warning};
  }
  ${row("waiting")} > ${part("itemMarker")}::after,
  ${header("waiting")}::after {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: ${uiTokens.status.warning};
  }
  ${row("cancelled")} > ${part("itemMarker")} {
    border-style: solid;
    border-color: ${doneInk};
  }
  ${row("cancelled")} > ${part("itemMarker")}::after {
    width: 7px;
    height: 1.5px;
    background: ${doneInk};
  }

  /* The header marker is a donut that fills by the share of finished steps, and
     becomes a filled check when the whole plan is done. */
  :is(${header("running")}, ${header("queued")}) {
    border: 0;
    background: conic-gradient(
      ${uiTokens.ink.primary} var(--task-list-done, 0%),
      color-mix(in srgb, ${uiTokens.ink.primary} 14%, transparent) 0
    );
    mask: radial-gradient(circle, transparent 4.5px, black 5px);
  }
  ${header("success")} {
    border: 0;
    background: ${uiTokens.accent.base};
  }
  @media (prefers-reduced-motion: reduce) {
    ${part("root")} * {
      animation: none !important;
      transition: none !important;
    }
  }
`;
