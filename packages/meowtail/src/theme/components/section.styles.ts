import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { Section } from "../../components/section";
import { ui } from "../utilities";
const sectionPartRefs = parts<typeof Section>("section");
const section = (part: keyof typeof sectionPartRefs) => sectionPartRefs[part];

export const sectionStyles = css`
  ${section("root")} {
    box-sizing: border-box;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: ${uiTokens.space.group};
    min-width: 0;
    color: ${uiTokens.ink.primary};
    font: ${uiTokens.type.body} / ${uiTokens.type.leading} ${uiTokens.type.sans};
  }

  /* The title row: description stays under the heading while actions sit on the
     heading row and wrap below it when the row runs out of width. */
  ${section("header")} {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: ${uiTokens.space.group} ${uiTokens.space.section};
    min-width: 0;
  }
  ${section("title")} {
    flex: 1 1 var(${uiTokens.layout.gridCompact.name}, 160px);
    min-width: 0;
    margin: 0;
    ${ui.text.title}
    overflow-wrap: anywhere;
  }
  /* A nested section reads as a subheading under the section that contains it: body size, still
     semibold. */
  ${section("title")}:is(h3, h4, h5, h6) {
    font-size: ${uiTokens.type.body};
    line-height: ${uiTokens.type.line.body};
  }
  ${section("description")} {
    order: 2;
    flex: 1 1 100%;
    margin: 0;
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.body};
    line-height: ${uiTokens.type.leading};
    overflow-wrap: anywhere;
  }
  ${section("actions")} {
    order: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: ${uiTokens.space.group};
    margin-inline-start: auto;
    min-width: 0;
    max-width: 100%;
    overflow-wrap: anywhere;
  }

  /* Content stays a tight group: the page rhythm separates sections, so the
     lines and blocks inside one section keep the compact step. */
  ${section("content")} {
    display: grid;
    gap: ${uiTokens.space.group};
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
    gap: ${uiTokens.space.group};
    margin: 0;
    min-width: 0;
    color: ${uiTokens.ink.secondary};
    font-size: ${uiTokens.type.caption};
    line-height: ${uiTokens.type.line.caption};
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
