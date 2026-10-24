import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { Input } from "../../components/input";
import type { Select } from "../../components/select";
import type { Textarea } from "../../components/textarea";
import { selectorForPart } from "../selectors";
const inputPartRefs = parts<typeof Input>("input");
const selectPartRefs = parts<typeof Select>("select");
const textareaPartRefs = parts<typeof Textarea>("textarea");
const input = selectorForPart(inputPartRefs.root);
const select = selectorForPart(selectPartRefs.root);
const textarea = selectorForPart(textareaPartRefs.root);
export const nativeInputStyles = css`
  /* Surface, height and states come from the shared field surface. */
  :where(${input}, ${textarea}, ${select}) {
    width: 100%;
    padding: 0 ${uiTokens.control.fieldInset};
  }
  ${textareaPartRefs.root} {
    min-height: 88px;
    /* Seven px above and below a 22px line: the same first-line position as a
       36px single-line field. */
    padding-block: 7px;
    resize: vertical;
  }
  :where(${inputPartRefs.root}, ${textareaPartRefs.root}, ${selectPartRefs.root})::placeholder {
    color: ${uiTokens.ink.secondary};
  }
  :where(${inputPartRefs.root}, ${textareaPartRefs.root}, ${selectPartRefs.root}):disabled {
    opacity: 1;
  }
  /* Keep native selection and menus; only the resting surface belongs to theme. */
  ${selectPartRefs.root} {
    appearance: none;
  }
  :where(${selectPartRefs.root}:not([multiple]):is(:not([size]), [size="0"], [size="1"])) {
    padding-inline: ${uiTokens.control.fieldInset} 34px;
    text-overflow: ellipsis;
    background-image: ${uiTokens.glyph.selectChevron};
    background-position: right 10px center;
    background-size: 14px 14px;
    background-repeat: no-repeat;
    cursor: pointer;
  }
  :where(${selectPartRefs.root}:dir(rtl):not([multiple]):is(:not([size]), [size="0"], [size="1"])) {
    background-position: left 10px center;
  }
  :where(${selectPartRefs.root}:is([multiple], [size]:not([size="0"]):not([size="1"]))) {
    padding: ${uiTokens.space.group};
    box-shadow: none;
  }
  :where(${selectPartRefs.root}:is([multiple], [size]:not([size="0"]):not([size="1"]))) option {
    padding: ${uiTokens.space.group} ${uiTokens.control.inset};
    border-radius: max(2px, calc(${uiTokens.radius.lg} - 3px));
    font: inherit;
  }
  :where(${selectPartRefs.root}:is([multiple], [size]:not([size="0"]):not([size="1"]))) option:checked {
    color: ${uiTokens.ink.primary};
    background: ${uiTokens.accent.selected};
    font-weight: ${uiTokens.type.weight.semibold};
  }
  ${selectPartRefs.root} option:disabled {
    color: ${uiTokens.ink.tertiary};
  }
  @media (forced-colors: active) {
    ${selectPartRefs.root} {
      appearance: auto;
      background-image: none;
    }
  }
`;
