import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { containerContract, containerOptions } from "../../components/container";
import { gridContract, gridMinColumn, gridOptions } from "../../components/grid";
import { inlineContract } from "../../components/inline";
import { layoutOptions } from "../../components/layout-types";
import { stackContract } from "../../components/stack";

export const layoutStyles = css`
:where(${partSelector(stackContract, "root")}, ${partSelector(inlineContract, "root")}, ${partSelector(gridContract, "root")}, ${partSelector(containerContract, "root")}) {
  box-sizing: border-box;
}
:where(${partSelector(stackContract, "root")}, ${partSelector(inlineContract, "root")}, ${partSelector(gridContract, "root")}, ${partSelector(containerContract, "root")}) > * {
  min-width: 0;
}
:where(${partSelector(stackContract, "root")}, ${partSelector(inlineContract, "root")}, ${partSelector(gridContract, "root")}):is([${layoutOptions.attribute("gap")}="none"], [${gridOptions.attribute("gap")}="none"]) {
  gap: 0;
}
:where(${partSelector(stackContract, "root")}, ${partSelector(inlineContract, "root")}, ${partSelector(gridContract, "root")}):is([${layoutOptions.attribute("gap")}="compact"], [${gridOptions.attribute("gap")}="compact"]) {
  gap: ${uiTokens.space.group};
}
:where(${partSelector(stackContract, "root")}, ${partSelector(inlineContract, "root")}, ${partSelector(gridContract, "root")}):is([${layoutOptions.attribute("gap")}="normal"], [${gridOptions.attribute("gap")}="normal"]) {
  gap: ${uiTokens.space.section};
}
:where(${partSelector(stackContract, "root")}, ${partSelector(inlineContract, "root")}, ${partSelector(gridContract, "root")}):is([${layoutOptions.attribute("gap")}="relaxed"], [${gridOptions.attribute("gap")}="relaxed"]) {
  gap: ${uiTokens.space.panel};
}
:where(${partSelector(stackContract, "root")}, ${partSelector(inlineContract, "root")}, ${partSelector(gridContract, "root")}):is([${layoutOptions.attribute("rowGap")}="none"], [${gridOptions.attribute("rowGap")}="none"]) {
  row-gap: 0;
}
:where(${partSelector(stackContract, "root")}, ${partSelector(inlineContract, "root")}, ${partSelector(gridContract, "root")}):is([${layoutOptions.attribute("rowGap")}="compact"], [${gridOptions.attribute("rowGap")}="compact"]) {
  row-gap: ${uiTokens.space.group};
}
:where(${partSelector(stackContract, "root")}, ${partSelector(inlineContract, "root")}, ${partSelector(gridContract, "root")}):is([${layoutOptions.attribute("rowGap")}="normal"], [${gridOptions.attribute("rowGap")}="normal"]) {
  row-gap: ${uiTokens.space.section};
}
:where(${partSelector(stackContract, "root")}, ${partSelector(inlineContract, "root")}, ${partSelector(gridContract, "root")}):is([${layoutOptions.attribute("rowGap")}="relaxed"], [${gridOptions.attribute("rowGap")}="relaxed"]) {
  row-gap: ${uiTokens.space.panel};
}
:where(${partSelector(stackContract, "root")}, ${partSelector(inlineContract, "root")}, ${partSelector(gridContract, "root")}):is([${layoutOptions.attribute("columnGap")}="none"], [${gridOptions.attribute("columnGap")}="none"]) {
  column-gap: 0;
}
:where(${partSelector(stackContract, "root")}, ${partSelector(inlineContract, "root")}, ${partSelector(gridContract, "root")}):is([${layoutOptions.attribute("columnGap")}="compact"], [${gridOptions.attribute("columnGap")}="compact"]) {
  column-gap: ${uiTokens.space.group};
}
:where(${partSelector(stackContract, "root")}, ${partSelector(inlineContract, "root")}, ${partSelector(gridContract, "root")}):is([${layoutOptions.attribute("columnGap")}="normal"], [${gridOptions.attribute("columnGap")}="normal"]) {
  column-gap: ${uiTokens.space.section};
}
:where(${partSelector(stackContract, "root")}, ${partSelector(inlineContract, "root")}, ${partSelector(gridContract, "root")}):is([${layoutOptions.attribute("columnGap")}="relaxed"], [${gridOptions.attribute("columnGap")}="relaxed"]) {
  column-gap: ${uiTokens.space.panel};
}
${partSelector(gridContract, "root")} {
  ${gridOptions.when({ minColumnWidth: "compact" })} {
    ${gridMinColumn.name}: var(${uiTokens.layout.gridCompact.name}, 160px);
  }
}
${partSelector(gridContract, "root")} {
  ${gridOptions.when({ minColumnWidth: "normal" })} {
    ${gridMinColumn.name}: var(${uiTokens.layout.gridNormal.name}, 240px);
  }
}
${partSelector(gridContract, "root")} {
  ${gridOptions.when({ minColumnWidth: "wide" })} {
    ${gridMinColumn.name}: var(${uiTokens.layout.gridWide.name}, 320px);
  }
}
${partSelector(containerContract, "root")} {
  ${containerOptions.when({ width: "narrow" })} {
    max-width: var(${uiTokens.layout.containerNarrow.name}, 480px);
  }
}
${partSelector(containerContract, "root")} {
  ${containerOptions.when({ width: "content" })} {
    max-width: var(${uiTokens.layout.containerContent.name}, 720px);
  }
}
${partSelector(containerContract, "root")} {
  ${containerOptions.when({ width: "wide" })} {
    max-width: var(${uiTokens.layout.containerWide.name}, 1120px);
  }
}
/* A full-width page body: gutters on both sides, a measured column between them. */
${partSelector(containerContract, "root")} {
  ${containerOptions.when({ width: "page" })} {
    box-sizing: border-box;
    container-type: inline-size;
    max-width: calc(${uiTokens.layout.containerPage} + 2 * ${uiTokens.space.pageInline});
    padding: ${uiTokens.space.pageBlock} ${uiTokens.space.pageInline} calc(${uiTokens.space.pageBlock} + ${uiTokens.space.panel});
  }
}
@media (max-width: 768px) {
  ${partSelector(containerContract, "root")} {
    ${containerOptions.when({ width: "page" })} {
      max-width: calc(${uiTokens.layout.containerPage} + 2 * ${uiTokens.space.pageInlineCompact});
      padding: ${uiTokens.space.pageBlockCompact} ${uiTokens.space.pageInlineCompact} calc(${uiTokens.space.pageBlockCompact} + ${uiTokens.space.section});
    }
  }
}
${partSelector(containerContract, "root")} {
  ${containerOptions.when({ width: "full" })} {
    max-width: none;
  }
}
`;
