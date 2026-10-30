import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { Container } from "../../components/container";
import type { Grid } from "../../components/grid";
import type { Inline } from "../../components/inline";
import type { Stack } from "../../components/stack";
import { containerOptions } from "../../components/container.options";
import { gridMinColumn, gridOptions } from "../../components/grid.options";
import { layoutOptions } from "../../components/layout.options";
const containerPartRefs = parts<typeof Container>("container");
const gridPartRefs = parts<typeof Grid>("grid");
const inlinePartRefs = parts<typeof Inline>("inline");
const stackPartRefs = parts<typeof Stack>("stack");
export const layoutStyles = css`
:where(${stackPartRefs.root}, ${inlinePartRefs.root}, ${gridPartRefs.root}, ${containerPartRefs.root}) {
  box-sizing: border-box;
}
:where(${stackPartRefs.root}, ${inlinePartRefs.root}, ${gridPartRefs.root}, ${containerPartRefs.root}) > * {
  min-width: 0;
}
/* The gap owns the spacing between children; a plain paragraph's or heading's browser margin
   would add to it. Component parts keep the margins their own fragments give them. */
:where(${stackPartRefs.root}, ${inlinePartRefs.root}, ${gridPartRefs.root})
  > :where(p, h1, h2, h3, h4, h5, h6, ul, ol, dl, figure, blockquote, pre, hr):not([data-meowui-part]) {
  margin-block: 0;
}
:where(${stackPartRefs.root}, ${inlinePartRefs.root}, ${gridPartRefs.root}):is([${layoutOptions.attribute("gap")}="none"], [${gridOptions.attribute("gap")}="none"]) {
  gap: 0;
}
:where(${stackPartRefs.root}, ${inlinePartRefs.root}, ${gridPartRefs.root}):is([${layoutOptions.attribute("gap")}="compact"], [${gridOptions.attribute("gap")}="compact"]) {
  gap: ${uiTokens.space.group};
}
:where(${stackPartRefs.root}, ${inlinePartRefs.root}, ${gridPartRefs.root}):is([${layoutOptions.attribute("gap")}="normal"], [${gridOptions.attribute("gap")}="normal"]) {
  gap: ${uiTokens.space.section};
}
:where(${stackPartRefs.root}, ${inlinePartRefs.root}, ${gridPartRefs.root}):is([${layoutOptions.attribute("gap")}="relaxed"], [${gridOptions.attribute("gap")}="relaxed"]) {
  gap: ${uiTokens.space.panel};
}
:where(${stackPartRefs.root}, ${inlinePartRefs.root}, ${gridPartRefs.root}):is([${layoutOptions.attribute("rowGap")}="none"], [${gridOptions.attribute("rowGap")}="none"]) {
  row-gap: 0;
}
:where(${stackPartRefs.root}, ${inlinePartRefs.root}, ${gridPartRefs.root}):is([${layoutOptions.attribute("rowGap")}="compact"], [${gridOptions.attribute("rowGap")}="compact"]) {
  row-gap: ${uiTokens.space.group};
}
:where(${stackPartRefs.root}, ${inlinePartRefs.root}, ${gridPartRefs.root}):is([${layoutOptions.attribute("rowGap")}="normal"], [${gridOptions.attribute("rowGap")}="normal"]) {
  row-gap: ${uiTokens.space.section};
}
:where(${stackPartRefs.root}, ${inlinePartRefs.root}, ${gridPartRefs.root}):is([${layoutOptions.attribute("rowGap")}="relaxed"], [${gridOptions.attribute("rowGap")}="relaxed"]) {
  row-gap: ${uiTokens.space.panel};
}
:where(${stackPartRefs.root}, ${inlinePartRefs.root}, ${gridPartRefs.root}):is([${layoutOptions.attribute("columnGap")}="none"], [${gridOptions.attribute("columnGap")}="none"]) {
  column-gap: 0;
}
:where(${stackPartRefs.root}, ${inlinePartRefs.root}, ${gridPartRefs.root}):is([${layoutOptions.attribute("columnGap")}="compact"], [${gridOptions.attribute("columnGap")}="compact"]) {
  column-gap: ${uiTokens.space.group};
}
:where(${stackPartRefs.root}, ${inlinePartRefs.root}, ${gridPartRefs.root}):is([${layoutOptions.attribute("columnGap")}="normal"], [${gridOptions.attribute("columnGap")}="normal"]) {
  column-gap: ${uiTokens.space.section};
}
:where(${stackPartRefs.root}, ${inlinePartRefs.root}, ${gridPartRefs.root}):is([${layoutOptions.attribute("columnGap")}="relaxed"], [${gridOptions.attribute("columnGap")}="relaxed"]) {
  column-gap: ${uiTokens.space.panel};
}
${gridPartRefs.root} {
  ${gridOptions.when({ minColumnWidth: "compact" })} {
    ${gridMinColumn.name}: var(${uiTokens.layout.gridCompact.name}, 160px);
  }
}
${gridPartRefs.root} {
  ${gridOptions.when({ minColumnWidth: "normal" })} {
    ${gridMinColumn.name}: var(${uiTokens.layout.gridNormal.name}, 240px);
  }
}
${gridPartRefs.root} {
  ${gridOptions.when({ minColumnWidth: "wide" })} {
    ${gridMinColumn.name}: var(${uiTokens.layout.gridWide.name}, 320px);
  }
}
${containerPartRefs.root} {
  ${containerOptions.when({ width: "narrow" })} {
    max-width: var(${uiTokens.layout.containerNarrow.name}, 480px);
  }
}
${containerPartRefs.root} {
  ${containerOptions.when({ width: "content" })} {
    max-width: var(${uiTokens.layout.containerContent.name}, 720px);
  }
}
${containerPartRefs.root} {
  ${containerOptions.when({ width: "wide" })} {
    max-width: var(${uiTokens.layout.containerWide.name}, 1120px);
  }
}
/* A full-width page body: gutters on both sides, a measured column between them. */
${containerPartRefs.root} {
  ${containerOptions.when({ width: "page" })} {
    box-sizing: border-box;
    container-type: inline-size;
    max-width: calc(${uiTokens.layout.containerPage} + 2 * ${uiTokens.space.pageInline});
    padding: ${uiTokens.space.pageBlock} ${uiTokens.space.pageInline} calc(${uiTokens.space.pageBlock} + ${uiTokens.space.panel});
  }
}
@media (max-width: 768px) {
  ${containerPartRefs.root} {
    ${containerOptions.when({ width: "page" })} {
      max-width: calc(${uiTokens.layout.containerPage} + 2 * ${uiTokens.space.pageInlineCompact});
      padding: ${uiTokens.space.pageBlockCompact} ${uiTokens.space.pageInlineCompact} calc(${uiTokens.space.pageBlockCompact} + ${uiTokens.space.section});
    }
  }
}
${containerPartRefs.root} {
  ${containerOptions.when({ width: "full" })} {
    max-width: none;
  }
}
`;
