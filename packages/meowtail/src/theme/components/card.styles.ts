import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { focusRing, surface } from "../recipes";
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
  padding: ${uiTokens.space.panel};
  /* The in-flow surface every bordered container shares: raised layer on the edge hairline. */
  ${surface("raised")}
  font: ${uiTokens.type.body} / ${uiTokens.type.leading} ${uiTokens.type.sans};
}

/* Embedded groups share their parent's surface; callers choose the relationship. */
button${partSelector(cardContract, "root")}:focus-visible {
  ${focusRing()}
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
  gap: ${uiTokens.space.group} ${uiTokens.space.section};
  align-items: start;
  min-width: 0;
}
:where(${partSelector(cardHeaderContract, "root")}:has(> ${partSelector(cardActionContract, "root")})) {
  /* Tracks collapse at the card's own width without size containment affecting intrinsic cards. */
  grid-template-columns: repeat(auto-fit, minmax(min(100%, ${uiTokens.layout.gridNormal}), max-content));
  grid-auto-flow: row dense;
  justify-content: space-between;
}
:where(${partSelector(cardHeaderContract, "root")} > ${partSelector(cardTitleContract, "root")}, ${partSelector(cardHeaderContract, "root")} > ${partSelector(cardDescriptionContract, "root")}) {
  grid-column: 1;
}
${partSelector(cardTitleContract, "root")} {
  margin: 0;
  color: ${uiTokens.ink.primary};
  font-size: ${uiTokens.type.title};
  font-weight: ${uiTokens.type.weight.semibold};
  line-height: ${uiTokens.type.line.title};
  letter-spacing: ${uiTokens.type.trackingTight};
  overflow-wrap: anywhere;
}
${partSelector(cardDescriptionContract, "root")} {
  margin: 0;
  color: ${uiTokens.ink.secondary};
  font-size: ${uiTokens.type.body};
  line-height: ${uiTokens.type.leading};
  overflow-wrap: anywhere;
}
${partSelector(cardActionContract, "root")} {
  display: flex;
  flex-wrap: wrap;
  gap: ${uiTokens.space.group};
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
  gap: ${uiTokens.space.section};
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
  margin-top: ${uiTokens.space.section};
}
${partSelector(cardFooterContract, "root")} {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${uiTokens.space.group};
}
:where(${partSelector(cardContract, "root")}:is([${cardOptions.attribute("variant")}="embedded"], [${cardOptions.attribute("variant")}="auto"]:not([data-card-depth="0"])) > ${partSelector(cardHeaderContract, "root")} > ${partSelector(cardTitleContract, "root")}) {
  font-size: ${uiTokens.type.body};
}
:where(
  ${partSelector(cardContract, "root")}:is([${cardOptions.attribute("variant")}="embedded"], [${cardOptions.attribute("variant")}="auto"]:not([data-card-depth="0"])) > ${partSelector(cardContentContract, "root")}:not(:first-child),
  ${partSelector(cardContract, "root")}:is([${cardOptions.attribute("variant")}="embedded"], [${cardOptions.attribute("variant")}="auto"]:not([data-card-depth="0"])) > ${partSelector(cardFooterContract, "root")}:not(:first-child)
) {
  margin-top: ${uiTokens.space.group};
}
:where(${partSelector(cardContentContract, "root")} > ${partSelector(cardContract, "root")}:is([${cardOptions.attribute("variant")}="embedded"], [${cardOptions.attribute("variant")}="auto"]:not([data-card-depth="0"])) + ${partSelector(cardContract, "root")}:is([${cardOptions.attribute("variant")}="embedded"], [${cardOptions.attribute("variant")}="auto"]:not([data-card-depth="0"]))) {
  padding-top: ${uiTokens.space.section};
  border-top: ${uiTokens.line.width} solid ${uiTokens.line.divider};
}
`;
