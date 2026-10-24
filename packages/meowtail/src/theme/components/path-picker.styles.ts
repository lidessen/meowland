import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { PathPicker } from "../../components/path-picker";
const pathPickerPartRefs = parts<typeof PathPicker>("path-picker");
export const pathPickerStyles = css`
  ${pathPickerPartRefs.root} {
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: ${uiTokens.space.group};
  }
  ${pathPickerPartRefs.row} {
    display: flex;
    align-items: center;
    gap: ${uiTokens.space.group};
    min-width: 0;
  }
  ${pathPickerPartRefs.control} {
    flex: 1;
    min-width: 0;
  }
  ${pathPickerPartRefs.trigger} {
    flex: none;
    white-space: nowrap;
  }
  ${pathPickerPartRefs.feedback} {
    color: ${uiTokens.status.danger};
    font-size: ${uiTokens.type.caption};
    line-height: ${uiTokens.type.leading};
  }
  ${pathPickerPartRefs.feedback}:empty {
    display: none;
  }
`;
