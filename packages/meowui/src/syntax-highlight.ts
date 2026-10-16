import type { HighlighterCore } from "shiki/core";

const grammars = {
  typescript: () => import("@shikijs/langs/typescript"),
  javascript: () => import("@shikijs/langs/javascript"),
  tsx: () => import("@shikijs/langs/tsx"),
  jsx: () => import("@shikijs/langs/jsx"),
  json: () => import("@shikijs/langs/json"),
  shellscript: () => import("@shikijs/langs/shellscript"),
  python: () => import("@shikijs/langs/python"),
  go: () => import("@shikijs/langs/go"),
  rust: () => import("@shikijs/langs/rust"),
  yaml: () => import("@shikijs/langs/yaml"),
  html: () => import("@shikijs/langs/html"),
  css: () => import("@shikijs/langs/css"),
  sql: () => import("@shikijs/langs/sql"),
  markdown: () => import("@shikijs/langs/markdown"),
};
type Language = keyof typeof grammars;
// Fixed grammar probes initialize scanners before user content enters Shiki's
// per-line budget. These are trusted constants, not caller-controlled input.
const warmups: Record<Language, string> = {
  typescript: 'const value: string = "ready"; // comment',
  javascript: 'const value = "ready"; // comment',
  tsx: 'const view = <div title="ready">{42}</div>;',
  jsx: 'const view = <div title="ready">{42}</div>;',
  json: '{"ready":true,"value":42}',
  shellscript: 'printf "%s\\n" "$value" # comment',
  python: 'value = "ready" # comment\nprint(value)',
  go: 'package main\nfunc main() { println("ready") }',
  rust: 'fn main() { println!("ready"); }',
  yaml: 'ready: true\nvalue: "text"',
  html: '<div title="ready">text</div>',
  css: ".ready { color: red; } /* comment */",
  sql: "SELECT 'ready', 42 FROM example; -- comment",
  markdown: "# Ready\n**text** and `code`\n[link](https://example.com)",
};
const aliases: Record<string, Language> = {
  ts: "typescript",
  js: "javascript",
  sh: "shellscript",
  bash: "shellscript",
  shell: "shellscript",
  py: "python",
  yml: "yaml",
  md: "markdown",
  rs: "rust",
};
export function highlightLanguage(language?: string): Language | undefined {
  const hint = language?.trim().toLowerCase();
  if (!hint) return undefined;
  return Object.hasOwn(grammars, hint) ? (hint as Language) : aliases[hint];
}
let core: Promise<HighlighterCore> | undefined;
const loaded = new Map<Language, Promise<void>>();
function highlighter() {
  core ??= Promise.all([import("shiki/core"), import("shiki/engine/javascript")])
    .then(([shiki, engine]) =>
      shiki.createHighlighterCoreSync({
        themes: [
          shiki.createCssVariablesTheme({
            name: "meowui",
            variablePrefix: "--meowui-code-",
            fontStyle: true,
          }),
        ],
        langs: [],
        engine: engine.createJavaScriptRegexEngine({
          forgiving: true,
          regexConstructor: (pattern) =>
            engine.defaultJavaScriptRegexConstructor(pattern, {
              lazyCompileLength: Number.POSITIVE_INFINITY,
            }),
        }),
      }),
    )
    .catch((error) => {
      core = undefined;
      throw error;
    });
  return core;
}
export interface HighlightSpan {
  text: string;
  color?: string;
  fontStyle?: number;
}
/** Unknown or unavailable grammars fall back to the caller's unchanged plain text. */
export async function highlightCode(
  code: string,
  language?: string,
): Promise<HighlightSpan[] | undefined> {
  const lang = highlightLanguage(language);
  if (!lang) return undefined;
  try {
    const instance = await highlighter();
    if (!loaded.has(lang))
      loaded.set(
        lang,
        grammars[lang]()
          .then((module) => {
            instance.loadLanguageSync(module.default);
            instance.codeToTokensBase(warmups[lang], {
              lang,
              theme: "meowui",
              tokenizeTimeLimit: 0,
            });
          })
          .catch((error) => {
            loaded.delete(lang);
            throw error;
          }),
      );
    await loaded.get(lang);
    const lines = instance.codeToTokensBase(code, { lang, theme: "meowui" });
    const endings = code.match(/\r\n|\n|\r/g) ?? [];
    const result = lines.flatMap((line, index) => [
      ...line.map((token) => ({
        text: token.content,
        color: token.color,
        fontStyle: token.fontStyle,
      })),
      ...(index < endings.length ? [{ text: endings[index]! }] : []),
    ]);
    // Tokenizer limits and newline normalization must never alter displayed content.
    return result.map((span) => span.text).join("") === code ? result : undefined;
  } catch {
    return undefined;
  }
}
