import { css, partSelector } from "meowcss/meowjsx";
import { imagePreviewContract as preview } from "meowtail";
import { presentationImageContract as image } from "../../presentation/image";
import { uiTokens } from "meowtail/theme";
import { presentationTokens } from "./presentation.tokens";

export const presentationImageStyles = css`
  ${partSelector(image, "root")} {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;
    min-height: 0;
    max-height: 100%;
    margin: 0;
    gap: ${presentationTokens.spaceGroup};
  }
  ${partSelector(image, "root")}[data-sizing="fill"] {
    height: 100%;
  }
  ${partSelector(image, "root")}[data-sizing="ratio"] {
    align-self: start;
  }
  ${partSelector(image, "frame")} {
    position: relative;
    flex: 1 1 auto;
    width: 100%;
    min-width: 0;
    min-height: 0;
    border-radius: ${uiTokens.radius.md};
    background: ${presentationTokens.paper};
  }
  ${partSelector(image, "root")}[data-sizing="ratio"] > ${partSelector(image, "frame")} {
    flex-grow: 0;
  }
  ${partSelector(image, "frame")} > ${partSelector(preview, "root")} {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    overflow: visible;
    border-radius: inherit;
    background: transparent;
    object-fit: inherit;
    object-position: inherit;
  }
  ${partSelector(image, "frame")} ${partSelector(preview, "image")} {
    border-radius: inherit;
    object-fit: inherit;
    object-position: inherit;
  }
  ${partSelector(image, "frame")} ${partSelector(preview, "status")} {
    overflow-wrap: anywhere;
    color: ${presentationTokens.muted};
    font: inherit;
    font-size: ${presentationTokens.fontCaption};
    line-height: ${presentationTokens.lineHeight};
  }
  ${partSelector(image, "caption")} {
    flex: none;
    min-width: 0;
    overflow-wrap: anywhere;
    color: ${presentationTokens.muted};
    font-size: ${presentationTokens.fontCaption};
    line-height: 1.4;
  }
`;
