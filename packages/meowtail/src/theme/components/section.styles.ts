import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { sectionContract } from "../../components/section";

const section = (part: (typeof sectionContract.parts)[number]) =>
  partSelector(sectionContract, part);

export const sectionStyles = css`
  ${section("root")} {
    box-sizing: border-box;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: ${uiTokens.spaceGroup};
    min-width: 0;
    color: ${uiTokens.foreground};
    font: ${uiTokens.fontBody}/${uiTokens.leading} ${uiTokens.font};
  }

  /* The title row: description stays under the heading while actions sit on the
     heading row and wrap below it when the row runs out of width. */
  ${section("header")} {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: ${uiTokens.spaceGroup} ${uiTokens.spaceSection};
    min-width: 0;
  }
  ${section("title")} {
    flex: 1 1 var(${uiTokens.gridColumnCompact.name}, 160px);
    min-width: 0;
    margin: 0;
    font-family: ${uiTokens.fontDisplay};
    font-size: ${uiTokens.fontTitle};
    font-weight: 600;
    line-height: 1.4;
    letter-spacing: -0.01em;
    overflow-wrap: anywhere;
  }
  /* A nested section reads as a subheading under the section that contains it.
     At body size a bold serif loses its shapes, so subheadings use the UI face. */
  ${section("title")}:is(h3, h4, h5, h6) {
    font-family: ${uiTokens.font};
    font-size: ${uiTokens.fontBody};
  }
  ${section("description")} {
    order: 2;
    flex: 1 1 100%;
    margin: 0;
    color: ${uiTokens.mutedForeground};
    font-size: ${uiTokens.fontBody};
    line-height: ${uiTokens.leading};
    overflow-wrap: anywhere;
  }
  ${section("actions")} {
    order: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: ${uiTokens.spaceGroup};
    margin-inline-start: auto;
    min-width: 0;
    max-width: 100%;
    overflow-wrap: anywhere;
  }

  /* Content stays a tight group: the page rhythm separates sections, so the
     lines and blocks inside one section keep the compact step. */
  ${section("content")} {
    display: grid;
    gap: ${uiTokens.spaceGroup};
    min-width: 0;
  }
  ${section("content")} > p {
    margin: 0;
    overflow-wrap: anywhere;
  }

  /* Supporting note or action row after the content; quieter than the body. */
  ${section("footer")} {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: ${uiTokens.spaceGroup};
    margin: 0;
    min-width: 0;
    color: ${uiTokens.mutedForeground};
    font-size: ${uiTokens.fontCaption};
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  /* The card variant's surface and its spacePanel inset belong to the wrapped
     Card component; the section root adds no padding, so one card section never
     double-insets and the card keeps a single visual owner. */
  ${section("root")}[data-variant="card"] {
    padding: 0;
  }

  @media (pointer: coarse) {
    ${section("actions")}[data-meowui-part] > * {
      min-width: 44px;
      min-height: 44px;
    }
  }
`;
