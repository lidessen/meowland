import { css, partSelector } from "meowcss/meowjsx";
import { iconRailContract } from "../../components/icon-rail";
import { railItemContract } from "../../components/rail-item";
import { railSectionContract } from "../../components/rail-section";
import { uiTokens } from "../tokens";
import { accentTokens, layerTokens, lineTokens, statusTokens } from "../palette";

const rail = (part: (typeof iconRailContract.parts)[number]) =>
  partSelector(iconRailContract, part);
const item = (part: (typeof railItemContract.parts)[number]) =>
  partSelector(railItemContract, part);
const section = (part: (typeof railSectionContract.parts)[number]) =>
  partSelector(railSectionContract, part);

// Expanded while hovered, while keyboard focus is inside, or when the host pins it.
const open = `${rail("root")}:is(:hover, :has(:focus-visible)) ${rail("drawer")}, ${rail("drawer")}[data-expanded="true"]`;
const openWithin = (selector: string) =>
  `${rail("root")}:is(:hover, :has(:focus-visible)) ${rail("drawer")} ${selector}, ${rail("drawer")}[data-expanded="true"] ${selector}`;

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
    border-right: ${lineTokens.width} solid ${uiTokens.borderSoft};
    background: ${uiTokens.sidebarSurface};
    font: ${uiTokens.fontBody}/${uiTokens.leading} ${uiTokens.font};
    transition:
      width ${uiTokens.durationSettle} ${uiTokens.ease},
      box-shadow ${uiTokens.durationSettle} ${uiTokens.ease};
  }
  ${open} {
    width: 256px;
    box-shadow: 16px 0 40px rgb(0 0 0 / 6%);
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
    transition: opacity ${uiTokens.durationResponse} ${uiTokens.ease};
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
    border-radius: 12px;
    background: transparent;
    color: ${uiTokens.mutedForeground};
    font: inherit;
    text-align: left;
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
    transition:
      background-color ${uiTokens.durationResponse} ${uiTokens.ease},
      color ${uiTokens.durationResponse} ${uiTokens.ease};
  }
  ${item("root")}:hover {
    background: ${uiTokens.hover};
    color: ${uiTokens.foreground};
  }
  ${item("root")}:focus-visible {
    outline: 2px solid ${uiTokens.focus};
    outline-offset: -2px;
  }
  ${item("root")}[aria-current="page"],
  ${section("root")}:has(${section("items")} ${item("root")}[aria-current="page"]) ${section("shortcut")} ${item("root")} {
    background: ${accentTokens.selected};
    color: ${accentTokens.base};
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
    border-radius: 3px;
    background: ${accentTokens.base};
  }
  ${openWithin(`${item("root")}[aria-current="page"]::before`)} {
    display: none;
  }
  ${openWithin(`${item("root")}[aria-current="page"]`)} {
    color: ${uiTokens.foreground};
    font-weight: 500;
  }
  ${openWithin(`${item("root")}[aria-current="page"] ${item("icon")}`)} {
    color: ${accentTokens.base};
  }
  ${item("icon")} {
    display: grid;
    place-items: center;
    flex: 0 0 18px;
    width: 18px;
    height: 18px;
  }
  ${item("icon")} svg {
    width: 18px;
    height: 18px;
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
    background: ${statusTokens.warning};
    box-shadow: 0 0 0 2px ${uiTokens.sidebarSurface};
  }
  ${item("root")}[data-dot] ${item("dot")},
  ${section("root")}:has(${section("items")} ${item("root")}[data-dot]) ${section("shortcut")} ${item("dot")} {
    display: block;
  }
  ${item("root")}[data-dot="accent"] ${item("dot")} {
    background: ${accentTokens.base};
  }
  ${section("root")}:has(${section("items")} ${item("root")}[data-dot="warning"]) ${section("shortcut")} ${item("dot")} {
    background: ${statusTokens.warning};
  }
  ${openWithin(item("dot").toString())} {
    display: none;
  }
  ${item("label")} {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    opacity: 0;
    transition: opacity ${uiTokens.durationResponse} ${uiTokens.ease};
  }
  ${item("meta")} {
    margin-left: auto;
    color: ${layerTokens.faint};
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    opacity: 0;
    transition: opacity ${uiTokens.durationResponse} ${uiTokens.ease};
  }
  ${item("root")}[data-meta-tone="accent"] ${item("meta")} {
    color: ${accentTokens.base};
    font-size: 11px;
    font-weight: 600;
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
    color: ${layerTokens.faint};
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
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
