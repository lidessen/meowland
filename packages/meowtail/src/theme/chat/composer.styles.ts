import { css, parts } from "meowcss/meowjsx";
import { chatTokens, uiTokens } from "../tokens";
import type { ChatAttachments } from "../../chat/attachments";
import type { ChatComposer } from "../../chat/composer";
import type { ChatFrame } from "../../chat/frame";
import type { ChoiceSelect } from "../../components/choice-select";
import type { IconButton } from "../../components/icon-button";
import type { Popover } from "../../components/popover";
import type { Select } from "../../components/select";
import { chatComposerOptions } from "../../chat/composer.options";
import { ui } from "../utilities";
const chatAttachmentsPartRefs = parts<typeof ChatAttachments>("chat-attachments");
const chatComposerPartRefs = parts<typeof ChatComposer>("chat-composer");
const chatFramePartRefs = parts<typeof ChatFrame>("chat-frame");
const choiceSelectPartRefs = parts<typeof ChoiceSelect>("choice-select");
const iconButtonPartRefs = parts<typeof IconButton>("icon-button");
const popoverPartRefs = parts<typeof Popover>("popover");
const selectPartRefs = parts<typeof Select>("select");
export const chatComposerStyles = css`
  ${chatComposerPartRefs.trailing} {
    display: flex;
    align-items: center;
    margin-left: auto;
    min-width: 0;
    max-width: min(280px, 60%);
  }

  ${chatComposerPartRefs.trailing} ${choiceSelectPartRefs.trigger} {
    min-height: 28px;
    border: 0;
    border-radius: ${uiTokens.radius.md};
    background: transparent;
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.label};
    line-height: ${uiTokens.type.line.label};
  }

  ${chatComposerPartRefs.trailing} ${choiceSelectPartRefs.trigger}:hover:not(:disabled) {
    background: ${uiTokens.state.hover};
    color: ${uiTokens.ink.primary};
  }
  /* Open, the quiet trigger holds the active overlay that anchors its menu. */
  ${chatComposerPartRefs.trailing} ${choiceSelectPartRefs.trigger}[aria-expanded="true"]:not(:disabled) {
    background: ${uiTokens.state.active};
    color: ${uiTokens.ink.primary};
  }

  ${chatComposerPartRefs.trailing} ${popoverPartRefs.panel} {
    width: 248px;
  }

  ${chatComposerPartRefs.trailing} ${choiceSelectPartRefs.group}:not(:first-child) {
    border: 0;
    margin-top: 0;
  }

  ${chatComposerPartRefs.trailing} ${choiceSelectPartRefs.option} {
    padding: 6px;
    font-size: ${uiTokens.type.body};
    line-height: ${uiTokens.type.line.body};
  }

  ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="hero"] ${chatComposerPartRefs.input} {
    min-height: 52px;
  }

  ${chatComposerPartRefs.actions} ${selectPartRefs.root} {
    width: auto;
    max-width: min(220px, 55%);
    height: 28px;
    min-height: 28px;
    padding: 0 20px 0 8px;
    border: 0;
    border-radius: ${uiTokens.radius.md};
    background-color: transparent;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%2381858C' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 4px center;
    background-size: 12px 12px;
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.label};
    line-height: ${uiTokens.type.line.label};
    font-weight: ${uiTokens.type.weight.medium};
    cursor: pointer;
  }

  ${chatComposerPartRefs.actions} ${selectPartRefs.root}:hover:not(:disabled) {
    background-color: ${uiTokens.state.hover};
  }

  /* The form groups the writing surface and its external supporting instructions. */
  ${chatComposerPartRefs.root} {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 6px;
    min-width: 0;
    padding: 0;
    border: 0;
    background: transparent;
    box-shadow: none;
  }

  ${chatComposerPartRefs.surface} {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
    min-width: 0;
    padding: 8px 0 0;
    border: 0;
    background: ${uiTokens.surface.fill};
    box-shadow: 0 0 0 ${uiTokens.line.width} ${uiTokens.line.edge};
    transition: box-shadow ${uiTokens.motion.response} ${uiTokens.motion.ease};
    border-radius: ${uiTokens.radius.xxl};
  }

  /* The frame owns its direct writing surface; a footer or card owns its own inset. */
  ${chatFramePartRefs.root} > ${chatComposerPartRefs.root} {
    flex: 0 0 auto;
    box-sizing: border-box;
    width: calc(100% - 2 * ${chatTokens.readingInset});
    max-width: calc(${chatTokens.listMaxWidth} + 32px);
    margin: ${uiTokens.space.section} auto max(${uiTokens.space.section}, env(safe-area-inset-bottom));
  }

  ${chatComposerPartRefs.field} {
    display: contents;
  }

  ${chatComposerPartRefs.attachments} {
    grid-row: 1;
    min-width: 0;
    padding: 2px 6px 0;
    margin-bottom: -6px;
  }

  /* Hosts may retain a hidden mount point while their attachment list is empty. */
  ${chatComposerPartRefs.attachments}:empty,
  ${chatComposerPartRefs.attachments}:has(> [hidden]:only-child) {
    display: none;
  }

  ${chatComposerPartRefs.surface}:has(> ${chatComposerPartRefs.attachments}:not(:empty)):not(
  :has(> ${chatComposerPartRefs.attachments} > [hidden]:only-child)
  )
  ${chatComposerPartRefs.input} {
    grid-row: 2;
  }

  ${chatComposerPartRefs.surface}:has(> ${chatComposerPartRefs.attachments}:not(:empty)):not(
  :has(> ${chatComposerPartRefs.attachments} > [hidden]:only-child)
  )
  ${chatComposerPartRefs.actions} {
    grid-row: 3;
  }

  ${chatComposerPartRefs.attachments} ${chatAttachmentsPartRefs.file} {
    min-height: 64px;
  }

  ${chatComposerPartRefs.input} {
    color: ${uiTokens.ink.primary};
    font-family: ${uiTokens.type.sans};
    box-sizing: border-box;
    display: block;
    width: 100%;
    grid-row: 1;
    min-height: 36px;
    max-height: min(336px, 30svh);
    resize: none;
    padding: 4px 12px 0 14px;
    border: 0;
    border-radius: 0;
    outline: 0;
    background: transparent;
    font-size: var(${chatTokens.fontBody.name}, ${uiTokens.type.body});
    font-weight: ${uiTokens.type.weight.regular};
    line-height: ${chatTokens.leading};
    caret-color: ${uiTokens.state.focus};
  }

  /* Focus paint stays inside the surface when an embedding form clips overflow. */
  ${chatComposerPartRefs.surface}:has(${chatComposerPartRefs.input}:focus:not(:disabled)) {
    outline: 1px solid color-mix(in srgb, ${uiTokens.action.primary} 45%, transparent);
    outline-offset: -1px;
  }

  @media (hover: hover) {
    ${chatComposerPartRefs.surface}:has(${chatComposerPartRefs.input}:hover:not(:disabled):not(:focus)) {
      border-color: transparent;
    }
  }

  ${chatComposerPartRefs.submit}:focus-visible {
    ${ui.focus.ring}
  }

  ${chatComposerPartRefs.input}:focus-visible {
    outline: none;
  }

  ${chatComposerPartRefs.surface}:has(${chatComposerPartRefs.input}:focus-visible) {
    ${ui.focus.inset}
  }

  @supports (field-sizing: content) {
    ${chatComposerPartRefs.input} {
      field-sizing: content;
    }
  }

  ${chatComposerPartRefs.input}::placeholder {
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.body};
  }

  ${chatComposerPartRefs.input}:disabled {
    cursor: not-allowed;
    color: ${uiTokens.ink.tertiary};
  }

  ${chatComposerPartRefs.surface}:has(${chatComposerPartRefs.input}:disabled) {
    background: ${uiTokens.surface.fill};
    box-shadow: none;
  }

  ${chatComposerPartRefs.hint} {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  ${chatComposerPartRefs.actions} {
    grid-row: 2;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    padding: 2px 8px 6px;
    min-height: 32px;
  }

  ${chatComposerPartRefs.submit} {
    display: grid;
    place-items: center;
    margin-left: auto;
    flex: none;
    font-family: ${uiTokens.type.sans};
    transition:
    background-color ${uiTokens.motion.response} ${uiTokens.motion.ease},
    box-shadow ${uiTokens.motion.settle} ${uiTokens.motion.ease};
    width: 34px;
    height: 34px;
    min-width: 34px;
    min-height: 34px;
    padding: 0;
    line-height: 1;
    border: 1px solid transparent;
    border-radius: ${uiTokens.radius.full};
    corner-shape: round;
    background: ${uiTokens.action.primary};
    color: ${uiTokens.action.onPrimary};
    transform: translateY(-2px);
    cursor: pointer;
    font-size: ${uiTokens.type.body};
    font-weight: ${uiTokens.type.weight.medium};
    box-shadow: none;
  }

  ${chatComposerPartRefs.submit} svg {
    width: ${uiTokens.icon.large};
    height: ${uiTokens.icon.large};
  }

  ${chatComposerPartRefs.trailing} + ${chatComposerPartRefs.submit} {
    margin-left: 0;
  }

  ${chatComposerPartRefs.actions} > ${iconButtonPartRefs.root} {
    width: 28px;
    height: 28px;
    min-width: 28px;
    min-height: 28px;
    border-radius: 50%;
    corner-shape: round;
    background: ${uiTokens.surface.fill};
    color: ${uiTokens.ink.primary};
  }

  ${chatComposerPartRefs.submit}:hover:not(:disabled) {
    background: ${uiTokens.action.primaryHover};
  }

  ${chatComposerPartRefs.submit}:disabled {
    cursor: not-allowed;
    border-color: transparent;
    opacity: 0.4;
    box-shadow: none;
  }

  @media (max-width: 680px) {
    ${chatComposerPartRefs.surface} {
      grid-template-columns: minmax(0, 1fr);
      padding: 8px 0 0;
    }

    ${chatComposerPartRefs.hint} {
      font-size: ${uiTokens.type.caption};
    }
  }

  ${chatComposerPartRefs.submit}:active:not(:disabled) {
    box-shadow: ${uiTokens.shadow.pressed};
    transition-duration: ${uiTokens.motion.instant};
  }

  /* A compact writing surface grows with the draft, not with an empty tools row.
  The inline row keeps the one-line text and the send action on the optical
  center: equal block padding around the 24px line, a symmetric action row, and
  no base-layout nudge on the submit button. */
  ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="inline"] > ${chatComposerPartRefs.surface} {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    padding: ${uiTokens.control.inset} ${uiTokens.space.section};
  }

  ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="inline"] ${chatComposerPartRefs.input} {
    grid-column: 1;
    grid-row: 1;
    min-height: 40px;
    padding-block: 8px;
  }

  ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="inline"] ${chatComposerPartRefs.actions} {
    grid-column: 2;
    grid-row: 1;
    flex-wrap: nowrap;
    padding-block: 4px;
  }

  ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="inline"] ${chatComposerPartRefs.submit} {
    transform: none;
  }

  ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="inline"] ${chatComposerPartRefs.attachments} {
    grid-column: 1 / -1;
  }

  ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="inline"] > ${chatComposerPartRefs.surface}:has(> ${chatComposerPartRefs.attachments}:not(:empty)):not(
  :has(> ${chatComposerPartRefs.attachments} > [hidden]:only-child)
  )
  :is(${chatComposerPartRefs.input}, ${chatComposerPartRefs.actions}) {
    grid-row: 2;
  }

  @media (pointer: coarse) {
    ${chatComposerPartRefs.input} {
      font-size: max(${uiTokens.type.touchField}, ${uiTokens.type.body});
    }
  }

  @media (prefers-reduced-motion: reduce) {
    ${chatComposerPartRefs.surface},
    ${chatComposerPartRefs.input},
    ${chatComposerPartRefs.submit} {
      transition: none;
    }
  }

  ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="stacked"] > ${chatComposerPartRefs.surface} {
    position: relative;
    gap: 4px;
    padding: 12px 12px 10px;
    border: ${uiTokens.line.width} solid ${uiTokens.line.edge};
  }

  ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="stacked"] ${chatComposerPartRefs.input} {
    padding: 2px 6px 6px;
  }

  ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="stacked"] ${chatComposerPartRefs.actions} {
    gap: 6px;
    padding: 0;
    min-height: 34px;
  }

  ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="stacked"] ${chatComposerPartRefs.actions} > ${iconButtonPartRefs.root} {
    width: 32px;
    height: 32px;
    min-width: 32px;
    min-height: 32px;
    border: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    border-radius: ${uiTokens.radius.lg};
    background: transparent;
    color: ${uiTokens.ink.secondary};
  }

  ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="stacked"] ${chatComposerPartRefs.actions} > ${iconButtonPartRefs.root}:hover:not(:disabled) {
    background: ${uiTokens.state.hover};
    color: ${uiTokens.ink.primary};
  }

  /* The model and its supporting choices stay beside send, not stranded after attach. */
  ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="stacked"] ${chatComposerPartRefs.actions} > ${chatComposerPartRefs.trailing} {
    margin-left: auto;
    min-width: 0;
    max-width: min(360px, 70%);
  }

  ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="stacked"] ${chatComposerPartRefs.actions} > ${chatComposerPartRefs.submit} {
    margin-left: 0;
  }

  ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="stacked"] ${chatComposerPartRefs.actions}:not(:has(> ${chatComposerPartRefs.trailing})) > ${chatComposerPartRefs.submit} {
    margin-left: auto;
  }

  ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="stacked"] ${chatComposerPartRefs.submit} {
    width: 34px;
    height: 34px;
    min-width: 34px;
    min-height: 34px;
    border-radius: ${uiTokens.radius.lg};
    background: ${uiTokens.action.primary};
    color: ${uiTokens.action.onPrimary};
    transform: none;
  }

  ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="stacked"] ${chatComposerPartRefs.submit}:hover:not(:disabled) {
    background: ${uiTokens.action.primaryHover};
  }

  ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="stacked"] ${chatComposerPartRefs.submit}:disabled {
    opacity: 0.35;
  }

  /* Supporting text is outside the writing surface and never joins its action grid. */
  ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="stacked"] > ${chatComposerPartRefs.hint},
  ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="inline"]:focus-within > ${chatComposerPartRefs.hint} {
    position: static;
    min-width: 0;
    width: auto;
    height: auto;
    padding-inline: 18px;
    overflow: visible;
    clip-path: none;
    white-space: normal;
    overflow-wrap: anywhere;
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.caption};
    line-height: ${uiTokens.type.line.caption};
    pointer-events: auto;
  }

  /* The inline draft starts after the surface's section inset and the input's own 14px. */
  ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="inline"]:focus-within > ${chatComposerPartRefs.hint} {
    padding-inline: calc(${uiTokens.space.section} + 14px);
  }

  /* A phone writes on one row: attach, text, send. The model choice keeps a quiet row beneath. */
  @media (max-width: 768px) {
    ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="stacked"] > ${chatComposerPartRefs.surface} {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: end;
      gap: 0 8px;
      padding: 6px;
      border-radius: ${chatTokens.composerRadius};
      }

    ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="stacked"] ${chatComposerPartRefs.attachments} {
      grid-column: 1 / -1;
      grid-row: 1;
    }

    ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="stacked"] ${chatComposerPartRefs.input} {
      grid-column: 2;
      grid-row: 2;
      min-height: 36px;
      padding: 6px 4px;
      font-size: ${uiTokens.type.touchField};
      line-height: ${uiTokens.type.line.reading};
    }

    ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="stacked"] ${chatComposerPartRefs.actions} {
      display: contents;
    }

    ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="stacked"] ${chatComposerPartRefs.actions} > ${iconButtonPartRefs.root} {
      grid-column: 1;
      grid-row: 2;
      width: 36px;
      height: 36px;
      min-width: 36px;
      min-height: 36px;
      border: 0;
      border-radius: 50%;
      background: ${uiTokens.surface.fill};
      color: ${uiTokens.ink.primary};
    }

    ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="stacked"] ${chatComposerPartRefs.actions} > ${chatComposerPartRefs.trailing} {
      grid-column: 2 / -1;
      grid-row: 3;
      margin-left: 0;
      max-width: none;
      padding-top: 2px;
      justify-content: flex-start;
    }

    /* Any other action (a labeled button, a host control) cannot share the one writing row:
    it takes the quiet row beneath, so the text keeps its column. */
    ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="stacked"] ${chatComposerPartRefs.actions} > :not(${iconButtonPartRefs.root}, ${chatComposerPartRefs.trailing}, ${chatComposerPartRefs.submit}) {
      grid-column: 1 / -1;
      grid-row: 3;
      justify-self: start;
      margin-top: 2px;
    }

    ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="stacked"] ${chatComposerPartRefs.actions}:has(> :not(${iconButtonPartRefs.root}, ${chatComposerPartRefs.trailing}, ${chatComposerPartRefs.submit})) > ${chatComposerPartRefs.trailing} {
      grid-row: 4;
    }

    ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="stacked"] > ${chatComposerPartRefs.hint} {
      padding-inline: 12px;
    }

    ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="stacked"] ${chatComposerPartRefs.actions} > ${chatComposerPartRefs.submit} {
      grid-column: 3;
      grid-row: 2;
      width: 36px;
      height: 36px;
      min-width: 36px;
      min-height: 36px;
      margin-left: 0;
      border-radius: 50%;
    }

  }

  /* Explicit bare embedding removes only the writing surface chrome. The form
     and external supporting instructions keep their normal layout. */
  ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("surface")}="none"] > ${chatComposerPartRefs.surface} {
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
  }

  /* Bar: one rounded row (attach, text, trailing choices, send) that grows with the draft. */
  ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="bar"] > ${chatComposerPartRefs.surface} {
    /* Beside a fractional text column an auto track would shrink to min-content and fold the
    trailing choices into a column; they keep one row up to the trailing cap instead. */
    grid-template-columns: auto minmax(0, 1fr) fit-content(280px) auto;
    align-items: end;
    gap: 0 ${uiTokens.space.group};
    padding: 6px;
    border: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    border-radius: ${chatTokens.composerRadius};
  }
  ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="bar"] ${chatComposerPartRefs.attachments} {
    grid-column: 1 / -1;
    grid-row: 1;
    padding: 4px 4px ${uiTokens.space.group};
  }
  ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="bar"] ${chatComposerPartRefs.input} {
    grid-column: 2;
    grid-row: 2;
    min-height: ${uiTokens.control.regular};
    padding: 6px 4px;
    line-height: ${uiTokens.type.line.reading};
  }
  ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="bar"] ${chatComposerPartRefs.actions} {
    display: contents;
  }
  ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="bar"] ${chatComposerPartRefs.actions} > ${iconButtonPartRefs.root},
  ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="bar"] ${chatComposerPartRefs.trailing} ${iconButtonPartRefs.root} {
    width: ${uiTokens.control.regular};
    height: ${uiTokens.control.regular};
    min-width: ${uiTokens.control.regular};
    min-height: ${uiTokens.control.regular};
    border: 0;
    border-radius: 50%;
    corner-shape: round;
    background: transparent;
    color: ${uiTokens.ink.secondary};
  }
  ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="bar"] ${chatComposerPartRefs.actions} > ${iconButtonPartRefs.root} {
    grid-column: 1;
    grid-row: 2;
  }
  @media (hover: hover) {
    ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="bar"] ${chatComposerPartRefs.actions} > ${iconButtonPartRefs.root}:hover:not(:disabled),
    ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="bar"] ${chatComposerPartRefs.trailing} ${iconButtonPartRefs.root}:hover:not(:disabled) {
      background: ${uiTokens.state.hover};
      color: ${uiTokens.ink.primary};
    }
  }
  ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="bar"] ${chatComposerPartRefs.trailing} {
    grid-column: 3;
    grid-row: 2;
    display: flex;
    align-items: center;
    gap: 2px;
    min-width: 0;
    /* The track caps the width; a percentage here would resolve against the track itself. */
    max-width: none;
    min-height: ${uiTokens.control.regular};
  }
  ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="bar"] ${chatComposerPartRefs.submit} {
    grid-column: 4;
    grid-row: 2;
    width: ${uiTokens.control.regular};
    height: ${uiTokens.control.regular};
    min-width: ${uiTokens.control.regular};
    min-height: ${uiTokens.control.regular};
    margin: 0;
    border-radius: 50%;
    corner-shape: round;
    background: ${uiTokens.action.primary};
    color: ${uiTokens.action.onPrimary};
    transform: none;
  }
  ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="bar"] ${chatComposerPartRefs.submit}:disabled {
    opacity: 0.35;
  }
  ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="bar"] > ${chatComposerPartRefs.hint} {
    position: static;
    width: auto;
    height: auto;
    padding-inline: ${uiTokens.space.section};
    overflow: visible;
    clip-path: none;
    white-space: normal;
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.caption};
  }
  /* In a narrow container the choices take a quiet row under the text. */
  @container (max-width: 480px) {
    ${chatComposerPartRefs.root}[${chatComposerOptions.attribute("layout")}="bar"] ${chatComposerPartRefs.trailing}:has(${choiceSelectPartRefs.trigger}:not([hidden])) {
      grid-column: 2 / 4;
      grid-row: 3;
    }
  }
`;
