import { css, partSelector } from "meowcss/meowjsx";
import { alertTokens, uiTokens } from "../tokens";
import { alertContract, alertOptions } from "../../components/alert";

export const alertStyles = css`
  ${partSelector(alertContract, "root")} {
    display: grid;
    gap: ${uiTokens.spaceGroup};
    padding: ${uiTokens.spaceSection};
    border: 1px solid color-mix(in srgb, ${alertTokens.accent} 25%, ${uiTokens.border});
    border-radius: ${uiTokens.controlRadius};
    background: color-mix(in srgb, ${alertTokens.accent} 5%, ${uiTokens.background});
    color: ${uiTokens.foreground};
    overflow-wrap: anywhere;
    font-family: ${uiTokens.font};
    font-size: ${uiTokens.fontBody};
  }
  ${partSelector(alertContract, "title")} {
    font-weight: 600;
  }
  ${partSelector(alertContract, "body")} {
    line-height: 1.6;
  }
  ${partSelector(alertContract, "actions")} {
    display: flex;
    flex-wrap: wrap;
    gap: ${uiTokens.spaceGroup};
  }

  /* A page notice is one compact line with an optional end action; the block
     alert keeps the title/body/action stack for outcomes that need reading. */
  ${partSelector(alertContract, "root")}[${alertOptions.attribute("layout")}="bar"] {
    display: flex;
    align-items: center;
    gap: ${uiTokens.spaceGroup};
    min-height: 36px;
    padding: 6px 8px 6px 12px;
    border-radius: ${uiTokens.radiusSmall};
    font-size: 13px;
    line-height: 20px;
  }
  ${partSelector(alertContract, "root")}[${alertOptions.attribute("layout")}="bar"]::before {
    content: "";
    width: 8px;
    height: 8px;
    flex: none;
    border-radius: 50%;
    background: ${alertTokens.accent};
  }
  ${partSelector(alertContract, "root")}[${alertOptions.attribute("layout")}="bar"] ${partSelector(alertContract, "title")} {
    flex: none;
  }
  ${partSelector(alertContract, "root")}[${alertOptions.attribute("layout")}="bar"] ${partSelector(alertContract, "body")} {
    flex: 1;
    min-width: 0;
    line-height: 20px;
  }
  ${partSelector(alertContract, "root")}[${alertOptions.attribute("layout")}="bar"] ${partSelector(alertContract, "actions")} {
    flex: none;
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
