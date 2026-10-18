import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { listGroupContract, listRowContract } from "../../components/list-group";
import { accentTokens, layerTokens, lineTokens, radiusTokens } from "../palette";

const group = partSelector(listGroupContract, "root");
const row = (part: (typeof listRowContract.parts)[number]) => partSelector(listRowContract, part);

export const listGroupStyles = css`
  ${group} {
    display: grid;
    overflow: hidden;
    border: ${lineTokens.width} solid ${lineTokens.edge};
    border-radius: ${radiusTokens.card};
    background: ${layerTokens.raised};
  }
  ${row("root")} {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    min-width: 0;
    font: ${uiTokens.fontBody}/1.5 ${uiTokens.font};
    color: ${uiTokens.foreground};
  }
  ${group} > ${row("root")} + ${row("root")} {
    border-top: ${lineTokens.width} solid ${lineTokens.divider};
  }
  ${row("line")} {
    display: flex;
    flex-wrap: wrap;
    min-width: 0;
    align-items: center;
    gap: 8px 16px;
    padding: 12px 16px;
  }
  @media (hover: hover) {
    ${group} > ${row("root")}:not([data-expanded]) > ${row("line")}:hover {
      background: ${layerTokens.sunken};
    }
  }
  ${row("copy")} {
    display: grid;
    gap: 1px;
    flex: 1 1 ${uiTokens.gridColumnCompact};
    min-width: 0;
  }
  ${row("heading")} {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px 8px;
  }
  ${row("title")} {
    font-weight: 500;
    overflow-wrap: anywhere;
  }
  ${row("tags")} {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
  }
  ${row("description")} {
    color: ${uiTokens.mutedForeground};
    font-size: 12.5px;
    overflow-wrap: anywhere;
  }
  ${row("status")} {
    display: inline-flex;
    align-items: center;
    flex: 0 1 auto;
    min-width: 0;
    gap: 6px;
    color: ${uiTokens.mutedForeground};
    font-size: 12px;
    overflow-wrap: anywhere;
  }
  ${row("actions")} {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    flex: 0 0 auto;
    max-width: 100%;
    gap: 6px;
  }
  ${row("panel")} {
    border-top: ${lineTokens.width} solid ${lineTokens.divider};
    background: ${layerTokens.sunken};
  }
  ${row("root")}[data-expanded="true"] {
    background: ${layerTokens.sunken};
  }
  /* A row standing alone is a summary: it carries its own outline. */
  ${row("root")}[data-tone="accent"] {
    border: ${lineTokens.width} solid ${accentTokens.line};
    border-radius: ${radiusTokens.card};
    background: ${accentTokens.soft};
  }
`;
