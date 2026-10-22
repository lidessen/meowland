import { css, partSelector } from "meowcss/meowjsx";
import { processGroupContract } from "../../components/process-group";
import { processStepContract } from "../../components/process-step";
import { uiTokens } from "../tokens";
import { layerTokens, lineTokens, radiusTokens } from "../palette";

const group = (part: (typeof processGroupContract.parts)[number]) =>
  partSelector(processGroupContract, part);
const step = (part: (typeof processStepContract.parts)[number]) =>
  partSelector(processStepContract, part);

export const processGroupStyles = css`
  ${group("root")} {
    container-type: inline-size;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    min-width: 0;
    box-sizing: border-box;
    overflow: hidden;
    border: ${lineTokens.width} solid ${uiTokens.borderSoft};
    border-radius: ${radiusTokens.card};
    background: ${layerTokens.sunken};
    color: ${uiTokens.mutedForeground};
    font: ${uiTokens.fontLabel}/20px ${uiTokens.font};
  }
  ${group("summary")} {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 12px;
    list-style: none;
    cursor: pointer;
    user-select: none;
  }
  ${group("summary")}::-webkit-details-marker {
    display: none;
  }
  ${group("summary")}:hover {
    background: ${uiTokens.hover};
  }
  ${group("summary")}:focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: -2px;
  }
  ${group("chevron")} {
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    transition: transform ${uiTokens.durationResponse} ${uiTokens.ease};
  }
  ${group("chevron")} svg {
    width: 14px;
    height: 14px;
  }
  ${group("root")}[open] > ${group("summary")} ${group("chevron")} {
    transform: rotate(90deg);
  }
  /* Names stay on one line; compact containers give the outcome its own row below. */
  ${group("title")} {
    flex: 0 0 auto;
    color: ${uiTokens.foreground};
    font-weight: 500;
    white-space: nowrap;
  }
  ${group("status")} {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  ${group("trailing")} {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 4px;
    margin-left: auto;
  }
  ${group("body")} {
    display: grid;
    padding: 2px 12px 10px 14px;
    border-top: ${lineTokens.width} solid ${lineTokens.quiet};
  }
  /* A compact group keeps the outcome readable below the name and step markers. */
  @container (max-width: 400px) {
    ${group("summary")} {
      display: grid;
      grid-template-columns: 14px minmax(0, 1fr) auto;
      row-gap: 4px;
    }
    ${group("title")} {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    ${group("status")} {
      grid-column: 2 / -1;
      grid-row: 2;
    }
    ${group("trailing")} {
      grid-column: 3;
      grid-row: 1;
      flex-wrap: wrap;
      justify-content: flex-end;
      max-width: 120px;
    }
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
    color: ${uiTokens.subtleForeground};
  }
  ${step("icon")} svg {
    width: 14px;
    height: 14px;
  }
  ${step("label")} {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  ${step("label")} code {
    padding: 1px 5px;
    border-radius: ${radiusTokens.mark};
    background: ${layerTokens.code};
    color: ${uiTokens.foreground};
    font: ${uiTokens.fontCode} ${uiTokens.mono};
  }
  ${step("meta")} {
    color: ${layerTokens.faint};
    font-size: ${uiTokens.fontCaption};
    font-variant-numeric: tabular-nums;
  }
`;
