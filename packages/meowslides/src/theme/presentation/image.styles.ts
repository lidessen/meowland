import { css, parts } from "meowcss/meowjsx";
import type { ImagePreview } from "meowtail";
import type { PresentationImage } from "../../presentation/image";
import { ui } from "meowtail/theme";
import { presentationTokens } from "./presentation.tokens";

const image = parts<typeof PresentationImage>("presentation-image");
const preview = parts<typeof ImagePreview>("image-preview");

export const presentationImageStyles = css`
  ${image.root} {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;
    min-height: 0;
    max-height: 100%;
    margin: 0;
    gap: ${presentationTokens.spaceGroup};
  }
  ${image.root}[data-sizing="fill"] {
    height: 100%;
  }
  ${image.root}[data-sizing="ratio"] {
    align-self: start;
  }
  ${image.frame} {
    position: relative;
    flex: 1 1 auto;
    width: 100%;
    min-width: 0;
    min-height: 0;
    ${ui.radius.md}
    background: ${presentationTokens.paper};
  }
  ${image.root}[data-sizing="ratio"] > ${image.frame} {
    flex-grow: 0;
  }
  ${image.frame} > ${preview.root} {
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
  ${image.frame} ${preview.image} {
    border-radius: inherit;
    object-fit: inherit;
    object-position: inherit;
  }
  ${image.frame} ${preview.status} {
    overflow-wrap: anywhere;
    color: ${presentationTokens.muted};
    font: inherit;
    font-size: ${presentationTokens.fontCaption};
    line-height: ${presentationTokens.lineHeight};
  }
  ${image.caption} {
    flex: none;
    min-width: 0;
    overflow-wrap: anywhere;
    color: ${presentationTokens.muted};
    font-size: ${presentationTokens.fontCaption};
    line-height: 1.4;
  }
`;
