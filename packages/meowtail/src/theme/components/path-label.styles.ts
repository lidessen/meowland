import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { PathLabel } from "../../components/path-label";
const pathLabelPartRefs = parts<typeof PathLabel>("path-label");
export const pathLabelStyles = css`
  ${pathLabelPartRefs.root} {
    display: flex;
    flex: 1 1 auto;
    justify-content: flex-end;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    font-size: ${uiTokens.type.caption};
  }
  ${pathLabelPartRefs.root}[data-path-clipped] {
    mask-image: linear-gradient(to right, transparent, black 28px);
  }
  ${pathLabelPartRefs.text} {
    flex: none;
    margin-right: auto;
  }
  ${pathLabelPartRefs.directory} {
    color: ${uiTokens.ink.tertiary};
  }
  ${pathLabelPartRefs.name} {
    color: ${uiTokens.ink.primary};
  }
`;
