import { css, partSelector } from "meowcss/meowjsx";
import { alertTokens, uiTokens } from "../tokens";
import { alertContract, alertOptions } from "../../components/alert";

export const alertStyles = css`
  ${partSelector(alertContract, "root")} {
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
  ${partSelector(alertContract, "title")} {
    font-weight: ${uiTokens.type.weight.semibold};
  }
  ${partSelector(alertContract, "body")} {
    line-height: ${uiTokens.type.leading};
  }
  ${partSelector(alertContract, "actions")} {
    display: flex;
    flex-wrap: wrap;
    gap: ${uiTokens.space.group};
    margin-top: 4px;
  }

  /* A page notice is one compact line with an optional end action; the block
     alert keeps the title/body/action stack for outcomes that need reading. */
  ${partSelector(alertContract, "root")}[${alertOptions.attribute("layout")}="bar"] {
    display: flex;
    align-items: center;
    gap: ${uiTokens.space.group};
    min-height: 36px;
    padding: 6px 8px 6px 12px;
    border-radius: ${uiTokens.radius.md};
    font-size: ${uiTokens.type.label};
    line-height: ${uiTokens.type.line.label};
  }
  ${partSelector(alertContract, "root")}[${alertOptions.attribute("layout")}="bar"]::before {
    content: "";
    width: 8px;
    height: 8px;
    flex: none;
    border-radius: 50%;
    background: ${alertTokens.accent};
  }
  ${partSelector(alertContract, "root")}[${alertOptions.attribute("layout")}="bar"][${alertOptions.attribute("marker")}="none"]::before {
    content: none;
  }
  ${partSelector(alertContract, "root")}[${alertOptions.attribute("layout")}="bar"] ${partSelector(alertContract, "title")} {
    flex: none;
  }
  ${partSelector(alertContract, "root")}[${alertOptions.attribute("layout")}="bar"] ${partSelector(alertContract, "body")} {
    flex: 1;
    min-width: 0;
    line-height: ${uiTokens.type.line.label};
  }
  ${partSelector(alertContract, "root")}[${alertOptions.attribute("layout")}="bar"] ${partSelector(alertContract, "actions")} {
    flex: none;
    margin-top: 0;
    margin-left: auto;
    flex-wrap: nowrap;
  }

  @media (pointer: coarse) {
    ${partSelector(alertContract, "root")}[${alertOptions.attribute("layout")}="bar"] ${partSelector(alertContract, "actions")} > * {
      min-width: 44px;
      min-height: 44px;
    }
  }
`;
