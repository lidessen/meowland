import { css, parts } from "meowcss/meowjsx";
import { alertTokens, uiTokens } from "../tokens";

import type { Alert } from "../../components/alert";
import { alertOptions } from "../../components/alert.options";
const alertPartRefs = parts<typeof Alert>("alert");
export const alertStyles = css`
  ${alertPartRefs.root} {
    display: grid;
    /* Title and body read as one statement; actions keep a group gap. */
    gap: 4px;
    padding: 14px 16px;
    /* A tinted hairline over transparency stays light on any surface, instead
       of stacking the tone on top of the general border ink. */
    border: 1px solid color-mix(in srgb, ${alertTokens.accent} 20%, transparent);
    border-radius: ${uiTokens.radius.xl};
    background: color-mix(in srgb, ${alertTokens.accent} 6%, ${uiTokens.surface.knockout});
    color: ${uiTokens.ink.primary};
    overflow-wrap: anywhere;
    font-family: ${uiTokens.type.sans};
    font-size: ${uiTokens.type.body};
  }
  ${alertPartRefs.title} {
    font-weight: ${uiTokens.type.weight.semibold};
  }
  ${alertPartRefs.body} {
    line-height: ${uiTokens.type.leading};
  }
  ${alertPartRefs.actions} {
    display: flex;
    flex-wrap: wrap;
    gap: ${uiTokens.space.group};
    margin-top: 4px;
  }

  /* A page notice is one compact line with an optional end action; the block
     alert keeps the title/body/action stack for outcomes that need reading. */
  ${alertPartRefs.root}[${alertOptions.attribute("layout")}="bar"] {
    display: flex;
    align-items: center;
    gap: ${uiTokens.space.group};
    min-height: 36px;
    padding: 6px 8px 6px 12px;
    border-radius: ${uiTokens.radius.md};
    font-size: ${uiTokens.type.label};
    line-height: ${uiTokens.type.line.label};
  }
  ${alertPartRefs.root}[${alertOptions.attribute("layout")}="bar"]::before {
    content: "";
    width: 8px;
    height: 8px;
    flex: none;
    border-radius: 50%;
    background: ${alertTokens.accent};
  }
  ${alertPartRefs.root}[${alertOptions.attribute("layout")}="bar"][${alertOptions.attribute("marker")}="none"]::before {
    content: none;
  }
  ${alertPartRefs.root}[${alertOptions.attribute("layout")}="bar"] ${alertPartRefs.title} {
    flex: none;
  }
  ${alertPartRefs.root}[${alertOptions.attribute("layout")}="bar"] ${alertPartRefs.body} {
    flex: 1;
    min-width: 0;
    line-height: ${uiTokens.type.line.label};
  }
  ${alertPartRefs.root}[${alertOptions.attribute("layout")}="bar"] ${alertPartRefs.actions} {
    flex: none;
    margin-top: 0;
    margin-left: auto;
    flex-wrap: nowrap;
  }

  @media (pointer: coarse) {
    ${alertPartRefs.root}[${alertOptions.attribute("layout")}="bar"] ${alertPartRefs.actions} > * {
      min-width: 44px;
      min-height: 44px;
    }
  }
`;
