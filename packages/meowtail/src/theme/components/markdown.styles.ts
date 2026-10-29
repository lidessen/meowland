import { css, parts } from "meowcss/meowjsx";
import type { Markdown } from "../../components/markdown";
const markdown = parts<typeof Markdown>("markdown");
/* Blocks, lists, code, quotes and tables read like Prose through the shared prose rhythm; the
   root takes its type from where it is placed, as Agent text does in a message. */
export const markdownStyles = css`
  ${markdown.root} {
    min-width: 0;
    overflow-wrap: anywhere;
  }
`;
