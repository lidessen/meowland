import { defineTokens } from "meowcss";

/** DeepSeek ui-theme/shiki.css palette; emitted through the standard scheme mechanism. */
export const codeHighlightTokens = defineTokens("code-highlight", {
  constant: ["#1c7ed6", "#4dabf7"],
  string: ["#2f9e44", "#69db7c"],
  comment: ["#868e96", "#adb5bd"],
  keyword: ["#d6336c", "#faa2c1"],
  parameter: ["#e8590c", "#ffa94d"],
  function: ["#6741d9", "#b197fc"],
  stringExpression: ["#2b8a3e", "#8ce99a"],
  punctuation: ["#495057", "#ced4da"],
  link: ["#1971c2", "#74c0fc"],
});
