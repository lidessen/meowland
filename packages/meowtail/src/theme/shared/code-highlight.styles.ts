import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { codeBlockContract } from "../../components/code-block.contract";
import { readBlockContract } from "../../components/read-block.contract";
import { codeHighlightTokens } from "./code-highlight.tokens";

export const codeHighlightStyles = css`
  ${partSelector(codeBlockContract, "root")}, ${partSelector(readBlockContract, "root")} {
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
