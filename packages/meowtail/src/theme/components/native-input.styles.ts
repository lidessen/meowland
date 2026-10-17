import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { inputContract } from "../../components/input";
import { textareaContract } from "../../components/textarea";
import { selectContract } from "../../components/select";

export const nativeInputStyles = css`
  :where(${partSelector(inputContract, "root")}, ${partSelector(textareaContract, "root")}, ${partSelector(selectContract, "root")}) {
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    min-height: ${uiTokens.controlHeight};
    padding: 4px ${uiTokens.controlPaddingInline};
    border: 0.5px solid ${uiTokens.border};
    border-radius: ${uiTokens.controlRadius};
    color: ${uiTokens.foreground};
    background: ${uiTokens.inputSurface};
    font: ${uiTokens.fontBody}/${uiTokens.leading} ${uiTokens.font};
    transition: border-color ${uiTokens.durationResponse} ${uiTokens.ease};
  }
  ${partSelector(textareaContract, "root")} {
    min-height: 88px;
    resize: vertical;
  }
  ${partSelector(inputContract, "root")} {
    /* Reference Input wraps a 32px content box in a half-pixel border. */
    min-height: calc(${uiTokens.controlHeight} + 1px);
  }
  :where(${partSelector(inputContract, "root")}, ${partSelector(selectContract, "root")}) {
    line-height: 22px;
  }
  :where(${partSelector(inputContract, "root")}, ${partSelector(textareaContract, "root")}, ${partSelector(selectContract, "root")})::placeholder {
    color: ${uiTokens.placeholder};
  }
  :where(${partSelector(inputContract, "root")}, ${partSelector(textareaContract, "root")}, ${partSelector(selectContract, "root")}):focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: 2px;
    border-color: ${uiTokens.focus};
  }
  ${partSelector(inputContract, "root")}:focus-visible {
    outline: none;
  }
  :where(${partSelector(inputContract, "root")}, ${partSelector(textareaContract, "root")}, ${partSelector(selectContract, "root")})[aria-invalid="true"] {
    border-color: ${uiTokens.danger};
  }
  :where(${partSelector(inputContract, "root")}, ${partSelector(textareaContract, "root")}, ${partSelector(selectContract, "root")}):disabled {
    cursor: not-allowed;
    color: ${uiTokens.subtleForeground};
    opacity: 1;
    border-color: ${uiTokens.borderFaint};
  }
  /* Keep native selection and menus; only the resting surface belongs to theme. */
  ${partSelector(selectContract, "root")} {
    appearance: none;
    transition:
      border-color ${uiTokens.durationResponse} ${uiTokens.ease},
      background-color ${uiTokens.durationResponse} ${uiTokens.ease};
  }
  :where(${partSelector(selectContract, "root")}:not([multiple]):is(:not([size]), [size="0"], [size="1"])) {
    padding-inline: ${uiTokens.controlPaddingInline} 34px;
    text-overflow: ellipsis;
    background-image:
      linear-gradient(45deg, transparent 40%, currentColor 40%, currentColor 60%, transparent 60%),
      linear-gradient(135deg, transparent 40%, currentColor 40%, currentColor 60%, transparent 60%);
    background-position:
      right 17px center,
      right 13px center;
    background-size: 5px 5px;
    background-repeat: no-repeat;
    cursor: pointer;
  }
  :where(${partSelector(selectContract, "root")}:dir(rtl):not([multiple]):is(:not([size]), [size="0"], [size="1"])) {
    background-position:
      left 13px center,
      left 17px center;
  }
  :where(${partSelector(selectContract, "root")}:is([multiple], [size]:not([size="0"]):not([size="1"]))) {
    padding: ${uiTokens.spaceGroup};
    box-shadow: none;
  }
  :where(${partSelector(selectContract, "root")}:is([multiple], [size]:not([size="0"]):not([size="1"]))) option {
    padding: ${uiTokens.spaceGroup} ${uiTokens.controlPaddingInline};
    border-radius: max(2px, calc(${uiTokens.controlRadius} - 3px));
    font: inherit;
  }
  :where(${partSelector(selectContract, "root")}:is([multiple], [size]:not([size="0"]):not([size="1"]))) option:checked {
    color: ${uiTokens.foreground};
    background: ${uiTokens.primarySoft};
    font-weight: 600;
  }
  ${partSelector(selectContract, "root")} option:disabled {
    color: ${uiTokens.subtleForeground};
  }
  ${partSelector(selectContract, "root")}:disabled {
    cursor: not-allowed;
    box-shadow: none;
  }
  @media (hover: hover) {
    ${partSelector(selectContract, "root")}:hover:not(:disabled):not([aria-invalid="true"]) {
      border-color: ${uiTokens.mutedForeground};
    }
  }
  @media (forced-colors: active) {
    ${partSelector(selectContract, "root")} {
      appearance: auto;
      background-image: none;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    :where(${partSelector(inputContract, "root")}, ${partSelector(textareaContract, "root")}, ${partSelector(selectContract, "root")}) {
      transition: none;
    }
  }
`;
