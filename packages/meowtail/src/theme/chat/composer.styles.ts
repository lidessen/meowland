import { css, partSelector } from "meowcss/meowjsx";
import { chatTokens, uiTokens } from "../tokens";
import { chatAttachmentsContract } from "../../chat/attachments";
import { chatComposerContract, chatComposerOptions } from "../../chat/composer";
import { chatFrameContract } from "../../chat/frame";
import { iconButtonContract } from "../../components/icon-button";
import { selectContract } from "../../components/select";
import { choiceSelectContract } from "../../components/choice-select";
import { popoverContract } from "../../components/popover";

export const chatComposerStyles = css`
  ${partSelector(chatComposerContract, "trailing")} {
    display: flex;
    align-items: center;
    margin-left: auto;
    min-width: 0;
    max-width: min(280px, 60%);
  }

  ${partSelector(chatComposerContract, "trailing")} ${partSelector(choiceSelectContract, "trigger")} {
    min-height: 28px;
    border: 0;
    border-radius: ${uiTokens.radius.md};
    background: transparent;
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.label};
    line-height: 20px;
  }

  ${partSelector(chatComposerContract, "trailing")} ${partSelector(choiceSelectContract, "trigger")}:hover:not(:disabled) {
    background: ${uiTokens.state.hover};
    color: ${uiTokens.ink.primary};
  }
  /* Open, the quiet trigger becomes a filled chip that anchors its menu. */
  ${partSelector(chatComposerContract, "trailing")} ${partSelector(choiceSelectContract, "trigger")}[aria-expanded="true"]:not(:disabled) {
    background: ${uiTokens.surface.fill};
    color: ${uiTokens.ink.primary};
  }

  ${partSelector(chatComposerContract, "trailing")} ${partSelector(popoverContract, "panel")} {
    width: 248px;
  }

  ${partSelector(chatComposerContract, "trailing")} ${partSelector(choiceSelectContract, "group")}:not(:first-child) {
    border: 0;
    margin-top: 0;
  }

  ${partSelector(chatComposerContract, "trailing")} ${partSelector(choiceSelectContract, "option")} {
    padding: 6px;
    font-size: ${uiTokens.type.body};
    line-height: 22px;
  }

  ${partSelector(chatComposerContract, "root")}[${chatComposerOptions.attribute("layout")}="hero"] ${partSelector(chatComposerContract, "input")} {
    min-height: 52px;
  }

  ${partSelector(chatComposerContract, "actions")} ${partSelector(selectContract, "root")} {
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
    line-height: 20px;
    font-weight: 500;
    cursor: pointer;
  }

  ${partSelector(chatComposerContract, "actions")} ${partSelector(selectContract, "root")}:hover:not(:disabled) {
    background-color: ${uiTokens.state.hover};
  }

  /* The form groups the writing surface and its external supporting instructions. */
  ${partSelector(chatComposerContract, "root")} {
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

  ${partSelector(chatComposerContract, "surface")} {
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
  ${partSelector(chatFrameContract, "root")} > ${partSelector(chatComposerContract, "root")} {
    flex: 0 0 auto;
    box-sizing: border-box;
    width: calc(100% - 2 * ${chatTokens.readingInset});
    max-width: calc(${chatTokens.listMaxWidth} + 32px);
    margin: ${uiTokens.space.section} auto max(${uiTokens.space.section}, env(safe-area-inset-bottom));
  }

  ${partSelector(chatComposerContract, "field")} {
    display: contents;
  }

  ${partSelector(chatComposerContract, "attachments")} {
    grid-row: 1;
    min-width: 0;
    padding: 2px 10px 0;
    margin-bottom: -6px;
  }

  /* Hosts may retain a hidden mount point while their attachment list is empty. */
  ${partSelector(chatComposerContract, "attachments")}:empty,
  ${partSelector(chatComposerContract, "attachments")}:has(> [hidden]:only-child) {
    display: none;
  }

  ${partSelector(chatComposerContract, "surface")}:has(> ${partSelector(chatComposerContract, "attachments")}:not(:empty)):not(
  :has(> ${partSelector(chatComposerContract, "attachments")} > [hidden]:only-child)
  )
  ${partSelector(chatComposerContract, "input")} {
    grid-row: 2;
  }

  ${partSelector(chatComposerContract, "surface")}:has(> ${partSelector(chatComposerContract, "attachments")}:not(:empty)):not(
  :has(> ${partSelector(chatComposerContract, "attachments")} > [hidden]:only-child)
  )
  ${partSelector(chatComposerContract, "actions")} {
    grid-row: 3;
  }

  ${partSelector(chatComposerContract, "attachments")} ${partSelector(chatAttachmentsContract, "file")} {
    min-height: 64px;
  }

  ${partSelector(chatComposerContract, "input")} {
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
    font-weight: 400;
    line-height: 24px;
    caret-color: ${uiTokens.state.focus};
  }

  /* Focus paint stays inside the surface when an embedding form clips overflow. */
  ${partSelector(chatComposerContract, "surface")}:has(${partSelector(chatComposerContract, "input")}:focus:not(:disabled)) {
    outline: 1px solid color-mix(in srgb, ${uiTokens.action.primary} 45%, transparent);
    outline-offset: -1px;
  }

  @media (hover: hover) {
    ${partSelector(chatComposerContract, "surface")}:has(${partSelector(chatComposerContract, "input")}:hover:not(:disabled):not(:focus)) {
      border-color: transparent;
    }
  }

  ${partSelector(chatComposerContract, "submit")}:focus-visible {
    outline: 2px solid ${uiTokens.state.focus};
    outline-offset: 2px;
  }

  ${partSelector(chatComposerContract, "input")}:focus-visible {
    outline: none;
  }

  ${partSelector(chatComposerContract, "surface")}:has(${partSelector(chatComposerContract, "input")}:focus-visible) {
    outline: 2px solid ${uiTokens.state.focus};
    outline-offset: -2px;
  }

  @supports (field-sizing: content) {
    ${partSelector(chatComposerContract, "input")} {
      field-sizing: content;
    }
  }

  ${partSelector(chatComposerContract, "input")}::placeholder {
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.body};
  }

  ${partSelector(chatComposerContract, "input")}:disabled {
    cursor: not-allowed;
    color: ${uiTokens.ink.tertiary};
  }

  ${partSelector(chatComposerContract, "surface")}:has(${partSelector(chatComposerContract, "input")}:disabled) {
    background: ${uiTokens.surface.fill};
    box-shadow: none;
  }

  ${partSelector(chatComposerContract, "hint")} {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  ${partSelector(chatComposerContract, "actions")} {
    grid-row: 2;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    padding: 2px 8px 6px;
    min-height: 32px;
  }

  ${partSelector(chatComposerContract, "submit")} {
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
    line-height: 1.2;
    border: 1px solid transparent;
    border-radius: 999px;
    corner-shape: round;
    background: ${uiTokens.action.primary};
    color: ${uiTokens.action.onPrimary};
    transform: translateY(-2px);
    cursor: pointer;
    font-size: ${uiTokens.type.body};
    font-weight: 500;
    box-shadow: none;
  }

  ${partSelector(chatComposerContract, "submit")} svg {
    width: 18px;
    height: 18px;
  }

  ${partSelector(chatComposerContract, "trailing")} + ${partSelector(chatComposerContract, "submit")} {
    margin-left: 0;
  }

  ${partSelector(chatComposerContract, "actions")} > ${partSelector(iconButtonContract, "root")} {
    width: 28px;
    height: 28px;
    min-width: 28px;
    min-height: 28px;
    border-radius: 50%;
    corner-shape: round;
    background: ${uiTokens.surface.fill};
    color: ${uiTokens.ink.primary};
  }

  ${partSelector(chatComposerContract, "submit")}:hover:not(:disabled) {
    background: color-mix(in srgb, ${uiTokens.action.primary} 86%, white);
  }

  ${partSelector(chatComposerContract, "submit")}:disabled {
    cursor: not-allowed;
    border-color: transparent;
    opacity: 0.4;
    box-shadow: none;
  }

  @media (max-width: 680px) {
    ${partSelector(chatComposerContract, "surface")} {
      grid-template-columns: minmax(0, 1fr);
      padding: 8px 0 0;
    }

    ${partSelector(chatComposerContract, "hint")} {
      font-size: ${uiTokens.type.caption};
    }
  }

  ${partSelector(chatComposerContract, "submit")}:active:not(:disabled) {
    box-shadow: inset 0 1px 3px rgb(0 0 0 / 20%);
    transition-duration: 40ms;
  }

  /* A compact writing surface grows with the draft, not with an empty tools row.
  The inline row keeps the one-line text and the send action on the optical
  center: equal block padding around the 24px line, a symmetric action row, and
  no base-layout nudge on the submit button. */
  ${partSelector(chatComposerContract, "root")}[${chatComposerOptions.attribute("layout")}="inline"] > ${partSelector(chatComposerContract, "surface")} {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    padding: ${uiTokens.control.inset} ${uiTokens.space.section};
  }

  ${partSelector(chatComposerContract, "root")}[${chatComposerOptions.attribute("layout")}="inline"] ${partSelector(chatComposerContract, "input")} {
    grid-column: 1;
    grid-row: 1;
    min-height: 40px;
    padding-block: 8px;
  }

  ${partSelector(chatComposerContract, "root")}[${chatComposerOptions.attribute("layout")}="inline"] ${partSelector(chatComposerContract, "actions")} {
    grid-column: 2;
    grid-row: 1;
    flex-wrap: nowrap;
    padding-block: 4px;
  }

  ${partSelector(chatComposerContract, "root")}[${chatComposerOptions.attribute("layout")}="inline"] ${partSelector(chatComposerContract, "submit")} {
    transform: none;
  }

  ${partSelector(chatComposerContract, "root")}[${chatComposerOptions.attribute("layout")}="inline"] ${partSelector(chatComposerContract, "attachments")} {
    grid-column: 1 / -1;
  }

  ${partSelector(chatComposerContract, "root")}[${chatComposerOptions.attribute("layout")}="inline"] > ${partSelector(chatComposerContract, "surface")}:has(> ${partSelector(chatComposerContract, "attachments")}:not(:empty)):not(
  :has(> ${partSelector(chatComposerContract, "attachments")} > [hidden]:only-child)
  )
  :is(${partSelector(chatComposerContract, "input")}, ${partSelector(chatComposerContract, "actions")}) {
    grid-row: 2;
  }

  @media (pointer: coarse) {
    ${partSelector(chatComposerContract, "input")} {
      font-size: max(16px, ${uiTokens.type.body});
    }
  }

  @media (prefers-reduced-motion: reduce) {
    ${partSelector(chatComposerContract, "surface")},
    ${partSelector(chatComposerContract, "input")},
    ${partSelector(chatComposerContract, "submit")} {
      transition: none;
    }
  }

  ${partSelector(chatComposerContract, "root")}[${chatComposerOptions.attribute("layout")}="stacked"] > ${partSelector(chatComposerContract, "surface")} {
    position: relative;
    gap: 4px;
    padding: 12px 12px 10px;
    border: ${uiTokens.line.width} solid ${uiTokens.line.edge};
  }

  ${partSelector(chatComposerContract, "root")}[${chatComposerOptions.attribute("layout")}="stacked"] ${partSelector(chatComposerContract, "input")} {
    padding: 2px 6px 6px;
  }

  ${partSelector(chatComposerContract, "root")}[${chatComposerOptions.attribute("layout")}="stacked"] ${partSelector(chatComposerContract, "actions")} {
    gap: 6px;
    padding: 0;
    min-height: 34px;
  }

  ${partSelector(chatComposerContract, "root")}[${chatComposerOptions.attribute("layout")}="stacked"] ${partSelector(chatComposerContract, "actions")} > ${partSelector(iconButtonContract, "root")} {
    width: 32px;
    height: 32px;
    min-width: 32px;
    min-height: 32px;
    border: ${uiTokens.line.width} solid ${uiTokens.line.edge};
    border-radius: ${uiTokens.radius.lg};
    background: transparent;
    color: ${uiTokens.ink.secondary};
  }

  ${partSelector(chatComposerContract, "root")}[${chatComposerOptions.attribute("layout")}="stacked"] ${partSelector(chatComposerContract, "actions")} > ${partSelector(iconButtonContract, "root")}:hover:not(:disabled) {
    background: ${uiTokens.state.hover};
    color: ${uiTokens.ink.primary};
  }

  /* The model and its supporting choices stay beside send, not stranded after attach. */
  ${partSelector(chatComposerContract, "root")}[${chatComposerOptions.attribute("layout")}="stacked"] ${partSelector(chatComposerContract, "actions")} > ${partSelector(chatComposerContract, "trailing")} {
    margin-left: auto;
    min-width: 0;
    max-width: min(360px, 70%);
  }

  ${partSelector(chatComposerContract, "root")}[${chatComposerOptions.attribute("layout")}="stacked"] ${partSelector(chatComposerContract, "actions")} > ${partSelector(chatComposerContract, "submit")} {
    margin-left: 0;
  }

  ${partSelector(chatComposerContract, "root")}[${chatComposerOptions.attribute("layout")}="stacked"] ${partSelector(chatComposerContract, "actions")}:not(:has(> ${partSelector(chatComposerContract, "trailing")})) > ${partSelector(chatComposerContract, "submit")} {
    margin-left: auto;
  }

  ${partSelector(chatComposerContract, "root")}[${chatComposerOptions.attribute("layout")}="stacked"] ${partSelector(chatComposerContract, "submit")} {
    width: 34px;
    height: 34px;
    min-width: 34px;
    min-height: 34px;
    border-radius: 11px;
    background: ${uiTokens.action.primary};
    color: ${uiTokens.action.onPrimary};
    transform: none;
  }

  ${partSelector(chatComposerContract, "root")}[${chatComposerOptions.attribute("layout")}="stacked"] ${partSelector(chatComposerContract, "submit")}:hover:not(:disabled) {
    background: ${uiTokens.action.primaryHover};
  }

  ${partSelector(chatComposerContract, "root")}[${chatComposerOptions.attribute("layout")}="stacked"] ${partSelector(chatComposerContract, "submit")}:disabled {
    opacity: 0.35;
  }

  /* Supporting text is outside the writing surface and never joins its action grid. */
  ${partSelector(chatComposerContract, "root")}[${chatComposerOptions.attribute("layout")}="stacked"] > ${partSelector(chatComposerContract, "hint")},
  ${partSelector(chatComposerContract, "root")}[${chatComposerOptions.attribute("layout")}="inline"]:focus-within > ${partSelector(chatComposerContract, "hint")} {
    position: static;
    min-width: 0;
    width: auto;
    height: auto;
    padding-inline: 6px;
    overflow: visible;
    clip-path: none;
    white-space: normal;
    overflow-wrap: anywhere;
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.caption};
    line-height: 18px;
    pointer-events: auto;
  }

  /* A phone writes on one row: attach, text, send. The model choice keeps a quiet row beneath. */
  @media (max-width: 768px) {
    ${partSelector(chatComposerContract, "root")}[${chatComposerOptions.attribute("layout")}="stacked"] > ${partSelector(chatComposerContract, "surface")} {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: end;
      gap: 0 8px;
      padding: 6px;
      border-radius: 24px;
      box-shadow: 0 2px 12px rgb(0 0 0 / 4%);
    }

    ${partSelector(chatComposerContract, "root")}[${chatComposerOptions.attribute("layout")}="stacked"] ${partSelector(chatComposerContract, "attachments")} {
      grid-column: 1 / -1;
      grid-row: 1;
    }

    ${partSelector(chatComposerContract, "root")}[${chatComposerOptions.attribute("layout")}="stacked"] ${partSelector(chatComposerContract, "input")} {
      grid-column: 2;
      grid-row: 2;
      min-height: 36px;
      padding: 6px 4px;
      /* iOS zooms into a text control below 16px. */
      font-size: 16px;
      line-height: 24px;
    }

    ${partSelector(chatComposerContract, "root")}[${chatComposerOptions.attribute("layout")}="stacked"] ${partSelector(chatComposerContract, "actions")} {
      display: contents;
    }

    ${partSelector(chatComposerContract, "root")}[${chatComposerOptions.attribute("layout")}="stacked"] ${partSelector(chatComposerContract, "actions")} > ${partSelector(iconButtonContract, "root")} {
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

    ${partSelector(chatComposerContract, "root")}[${chatComposerOptions.attribute("layout")}="stacked"] ${partSelector(chatComposerContract, "actions")} > ${partSelector(chatComposerContract, "trailing")} {
      grid-column: 2 / -1;
      grid-row: 3;
      margin-left: 0;
      max-width: none;
      padding-top: 2px;
      justify-content: flex-start;
    }

    ${partSelector(chatComposerContract, "root")}[${chatComposerOptions.attribute("layout")}="stacked"] ${partSelector(chatComposerContract, "actions")} > ${partSelector(chatComposerContract, "submit")} {
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
  ${partSelector(chatComposerContract, "root")}[${chatComposerOptions.attribute("surface")}="none"] > ${partSelector(chatComposerContract, "surface")} {
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
  }
`;
