import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { PathLabel } from "../../components/path-label";
const pathLabelPartRefs = parts<typeof PathLabel>("path-label");
export const pathLabelStyles = css`
  ${pathLabelPartRefs.root} {
    display: flex;
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    font-size: ${uiTokens.type.caption};
  }
  ${pathLabelPartRefs.text} {
    display: flex;
    flex: 0 1 auto;
    min-width: 0;
  }
  /* The directory gives way first and elides its start, so the nearest folders stay readable. */
  ${pathLabelPartRefs.directory} {
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    direction: rtl;
    color: ${uiTokens.ink.tertiary};
  }
  /* Marks keep the separators in path order inside the right-to-left box. */
  ${pathLabelPartRefs.directory}::before,
  ${pathLabelPartRefs.directory}::after {
    content: "\\200e";
  }
  /* The name elides its end only once it alone is wider than the slot. */
  ${pathLabelPartRefs.name} {
    flex: none;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    color: ${uiTokens.ink.primary};
  }
`;
