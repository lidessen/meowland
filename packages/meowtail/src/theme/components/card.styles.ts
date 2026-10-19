import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { cardContract, cardOptions } from "../../components/card";
import { cardActionContract } from "../../components/card-action";
import { cardContentContract } from "../../components/card-content";
import { cardDescriptionContract } from "../../components/card-description";
import { cardFooterContract } from "../../components/card-footer";
import { cardHeaderContract } from "../../components/card-header";
import { cardTitleContract } from "../../components/card-title";

export const cardStyles = css`
${partSelector(cardContract, "root")} {
  box-sizing: border-box;
  min-width: 0;
  padding: ${uiTokens.spacePanel};
  border: 0.5px solid ${uiTokens.border};
  border-radius: ${uiTokens.panelRadius};
  background: ${uiTokens.surface};
  --meowui-focus-halo: ${uiTokens.surface};
  color: ${uiTokens.foreground};
  font: ${uiTokens.fontBody}/${uiTokens.leading} ${uiTokens.font};
}

/* Embedded groups share their parent's surface; callers choose the relationship. */
button${partSelector(cardContract, "root")}:focus-visible {
  outline: 2px solid ${uiTokens.focus};
  outline-offset: 2px;
}

:where(${partSelector(cardContract, "root")}:is([${cardOptions.attribute("variant")}="embedded"], [${cardOptions.attribute("variant")}="auto"]:not([data-card-depth="0"]))) {
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  --meowui-focus-halo: inherit;
  box-shadow: none;
}
${partSelector(cardHeaderContract, "root")} {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${uiTokens.spaceGroup} ${uiTokens.spaceSection};
  align-items: start;
  min-width: 0;
}
:where(${partSelector(cardHeaderContract, "root")}:has(> ${partSelector(cardActionContract, "root")})) {
  /* Tracks collapse at the card's own width without size containment affecting intrinsic cards. */
  grid-template-columns: repeat(auto-fit, minmax(min(100%, ${uiTokens.gridColumnNormal}), max-content));
  grid-auto-flow: row dense;
  justify-content: space-between;
}
:where(${partSelector(cardHeaderContract, "root")} > ${partSelector(cardTitleContract, "root")}, ${partSelector(cardHeaderContract, "root")} > ${partSelector(cardDescriptionContract, "root")}) {
  grid-column: 1;
}
${partSelector(cardTitleContract, "root")} {
  margin: 0;
  color: ${uiTokens.foreground};
  font-size: ${uiTokens.fontTitle};
  font-weight: 600;
  line-height: 1.4;
  overflow-wrap: anywhere;
}
${partSelector(cardDescriptionContract, "root")} {
  margin: 0;
  color: ${uiTokens.mutedForeground};
  font-size: ${uiTokens.fontBody};
  line-height: ${uiTokens.leading};
  overflow-wrap: anywhere;
}
${partSelector(cardActionContract, "root")} {
  display: flex;
  flex-wrap: wrap;
  gap: ${uiTokens.spaceGroup};
  align-items: center;
}
:where(${partSelector(cardHeaderContract, "root")} > ${partSelector(cardActionContract, "root")}) {
  grid-column: auto;
  grid-row: span 2;
  order: 1;
  min-width: 0;
  max-width: 100%;
  justify-self: end;
}
${partSelector(cardContentContract, "root")} {
  display: grid;
  gap: ${uiTokens.spaceSection};
  min-width: 0;
}
:where(${partSelector(cardContentContract, "root")} > p) {
  margin: 0;
  overflow-wrap: anywhere;
}
:where(
  ${partSelector(cardContract, "root")} > ${partSelector(cardContentContract, "root")}:not(:first-child),
  ${partSelector(cardContract, "root")} > ${partSelector(cardFooterContract, "root")}:not(:first-child)
) {
  margin-top: ${uiTokens.spaceSection};
}
${partSelector(cardFooterContract, "root")} {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${uiTokens.spaceGroup};
}
:where(${partSelector(cardContract, "root")}:is([${cardOptions.attribute("variant")}="embedded"], [${cardOptions.attribute("variant")}="auto"]:not([data-card-depth="0"])) > ${partSelector(cardHeaderContract, "root")} > ${partSelector(cardTitleContract, "root")}) {
  font-size: ${uiTokens.fontBody};
}
:where(
  ${partSelector(cardContract, "root")}:is([${cardOptions.attribute("variant")}="embedded"], [${cardOptions.attribute("variant")}="auto"]:not([data-card-depth="0"])) > ${partSelector(cardContentContract, "root")}:not(:first-child),
  ${partSelector(cardContract, "root")}:is([${cardOptions.attribute("variant")}="embedded"], [${cardOptions.attribute("variant")}="auto"]:not([data-card-depth="0"])) > ${partSelector(cardFooterContract, "root")}:not(:first-child)
) {
  margin-top: ${uiTokens.spaceGroup};
}
:where(${partSelector(cardContentContract, "root")} > ${partSelector(cardContract, "root")}:is([${cardOptions.attribute("variant")}="embedded"], [${cardOptions.attribute("variant")}="auto"]:not([data-card-depth="0"])) + ${partSelector(cardContract, "root")}:is([${cardOptions.attribute("variant")}="embedded"], [${cardOptions.attribute("variant")}="auto"]:not([data-card-depth="0"]))) {
  padding-top: ${uiTokens.spaceSection};
  border-top: 1px solid ${uiTokens.border};
}
`;
