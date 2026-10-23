import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { focusRing } from "../recipes";
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
  min-height: ${uiTokens.control.regular};
  padding: 0 14px;
  border: 0;
  border-radius: ${uiTokens.radius.lg};
  background: transparent;
  color: ${uiTokens.ink.primary};
  font: ${uiTokens.type.weight.medium} ${uiTokens.type.body} / ${uiTokens.type.line.body} ${uiTokens.type.sans};
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color ${uiTokens.motion.response} ${uiTokens.motion.ease},
    border-color ${uiTokens.motion.response} ${uiTokens.motion.ease},
    box-shadow ${uiTokens.motion.settle} ${uiTokens.motion.ease},
    transform ${uiTokens.motion.response} ${uiTokens.motion.ease};
  -webkit-tap-highlight-color: transparent;
}
/* A press settles the action half a pixel, so a click is felt, not only seen. */
:where(${partSelector(iconButtonContract, "root")}, ${partSelector(buttonContract, "root")}):active:not(:disabled) {
  transform: translateY(0.5px);
}
${partSelector(iconButtonContract, "root")} {
  width: ${uiTokens.control.regular};
  min-width: ${uiTokens.control.regular};
  height: ${uiTokens.control.regular};
  padding: 0;
  flex-shrink: 0;
  color: ${uiTokens.ink.secondary};
}
:where(${partSelector(iconButtonContract, "root")}, ${partSelector(buttonContract, "root")}) svg {
  width: ${uiTokens.icon.size};
  height: ${uiTokens.icon.size};
  flex-shrink: 0;
}
${partSelector(buttonContract, "root")} {
  ${buttonOptions.when({ variant: "primary" })} {
    background: ${uiTokens.action.primary};
    color: ${uiTokens.action.onPrimary};
    box-shadow: ${uiTokens.shadow.filled};
  }
}
${partSelector(buttonContract, "root")} {
  ${buttonOptions.when({ variant: "danger" })} {
    background: ${uiTokens.action.danger};
    color: ${uiTokens.action.onDanger};
    box-shadow: ${uiTokens.shadow.filled};
  }
}
${partSelector(buttonContract, "root")} {
  ${buttonOptions.when({ variant: "outline" })} {
    border: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    background: ${uiTokens.surface.raised};
    /* A one-pixel drop lifts the outline action off the page without a heavier border. */
    box-shadow: ${uiTokens.shadow.action};
  }
}
${partSelector(buttonContract, "root")} {
  ${buttonOptions.when({ variant: "accent" })} {
    background: ${uiTokens.accent.soft};
    color: ${uiTokens.accent.ink};
    font-weight: ${uiTokens.type.weight.medium};
  }
}
${partSelector(buttonContract, "root")} {
  ${buttonOptions.when({ variant: "stop" })} {
    color: ${uiTokens.status.danger};
  }
}
@media (hover: hover) {
  :where(
      ${partSelector(iconButtonContract, "root")},
      ${partSelector(buttonContract, "root")}[${buttonOptions.attribute("variant")}="quiet"],
      ${partSelector(buttonContract, "root")}[${buttonOptions.attribute("variant")}="outline"]
    ):hover:not(:disabled) {
    background: ${uiTokens.state.hover};
    color: ${uiTokens.ink.primary};
  }
  ${partSelector(buttonContract, "root")}[${buttonOptions.attribute("variant")}="primary"]:hover:not(:disabled) {
    background: ${uiTokens.action.primaryHover};
  }
  ${partSelector(buttonContract, "root")}[${buttonOptions.attribute("variant")}="danger"]:hover:not(:disabled) {
    background: color-mix(in srgb, ${uiTokens.action.danger} 88%, ${uiTokens.ink.primary});
  }
  ${partSelector(buttonContract, "root")}[${buttonOptions.attribute("variant")}="accent"]:hover:not(:disabled) {
    background: color-mix(in srgb, ${uiTokens.accent.base} 14%, ${uiTokens.accent.soft});
  }
  ${partSelector(buttonContract, "root")}[${buttonOptions.attribute("variant")}="stop"]:hover:not(:disabled) {
    background: color-mix(in srgb, ${uiTokens.status.danger} 8%, transparent);
  }
}
:where(${partSelector(iconButtonContract, "root")}, ${partSelector(buttonContract, "root")}[${buttonOptions.attribute("variant")}="quiet"], ${partSelector(buttonContract, "root")}[${buttonOptions.attribute("variant")}="outline"]):active:not(:disabled) {
  background: ${uiTokens.state.active};
}
:where(${partSelector(iconButtonContract, "root")}, ${partSelector(buttonContract, "root")}):focus-visible {
  ${focusRing()}
}
:where(${partSelector(iconButtonContract, "root")}, ${partSelector(buttonContract, "root")}):disabled {
  cursor: not-allowed;
  opacity: 0.4;
}
${partSelector(buttonContract, "root")}:disabled {
  box-shadow: none;
}
${partSelector(buttonContract, "root")} {
  ${buttonOptions.when({ size: "small" })} {
    min-height: ${uiTokens.control.small};
    padding-inline: 10px;
    border-radius: ${uiTokens.radius.md};
    font-size: ${uiTokens.type.caption};
    line-height: ${uiTokens.type.line.caption};
  }
}
${partSelector(buttonContract, "root")} {
  ${buttonOptions.when({ size: "large" })} {
    min-height: ${uiTokens.control.large};
    padding-inline: 20px;
  }
}
${partSelector(iconButtonContract, "root")} {
  ${iconButtonOptions.when({ size: "small" })} {
    width: ${uiTokens.control.small};
    min-width: ${uiTokens.control.small};
    height: ${uiTokens.control.small};
    min-height: ${uiTokens.control.small};
    border-radius: ${uiTokens.radius.md};
  }
}
${partSelector(iconButtonContract, "root")} {
  ${iconButtonOptions.when({ size: "large" })} {
    width: ${uiTokens.control.large};
    min-width: ${uiTokens.control.large};
    height: ${uiTokens.control.large};
    min-height: ${uiTokens.control.large};
  }
}
${partSelector(buttonContract, "root")} svg {
  transition: transform ${uiTokens.motion.settle} ${uiTokens.motion.ease};
}
${partSelector(buttonContract, "root")}[aria-expanded="true"] svg:last-child {
  transform: rotate(180deg);
}
@media (prefers-reduced-motion: reduce) {
  :where(${partSelector(iconButtonContract, "root")}, ${partSelector(buttonContract, "root")}) {
    transition: none;
  }
  ${partSelector(buttonContract, "root")} svg {
    transition: none;
  }
}
`;
