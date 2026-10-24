import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import { codeHighlightTokens } from "./code-highlight.tokens";

import type { CodeBlock } from "../../components/code-block";
import type { ReadBlock } from "../../components/read-block";
const codeBlockPartRefs = parts<typeof CodeBlock>("code-block");
const readBlockPartRefs = parts<typeof ReadBlock>("read-block");
export const codeHighlightStyles = css`
  ${codeBlockPartRefs.root}, ${readBlockPartRefs.root} {
    --meowui-code-foreground: ${uiTokens.ink.primary};
    --meowui-code-background: ${uiTokens.surface.fill};
    --meowui-code-token-constant: ${codeHighlightTokens.constant};
    --meowui-code-token-string: ${codeHighlightTokens.string};
    --meowui-code-token-comment: ${codeHighlightTokens.comment};
    --meowui-code-token-keyword: ${codeHighlightTokens.keyword};
    --meowui-code-token-parameter: ${codeHighlightTokens.parameter};
    --meowui-code-token-function: ${codeHighlightTokens.function};
    --meowui-code-token-string-expression: ${codeHighlightTokens.stringExpression};
    --meowui-code-token-punctuation: ${codeHighlightTokens.punctuation};
    --meowui-code-token-link: ${codeHighlightTokens.link};
  }
`;
