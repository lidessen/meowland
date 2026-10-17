import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { accentTokens, layerTokens, lineTokens, statusTokens } from "../palette";
import { buttonContract, buttonOptions } from "../../components/button";
import { iconButtonContract, iconButtonOptions } from "../../components/icon-button";

export const buttonStyles = css`
/* Visual rules only. Low specificity leaves host layout composable. */
:where(${partSelector(iconButtonContract, "root")}, ${partSelector(buttonContract, "root")}) {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: ${uiTokens.buttonHeight};
  padding: 0 14px;
  border: 0;
  border-radius: ${uiTokens.controlRadius};
  background: transparent;
  color: ${uiTokens.foreground};
  font: 400 ${uiTokens.fontBody}/22px ${uiTokens.font};
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color ${uiTokens.durationResponse} ${uiTokens.ease},
    border-color ${uiTokens.durationResponse} ${uiTokens.ease},
    box-shadow ${uiTokens.durationSettle} ${uiTokens.ease};
  -webkit-tap-highlight-color: transparent;
}
${partSelector(iconButtonContract, "root")} {
  width: ${uiTokens.buttonHeight};
  min-width: ${uiTokens.buttonHeight};
  height: ${uiTokens.buttonHeight};
  padding: 0;
  flex-shrink: 0;
  color: ${uiTokens.mutedForeground};
}
:where(${partSelector(iconButtonContract, "root")}, ${partSelector(buttonContract, "root")}) svg {
  width: ${uiTokens.iconSize};
  height: ${uiTokens.iconSize};
  flex-shrink: 0;
}
${partSelector(buttonContract, "root")} {
  ${buttonOptions.when({ variant: "primary" })} {
    background: ${uiTokens.primary};
    color: ${uiTokens.onPrimary};
    font-weight: 500;
  }
}
${partSelector(buttonContract, "root")} {
  ${buttonOptions.when({ variant: "danger" })} {
    background: ${uiTokens.dangerAction};
    color: ${uiTokens.onDanger};
  }
}
${partSelector(buttonContract, "root")} {
  ${buttonOptions.when({ variant: "outline" })} {
    border: ${lineTokens.width} solid ${lineTokens.edge};
    background: ${layerTokens.raised};
  }
}
${partSelector(buttonContract, "root")} {
  ${buttonOptions.when({ variant: "accent" })} {
    background: ${accentTokens.soft};
    color: ${accentTokens.ink};
    font-weight: 500;
  }
}
${partSelector(buttonContract, "root")} {
  ${buttonOptions.when({ variant: "stop" })} {
    color: ${statusTokens.danger};
  }
}
@media (hover: hover) {
  :where(
      ${partSelector(iconButtonContract, "root")},
      ${partSelector(buttonContract, "root")}[${buttonOptions.attribute("variant")}="quiet"],
      ${partSelector(buttonContract, "root")}[${buttonOptions.attribute("variant")}="outline"]
    ):hover:not(:disabled) {
    background: ${uiTokens.hover};
    color: ${uiTokens.foreground};
  }
  ${partSelector(buttonContract, "root")}[${buttonOptions.attribute("variant")}="primary"]:hover:not(:disabled) {
    background: ${uiTokens.primaryHover};
  }
  ${partSelector(buttonContract, "root")}[${buttonOptions.attribute("variant")}="danger"]:hover:not(:disabled) {
    background: color-mix(in srgb, ${uiTokens.dangerAction} 88%, ${uiTokens.foreground});
  }
  ${partSelector(buttonContract, "root")}[${buttonOptions.attribute("variant")}="accent"]:hover:not(:disabled) {
    background: color-mix(in srgb, ${accentTokens.base} 14%, ${accentTokens.soft});
  }
  ${partSelector(buttonContract, "root")}[${buttonOptions.attribute("variant")}="stop"]:hover:not(:disabled) {
    background: color-mix(in srgb, ${statusTokens.danger} 8%, transparent);
  }
}
:where(${partSelector(iconButtonContract, "root")}, ${partSelector(buttonContract, "root")}[${buttonOptions.attribute("variant")}="quiet"], ${partSelector(buttonContract, "root")}[${buttonOptions.attribute("variant")}="outline"]):active:not(:disabled) {
  background: ${uiTokens.active};
}
:where(${partSelector(iconButtonContract, "root")}, ${partSelector(buttonContract, "root")}):focus-visible {
  outline: 2px solid ${uiTokens.focus};
  outline-offset: 2px;
}
:where(${partSelector(iconButtonContract, "root")}, ${partSelector(buttonContract, "root")}):disabled {
  cursor: not-allowed;
  opacity: 0.4;
}
${partSelector(buttonContract, "root")} {
  ${buttonOptions.when({ size: "small" })} {
    min-height: ${uiTokens.buttonSmall};
    padding-inline: 10px;
    border-radius: ${uiTokens.radiusSmall};
    font-size: ${uiTokens.fontCaption};
    line-height: 18px;
  }
}
${partSelector(buttonContract, "root")} {
  ${buttonOptions.when({ size: "large" })} {
    min-height: ${uiTokens.buttonLarge};
    padding-inline: 20px;
  }
}
${partSelector(iconButtonContract, "root")} {
  ${iconButtonOptions.when({ size: "small" })} {
    width: ${uiTokens.buttonSmall};
    min-width: ${uiTokens.buttonSmall};
    height: ${uiTokens.buttonSmall};
    min-height: ${uiTokens.buttonSmall};
    border-radius: ${uiTokens.radiusSmall};
  }
}
${partSelector(iconButtonContract, "root")} {
  ${iconButtonOptions.when({ size: "large" })} {
    width: ${uiTokens.buttonLarge};
    min-width: ${uiTokens.buttonLarge};
    height: ${uiTokens.buttonLarge};
    min-height: ${uiTokens.buttonLarge};
  }
}
@media (prefers-reduced-motion: reduce) {
  :where(${partSelector(iconButtonContract, "root")}, ${partSelector(buttonContract, "root")}) {
    transition: none;
  }
}
`;
