import { css, parts } from "meowcss/meowjsx";

import { uiTokens } from "../tokens";
import type { IconRail } from "../../components/icon-rail";
import type { RailItem } from "../../components/rail-item";
import type { RailSection } from "../../components/rail-section";
import { ui } from "../utilities";
import { selectorForPart } from "../selectors";

const iconRailPartRefs = parts<typeof IconRail>("icon-rail");
const railItemPartRefs = parts<typeof RailItem>("rail-item");
const railSectionPartRefs = parts<typeof RailSection>("rail-section");
const rail = (part: keyof typeof iconRailPartRefs) => selectorForPart(iconRailPartRefs[part]);
const item = (part: keyof typeof railItemPartRefs) => selectorForPart(railItemPartRefs[part]);
const section = (part: keyof typeof railSectionPartRefs) =>
  selectorForPart(railSectionPartRefs[part]);
// Expanded while hovered, while keyboard focus is inside, or when the host pins it.
const open = `${rail("root")}:is(:hover, :has(:focus-visible)) ${rail("drawer")}, ${rail("drawer")}[data-expanded="true"]`;
const openWithin = (nestedSelector: string) =>
  `${rail("root")}:is(:hover, :has(:focus-visible)) ${rail("drawer")} ${nestedSelector}, ${rail("drawer")}[data-expanded="true"] ${nestedSelector}`;
