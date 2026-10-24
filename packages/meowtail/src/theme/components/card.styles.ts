import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import type { Card } from "../../components/card";
import type { CardAction } from "../../components/card-action";
import type { CardContent } from "../../components/card-content";
import type { CardDescription } from "../../components/card-description";
import type { CardFooter } from "../../components/card-footer";
import type { CardHeader } from "../../components/card-header";
import type { CardTitle } from "../../components/card-title";
import { cardOptions } from "../../components/card.options";
import { ui } from "../utilities";
const cardActionPartRefs = parts<typeof CardAction>("card-action");
const cardContentPartRefs = parts<typeof CardContent>("card-content");
const cardPartRefs = parts<typeof Card>("card");
const cardDescriptionPartRefs = parts<typeof CardDescription>("card-description");
const cardFooterPartRefs = parts<typeof CardFooter>("card-footer");
const cardHeaderPartRefs = parts<typeof CardHeader>("card-header");
const cardTitlePartRefs = parts<typeof CardTitle>("card-title");
export const cardStyles = css`
${cardPartRefs.root} {
  box-sizing: border-box;
  min-width: 0;
  padding: ${uiTokens.space.panel};
  /* The in-flow surface every bordered container shares: raised layer on the edge hairline. */
  ${ui.surface.raised}
  font: ${uiTokens.type.body} / ${uiTokens.type.leading} ${uiTokens.type.sans};
}

/* Embedded groups share their parent's surface; callers choose the relationship. */
button${cardPartRefs.root}:focus-visible {
  ${ui.focus.ring}
}

:where(${cardPartRefs.root}:is([${cardOptions.attribute("variant")}="embedded"], [${cardOptions.attribute("variant")}="auto"]:not([data-card-depth="0"]))) {
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  --meowui-focus-halo: inherit;
  box-shadow: none;
}
${cardHeaderPartRefs.root} {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${uiTokens.space.group} ${uiTokens.space.section};
  align-items: start;
  min-width: 0;
}
:where(${cardHeaderPartRefs.root}:has(> ${cardActionPartRefs.root})) {
  /* Tracks collapse at the card's own width without size containment affecting intrinsic cards. */
  grid-template-columns: repeat(auto-fit, minmax(min(100%, ${uiTokens.layout.gridNormal}), max-content));
  grid-auto-flow: row dense;
  justify-content: space-between;
}
:where(${cardHeaderPartRefs.root} > ${cardTitlePartRefs.root}, ${cardHeaderPartRefs.root} > ${cardDescriptionPartRefs.root}) {
  grid-column: 1;
}
${cardTitlePartRefs.root} {
  margin: 0;
  color: ${uiTokens.ink.primary};
  font-size: ${uiTokens.type.title};
  font-weight: ${uiTokens.type.weight.semibold};
  line-height: ${uiTokens.type.line.title};
  letter-spacing: ${uiTokens.type.trackingTight};
  overflow-wrap: anywhere;
}
${cardDescriptionPartRefs.root} {
  margin: 0;
  color: ${uiTokens.ink.secondary};
  font-size: ${uiTokens.type.body};
  line-height: ${uiTokens.type.leading};
  overflow-wrap: anywhere;
}
${cardActionPartRefs.root} {
  display: flex;
  flex-wrap: wrap;
  gap: ${uiTokens.space.group};
  align-items: center;
}
:where(${cardHeaderPartRefs.root} > ${cardActionPartRefs.root}) {
  grid-column: auto;
  grid-row: span 2;
  order: 1;
  min-width: 0;
  max-width: 100%;
  justify-self: end;
}
${cardContentPartRefs.root} {
  display: grid;
  gap: ${uiTokens.space.section};
  min-width: 0;
}
:where(${cardContentPartRefs.root} > p) {
  margin: 0;
  overflow-wrap: anywhere;
}
:where(
  ${cardPartRefs.root} > ${cardContentPartRefs.root}:not(:first-child),
  ${cardPartRefs.root} > ${cardFooterPartRefs.root}:not(:first-child)
) {
  margin-top: ${uiTokens.space.section};
}
${cardFooterPartRefs.root} {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${uiTokens.space.group};
}
:where(${cardPartRefs.root}:is([${cardOptions.attribute("variant")}="embedded"], [${cardOptions.attribute("variant")}="auto"]:not([data-card-depth="0"])) > ${cardHeaderPartRefs.root} > ${cardTitlePartRefs.root}) {
  font-size: ${uiTokens.type.body};
}
:where(
  ${cardPartRefs.root}:is([${cardOptions.attribute("variant")}="embedded"], [${cardOptions.attribute("variant")}="auto"]:not([data-card-depth="0"])) > ${cardContentPartRefs.root}:not(:first-child),
  ${cardPartRefs.root}:is([${cardOptions.attribute("variant")}="embedded"], [${cardOptions.attribute("variant")}="auto"]:not([data-card-depth="0"])) > ${cardFooterPartRefs.root}:not(:first-child)
) {
  margin-top: ${uiTokens.space.group};
}
:where(${cardContentPartRefs.root} > ${cardPartRefs.root}:is([${cardOptions.attribute("variant")}="embedded"], [${cardOptions.attribute("variant")}="auto"]:not([data-card-depth="0"])) + ${cardPartRefs.root}:is([${cardOptions.attribute("variant")}="embedded"], [${cardOptions.attribute("variant")}="auto"]:not([data-card-depth="0"]))) {
  padding-top: ${uiTokens.space.section};
  border-top: ${uiTokens.line.width} solid ${uiTokens.line.divider};
}
`;
