import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { selectorForPart } from "../selectors";

import type { ChoiceSelect } from "../../components/choice-select";
import type { Input } from "../../components/input";
import type { NumberInput } from "../../components/number-input";
import type { SearchInput } from "../../components/search-input";
import type { Select } from "../../components/select";
import type { Textarea } from "../../components/textarea";
const choiceSelectPartRefs = parts<typeof ChoiceSelect>("choice-select");
const inputPartRefs = parts<typeof Input>("input");
const numberInputPartRefs = parts<typeof NumberInput>("number-input");
const searchInputPartRefs = parts<typeof SearchInput>("search-input");
const selectPartRefs = parts<typeof Select>("select");
const textareaPartRefs = parts<typeof Textarea>("textarea");
/*
 * One surface for every place a reader types or picks a value. Each family
 * keeps its own layout in its own file; the resting box, the single-line
 * height and the hover, focus, invalid and disabled states live here, so two
 * fields side by side can never disagree about what "focused" looks like.
 * Every selector has zero specificity, so source order decides: rest, hover,
 * read-only, focus, invalid, disabled.
 */
const input = selectorForPart(inputPartRefs.root);
const textarea = selectorForPart(textareaPartRefs.root);
const select = selectorForPart(selectPartRefs.root);
const choice = selectorForPart(choiceSelectPartRefs.trigger);
const search = selectorForPart(searchInputPartRefs.root);
const number = selectorForPart(numberInputPartRefs.root);

const surfaces = `:where(${input}, ${textarea}, ${select}, ${choice}, ${search}, ${number})`;
const singleLine = `:where(${input}, ${select}:not([multiple]):is(:not([size]), [size="0"], [size="1"]), ${choice}, ${search}, ${number})`;
/* Where focus lands: the element itself, or the wrapper around a bare control. */
const focused = `:where(${input}:focus-visible, ${textarea}:focus-visible, ${select}:focus-visible, ${choice}:focus-visible, ${choice}[aria-expanded="true"], ${search}:focus-within, ${number}:focus-within)`;
const invalid = `:where(${input}[aria-invalid="true"], ${textarea}[aria-invalid="true"], ${select}[aria-invalid="true"], ${choice}[aria-invalid="true"], ${search}:has([aria-invalid="true"]), ${number}:has([aria-invalid="true"]))`;
/* Read-only text stays at full contrast; only the surface steps back. */
const readOnly = `:where(${input}[readonly], ${textarea}[readonly], ${search}:has([readonly]), ${number}:has([readonly]))`;
const disabled = `:where(${input}:disabled, ${textarea}:disabled, ${select}:disabled, ${choice}:disabled, ${search}:has(:disabled), ${number}:has(:disabled))`;

export const fieldSurfaceStyles = css`
  ${surfaces} {
    box-sizing: border-box;
    min-width: 0;
    border: 1px solid ${uiTokens.line.control};
    border-radius: ${uiTokens.radius.lg};
    color: ${uiTokens.ink.primary};
    background: ${uiTokens.surface.field};
    box-shadow: ${uiTokens.shadow.field};
    font: ${uiTokens.type.body} / ${uiTokens.type.line.body} ${uiTokens.type.sans};
    outline: none;
    transition:
      border-color ${uiTokens.motion.response} ${uiTokens.motion.ease},
      box-shadow ${uiTokens.motion.response} ${uiTokens.motion.ease};
  }
  ${singleLine} {
    min-height: ${uiTokens.control.regular};
  }

  @media (hover: hover) {
    :where(${surfaces}:hover) {
      border-color: ${uiTokens.line.controlHover};
    }
  }
  /* Read-only text sits on a fill; the fill replaces the control line. */
  ${readOnly} {
    border-color: transparent;
    background: ${uiTokens.surface.fill};
  }
  ${focused} {
    border-color: ${uiTokens.state.focus};
    box-shadow: 0 0 0 3px ${uiTokens.state.focusRing};
  }

  ${invalid} {
    border-color: ${uiTokens.status.danger};
  }
  :where(${invalid}:is(:focus-visible, :focus-within, [aria-expanded="true"])) {
    box-shadow: 0 0 0 3px color-mix(in srgb, ${uiTokens.status.danger} 22%, transparent);
  }
  ${disabled} {
    color: ${uiTokens.ink.tertiary};
    border-color: ${uiTokens.line.divider};
    background: ${uiTokens.surface.fill};
    box-shadow: none;
    cursor: not-allowed;
  }
  @media (forced-colors: active) {
    ${focused} {
      outline: 2px solid Highlight;
      outline-offset: 1px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    ${surfaces} {
      transition: none;
    }
  }
`;
