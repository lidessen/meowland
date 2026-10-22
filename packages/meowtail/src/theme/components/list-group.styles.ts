import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { listGroupContract, listRowContract } from "../../components/list-group";

const group = partSelector(listGroupContract, "root");
const row = (part: (typeof listRowContract.parts)[number]) => partSelector(listRowContract, part);

export const listGroupStyles = css`
  ${group} {
    display: grid;
    overflow: hidden;
    border: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    border-radius: ${uiTokens.radius.xl};
    background: ${uiTokens.surface.raised};
    box-shadow: ${uiTokens.shadow.raised};
  }
  ${row("root")} {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    min-width: 0;
    font: ${uiTokens.type.body}/1.5 ${uiTokens.type.sans};
    color: ${uiTokens.ink.primary};
  }
  ${group} > ${row("root")} + ${row("root")} {
    border-top: ${uiTokens.line.width} solid ${uiTokens.line.divider};
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
      background: ${uiTokens.surface.fill};
    }
  }
  ${row("copy")} {
    display: grid;
    gap: 1px;
    flex: 1 1 ${uiTokens.layout.gridCompact};
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
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.label};
    overflow-wrap: anywhere;
  }
  ${row("status")} {
    display: inline-flex;
    align-items: center;
    flex: 0 1 auto;
    min-width: 0;
    gap: 6px;
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.caption};
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
    padding: 12px 16px;
    border-top: ${uiTokens.line.width} solid ${uiTokens.line.divider};
    background: ${uiTokens.surface.fill};
  }
  ${row("root")}[data-expanded="true"] {
    background: ${uiTokens.surface.fill};
  }
  /* A row standing alone is a summary: it carries its own outline. */
  ${row("root")}[data-tone="accent"] {
    border: ${uiTokens.line.width} solid ${uiTokens.accent.line};
    border-radius: ${uiTokens.radius.xl};
    background: ${uiTokens.accent.soft};
  }
`;
