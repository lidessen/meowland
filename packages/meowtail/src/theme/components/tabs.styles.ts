import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import type { Tabs } from "../../components/tabs";
import { tabsCount, tabsIndex } from "../../components/tabs.options";
import { ui } from "../utilities";
const tabsPartRefs = parts<typeof Tabs>("tabs");
export const tabsStyles = css`
  ${tabsPartRefs.root} {
    min-width: 0;
    font-family: ${uiTokens.type.sans};
    font-size: ${uiTokens.type.body};
  }
  ${tabsPartRefs.list} {
    position: relative;
    display: grid;
    grid-template-columns: repeat(${tabsCount}, minmax(0, 1fr));
    /* The track hugs its tabs (each as wide as the widest label) like SegmentedControl;
       a narrow container still shrinks every column equally. */
    width: fit-content;
    max-width: 100%;
    /* Same track as SegmentedControl: one control height, concentric radii. */
    padding: ${uiTokens.control.trackInset};
    border-radius: calc(${uiTokens.radius.md} + ${uiTokens.control.trackInset});
    background: ${uiTokens.surface.fill};
  }
  ${tabsPartRefs.indicator} {
    position: absolute;
    inset-block: ${uiTokens.control.trackInset};
    inset-inline-start: ${uiTokens.control.trackInset};
    width: calc((100% - 2 * ${uiTokens.control.trackInset}) / ${tabsCount});
    box-sizing: border-box;
    border-radius: ${uiTokens.radius.md};
    background: ${uiTokens.control.thumb};
    box-shadow: ${uiTokens.shadow.thumb};
    transform: translateX(calc(${tabsIndex} * 100%));
    transition: transform ${uiTokens.motion.settle} ${uiTokens.motion.ease};
    pointer-events: none;
  }
  ${tabsPartRefs.indicator}:dir(rtl) {
    transform: translateX(calc(${tabsIndex} * -100%));
  }
  ${tabsPartRefs.indicator}[hidden] {
    display: none;
  }
  ${tabsPartRefs.tab} {
    position: relative;
    min-width: 0;
    box-sizing: border-box;
    min-height: calc(${uiTokens.control.regular} - 2 * ${uiTokens.control.trackInset});
    padding: 0 12px;
    border: 0;
    border-radius: ${uiTokens.radius.md};
    background: transparent;
    color: ${uiTokens.ink.secondary};
    font: inherit;
    font-weight: ${uiTokens.type.weight.medium};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    transition: color ${uiTokens.motion.settle} ${uiTokens.motion.ease};
  }
  ${tabsPartRefs.tab}[aria-selected="true"] {
    color: ${uiTokens.ink.primary};
  }
  ${tabsPartRefs.tab}:hover:not(:disabled) {
    color: ${uiTokens.ink.primary};
  }
  ${tabsPartRefs.tab}:disabled {
    color: ${uiTokens.ink.tertiary};
    cursor: default;
  }
  ${tabsPartRefs.tab}:focus-visible,
  ${tabsPartRefs.panel}:focus-visible {
    ${ui.focus.inset}
  }
  ${tabsPartRefs.tab}:focus-visible {
    outline-offset: -2px;
  }
  ${tabsPartRefs.panel} {
    padding-block: ${uiTokens.space.section};
    overflow-wrap: anywhere;
  }
  ${tabsPartRefs.panel}[hidden] {
    display: none;
  }
  @media (pointer: coarse) {
    ${tabsPartRefs.tab} {
      min-height: 44px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    :where(${tabsPartRefs.indicator}, ${tabsPartRefs.tab}) {
      transition: none;
    }
  }
`;
