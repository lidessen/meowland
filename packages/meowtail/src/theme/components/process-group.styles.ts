import { css, partSelector } from "meowcss/meowjsx";
import { processGroupContract } from "../../components/process-group";
import { processStepContract } from "../../components/process-step";
import { statusContract } from "../../components/status";
import { uiTokens } from "../tokens";
import { focusRing } from "../recipes";

const group = (part: (typeof processGroupContract.parts)[number]) =>
  partSelector(processGroupContract, part);
const step = (part: (typeof processStepContract.parts)[number]) =>
  partSelector(processStepContract, part);

export const processGroupStyles = css`
  ${group("root")} {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    min-width: 0;
    box-sizing: border-box;
    overflow: hidden;
    /* A recessed fill inside the reading flow: no edge. */
    border: 0;
    border-radius: ${uiTokens.radius.xl};
    background: ${uiTokens.surface.fill};
    color: ${uiTokens.ink.secondary};
    font: ${uiTokens.type.label} / ${uiTokens.type.line.label} ${uiTokens.type.sans};
  }
  /* One line when it fits; a narrow group wraps the badge and fact rather than stacking by rule. */
  ${group("summary")} {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 8px;
    padding: 8px 12px;
    list-style: none;
    cursor: pointer;
    user-select: none;
  }
  ${group("summary")}::-webkit-details-marker {
    display: none;
  }
  ${group("summary")}:hover {
    background: ${uiTokens.state.hover};
  }
  ${group("summary")}:focus-visible {
    ${focusRing({ inset: true })}
  }
  ${group("chevron")} {
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    transition: transform ${uiTokens.motion.response} ${uiTokens.motion.ease};
  }
  ${group("chevron")} svg {
    width: ${uiTokens.icon.small};
    height: ${uiTokens.icon.small};
  }
  ${group("root")}[open] > ${group("summary")} ${group("chevron")} {
    transform: rotate(90deg);
  }
  /* A name stays on one line and truncates only when it alone outgrows the row. */
  ${group("title")} {
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    color: ${uiTokens.ink.primary};
    font-weight: ${uiTokens.type.weight.medium};
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  ${group("status")} {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  /* A badge leads the status; a fact after it reads as quiet words that truncate first. */
  ${group("status")} > ${partSelector(statusContract, "root")} {
    vertical-align: middle;
  }
  ${group("status")} > ${partSelector(statusContract, "root")} + * {
    margin-inline-start: 8px;
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.caption};
  }
  /* The state badge (shared/state-badge.styles.ts) sits right after the name; the trailing
     slot is one quiet fact at the row's end. */
  ${group("trailing")} {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 4px;
    margin-left: auto;
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.caption};
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  ${group("body")} {
    display: grid;
    padding: 2px 12px 10px 14px;
    border-top: ${uiTokens.line.width} solid ${uiTokens.line.divider};
  }
  ${group("root")}:not([open]) > ${group("body")} {
    display: none;
  }

  ${step("root")} {
    display: grid;
    grid-template-columns: 16px minmax(0, 1fr) auto;
    align-items: center;
    column-gap: 10px;
    min-height: 30px;
  }
  ${step("icon")} {
    display: grid;
    place-items: center;
    color: ${uiTokens.ink.tertiary};
  }
  ${step("icon")} svg {
    width: ${uiTokens.icon.small};
    height: ${uiTokens.icon.small};
  }
  ${step("label")} {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  ${step("label")} code {
    padding: 1px 6px;
    border-radius: ${uiTokens.radius.xs};
    background: ${uiTokens.surface.tint};
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.code} ${uiTokens.type.mono};
  }
  ${step("meta")} {
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.caption};
    font-variant-numeric: tabular-nums;
  }
`;
