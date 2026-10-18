import { defineTokens } from "meowcss";

/** DeepSeek ui-theme/shiki.css palette; emitted through the standard scheme mechanism. */
export const codeHighlightTokens = defineTokens("code-highlight", {
  constant: ["#1b64a8", "#4dabf7"],
  string: ["#1e6b30", "#69db7c"],
  comment: ["#656a71", "#adb5bd"],
  keyword: ["#b02a5b", "#faa2c1"],
  parameter: ["#b34700", "#ffa94d"],
  function: ["#6741d9", "#b197fc"],
  stringExpression: ["#1e6b30", "#8ce99a"],
  punctuation: ["#495057", "#ced4da"],
  link: ["#1971c2", "#74c0fc"],
});