export const iconRailStyles = css`
  ${rail("root")} {
    position: relative;
    z-index: 5;
    flex: 0 0 56px;
    width: 56px;
    height: 100%;
    min-height: 0;
  }
  ${rail("drawer")} {
    position: absolute;
    inset: 0 auto 0 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
    box-sizing: border-box;
    width: 56px;
    padding: 10px 8px 12px;
    overflow: hidden;
    border-right: ${uiTokens.line.width} solid ${uiTokens.line.divider};
    background: ${uiTokens.surface.canvas};
    font: ${uiTokens.type.body} / ${uiTokens.type.leading} ${uiTokens.type.sans};
    transition:
      width ${uiTokens.motion.settle} ${uiTokens.motion.ease},
      box-shadow ${uiTokens.motion.settle} ${uiTokens.motion.ease};
  }
  ${open} {
    width: 256px;
    box-shadow: ${uiTokens.shadow.sheet};
    overflow-y: auto;
  }
  ${rail("brand")} {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    min-height: 36px;
    margin-bottom: 10px;
    padding-inline: 2px;
    white-space: nowrap;
  }
  ${rail("items")} {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    gap: 2px;
    min-height: 0;
  }
  ${rail("footer")} {
    display: grid;
    gap: 2px;
    margin-top: auto;
    flex: 0 0 auto;
  }
  /* Brand text and other reveal-only content stay out of the collapsed column. */
  ${rail("brand")} [data-rail-reveal] {
    opacity: 0;
    transition: opacity ${uiTokens.motion.response} ${uiTokens.motion.ease};
  }
  ${openWithin(`${rail("brand")} [data-rail-reveal]`)} {
    opacity: 1;
  }

  ${item("root")} {
    position: relative;
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    gap: 10px;
    box-sizing: border-box;
    height: 40px;
    padding: 0 11px;
    border: 0;
    border-radius: ${uiTokens.radius.lg};
    background: transparent;
    color: ${uiTokens.ink.secondary};
    font: inherit;
    text-align: left;
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
    transition:
      background-color ${uiTokens.motion.response} ${uiTokens.motion.ease},
      color ${uiTokens.motion.response} ${uiTokens.motion.ease};
  }
  ${item("root")}:hover {
    background: ${uiTokens.state.hover};
    color: ${uiTokens.ink.primary};
  }
  ${item("root")}:focus-visible {
    ${ui.focus.inset}
  }
  ${item("root")}[aria-current="page"],
  ${section("root")}:has(${section("items")} ${item("root")}[aria-current="page"]) ${section("shortcut")} ${item("root")} {
    background: ${uiTokens.accent.selected};
    color: ${uiTokens.accent.base};
  }
  /* The accent bar marks the current location while only icons are visible. */
  ${item("root")}[aria-current="page"]::before,
  ${section("root")}:has(${section("items")} ${item("root")}[aria-current="page"]) ${section("shortcut")} ${item("root")}::before {
    content: "";
    position: absolute;
    left: -8px;
    top: 12px;
    width: 3px;
    height: 16px;
    border-radius: ${uiTokens.radius.xs};
    background: ${uiTokens.accent.base};
  }
  ${openWithin(`${item("root")}[aria-current="page"]::before`)} {
    display: none;
  }
  ${openWithin(`${item("root")}[aria-current="page"]`)} {
    color: ${uiTokens.ink.primary};
    font-weight: ${uiTokens.type.weight.medium};
  }
  ${openWithin(`${item("root")}[aria-current="page"] ${item("icon")}`)} {
    color: ${uiTokens.accent.base};
  }
  ${item("icon")} {
    display: grid;
    place-items: center;
    flex: 0 0 18px;
    width: ${uiTokens.icon.large};
    height: ${uiTokens.icon.large};
  }
  ${item("icon")} svg {
    width: ${uiTokens.icon.large};
    height: ${uiTokens.icon.large};
    stroke-width: 1.75;
  }
  ${item("dot")} {
    position: absolute;
    top: 9px;
    right: 9px;
    display: none;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    corner-shape: round;
    background: ${uiTokens.status.warning};
    box-shadow: 0 0 0 2px ${uiTokens.surface.knockout};
  }
  ${item("root")}[data-dot] ${item("dot")},
  ${section("root")}:has(${section("items")} ${item("root")}[data-dot]) ${section("shortcut")} ${item("dot")} {
    display: block;
  }
  ${item("root")}[data-dot="accent"] ${item("dot")} {
    background: ${uiTokens.accent.base};
  }
  ${section("root")}:has(${section("items")} ${item("root")}[data-dot="warning"]) ${section("shortcut")} ${item("dot")} {
    background: ${uiTokens.status.warning};
  }
  ${openWithin(item("dot").toString())} {
    display: none;
  }
  ${item("label")} {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    opacity: 0;
    transition: opacity ${uiTokens.motion.response} ${uiTokens.motion.ease};
  }
  ${item("meta")} {
    margin-left: auto;
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.caption};
    font-variant-numeric: tabular-nums;
    opacity: 0;
    transition: opacity ${uiTokens.motion.response} ${uiTokens.motion.ease};
  }
  ${item("root")}[data-meta-tone="accent"] ${item("meta")} {
    color: ${uiTokens.accent.base};
    font-size: ${uiTokens.type.micro};
    font-weight: ${uiTokens.type.weight.semibold};
  }
  ${openWithin(item("label").toString())},
  ${openWithin(item("meta").toString())} {
    opacity: 1;
  }

  ${section("root")},
  ${section("items")},
  ${section("shortcut")} {
    grid-template-columns: minmax(0, 1fr);
  }
  ${section("root")} {
    display: grid;
    gap: 2px;
  }
  ${section("heading")} {
    display: none;
    margin: 14px 10px 6px;
    color: ${uiTokens.ink.tertiary};
    font-size: ${uiTokens.type.micro};
    font-weight: ${uiTokens.type.weight.medium};
    letter-spacing: ${uiTokens.type.trackingCaps};
    text-transform: uppercase;
  }
  ${section("items")} {
    display: none;
    gap: 2px;
  }
  ${section("shortcut")} {
    display: grid;
  }
  ${openWithin(section("heading").toString())} {
    display: block;
  }
  ${openWithin(section("items").toString())} {
    display: grid;
  }
  ${openWithin(section("shortcut").toString())} {
    display: none;
  }
  @media (prefers-reduced-motion: reduce) {
    ${rail("drawer")},
    ${item("root")},
    ${item("label")},
    ${item("meta")} {
      transition: none;
    }
  }
`;
