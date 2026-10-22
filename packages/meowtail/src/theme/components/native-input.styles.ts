import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { inputContract } from "../../components/input";
import { textareaContract } from "../../components/textarea";
import { selectContract } from "../../components/select";

export const nativeInputStyles = css`
  /* Surface, height and states come from the shared field surface. */
  :where(${partSelector(inputContract, "root")}, ${partSelector(textareaContract, "root")}, ${partSelector(selectContract, "root")}) {
    width: 100%;
    padding: 0 ${uiTokens.control.fieldInset};
  }
  ${partSelector(textareaContract, "root")} {
    min-height: 88px;
    /* Seven px above and below a 22px line: the same first-line position as a
       36px single-line field. */
    padding-block: 7px;
    resize: vertical;
  }
  :where(${partSelector(inputContract, "root")}, ${partSelector(textareaContract, "root")}, ${partSelector(selectContract, "root")})::placeholder {
    color: ${uiTokens.ink.secondary};
  }
  :where(${partSelector(inputContract, "root")}, ${partSelector(textareaContract, "root")}, ${partSelector(selectContract, "root")}):disabled {
    opacity: 1;
  }
  /* Keep native selection and menus; only the resting surface belongs to theme. */
  ${partSelector(selectContract, "root")} {
    appearance: none;
  }
  :where(${partSelector(selectContract, "root")}:not([multiple]):is(:not([size]), [size="0"], [size="1"])) {
    padding-inline: ${uiTokens.control.fieldInset} 34px;
    text-overflow: ellipsis;
    background-image: ${uiTokens.glyph.selectChevron};
    background-position: right 10px center;
    background-size: 14px 14px;
    background-repeat: no-repeat;
    cursor: pointer;
  }
  :where(${partSelector(selectContract, "root")}:dir(rtl):not([multiple]):is(:not([size]), [size="0"], [size="1"])) {
    background-position: left 10px center;
  }
  :where(${partSelector(selectContract, "root")}:is([multiple], [size]:not([size="0"]):not([size="1"]))) {
    padding: ${uiTokens.space.group};
    box-shadow: none;
  }
  :where(${partSelector(selectContract, "root")}:is([multiple], [size]:not([size="0"]):not([size="1"]))) option {
    padding: ${uiTokens.space.group} ${uiTokens.control.inset};
    border-radius: max(2px, calc(${uiTokens.radius.lg} - 3px));
    font: inherit;
  }
  :where(${partSelector(selectContract, "root")}:is([multiple], [size]:not([size="0"]):not([size="1"]))) option:checked {
    color: ${uiTokens.ink.primary};
    background: ${uiTokens.accent.selected};
    font-weight: 600;
  }
  ${partSelector(selectContract, "root")} option:disabled {
    color: ${uiTokens.ink.tertiary};
  }
  @media (forced-colors: active) {
    ${partSelector(selectContract, "root")} {
      appearance: auto;
      background-image: none;
    }
  }
`;
