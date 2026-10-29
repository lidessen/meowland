import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import type { CommandPalette } from "../../components/command-palette";
const palette = parts<typeof CommandPalette>("command-palette");
export const commandPaletteStyles = css`
  ${palette.root} {
    display: contents;
  }
  /* An overlay surface like Dialog, wider for result rows and placed in the upper third. */
  ${palette.dialog} {
    box-sizing: border-box;
    width: min(560px, calc(100vw - 32px));
    max-height: min(480px, calc(100dvh - 32px));
    margin: min(15vh, 120px) auto auto;
    padding: 0;
    border: 0;
    border-radius: ${uiTokens.radius.xxl};
    background: ${uiTokens.surface.overlay};
    box-shadow: ${uiTokens.shadow.float};
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body} / ${uiTokens.type.line.bodyCompact} ${uiTokens.type.sans};
    overflow: hidden;
  }
  ${palette.dialog}[open] {
    display: flex;
    flex-direction: column;
    animation: ui-command-palette-enter ${uiTokens.motion.draw} ${uiTokens.motion.enter};
  }
  ${palette.dialog}::backdrop {
    background: ${uiTokens.surface.scrim};
  }
  @keyframes ui-command-palette-enter {
    from {
      opacity: 0;
      transform: translateY(-4px) scale(0.98);
    }
  }
  ${palette.search} {
    display: flex;
    align-items: center;
    gap: ${uiTokens.space.group};
    flex: none;
    padding: 0 ${uiTokens.space.section};
    border-bottom: ${uiTokens.line.width} solid ${uiTokens.line.divider};
  }
  ${palette.searchIcon} {
    display: inline-flex;
    color: ${uiTokens.ink.tertiary};
  }
  ${palette.searchIcon} svg {
    width: ${uiTokens.icon.size};
    height: ${uiTokens.icon.size};
  }
  ${palette.input} {
    flex: 1;
    min-width: 0;
    min-height: ${uiTokens.control.large};
    padding: 0;
    border: 0;
    outline: none;
    background: transparent;
    color: inherit;
    font: ${uiTokens.type.body} / ${uiTokens.type.line.body} ${uiTokens.type.sans};
  }
  ${palette.input}::placeholder {
    color: ${uiTokens.ink.secondary};
  }
  ${palette.list} {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 6px;
  }
  ${palette.group}[hidden],
  ${palette.option}[hidden],
  ${palette.empty}[hidden] {
    display: none;
  }
  ${palette.group} + ${palette.group}:not([hidden]) {
    margin-top: 4px;
  }
  ${palette.heading} {
    padding: 8px 10px 4px;
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.micro};
    font-weight: ${uiTokens.type.weight.medium};
    line-height: ${uiTokens.type.line.micro};
    letter-spacing: ${uiTokens.type.trackingCaps};
    text-transform: uppercase;
  }
  ${palette.option} {
    display: flex;
    align-items: center;
    gap: ${uiTokens.space.group};
    min-height: 36px;
    padding: 6px 10px;
    border-radius: ${uiTokens.radius.md};
    cursor: pointer;
  }
  ${palette.option}[aria-selected="true"] {
    background: ${uiTokens.state.hover};
  }
  ${palette.option}[aria-disabled="true"] {
    opacity: 0.4;
    cursor: not-allowed;
  }
  ${palette.icon} {
    display: inline-flex;
    flex: none;
    color: ${uiTokens.ink.secondary};
  }
  ${palette.icon} svg {
    width: ${uiTokens.icon.size};
    height: ${uiTokens.icon.size};
  }
  ${palette.label} {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  ${palette.empty} {
    margin: 0;
    padding: ${uiTokens.space.panel} ${uiTokens.space.section};
    color: ${uiTokens.ink.secondary};
    text-align: center;
  }
  /* Announced, not shown: the rows already show the count. */
  ${palette.count} {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  @media (prefers-reduced-motion: reduce) {
    ${palette.dialog}[open] {
      animation: none;
    }
  }
`;
