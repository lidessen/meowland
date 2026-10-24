import { css, defineOptions, defineTheme, defineTokens, type CSSFragment } from "meowcss";

const options = defineOptions("plain", { density: ["compact", "normal"] });
const tokens = defineTokens("plain", {
  gap: options.by.density(["4px", "8px"]),
});
const fragment: CSSFragment = css`
  body {
    gap: ${tokens.gap};
  }
`;
defineTheme({
  options,
  defaults: { scheme: "auto", density: "normal" },
  tokens: [tokens],
  styles: fragment,
});
defineTheme({
  options,
  // @ts-expect-error A misspelled option must not widen the root theme's options.
  defaults: { scheme: "auto", density: "dense" },
  tokens: [],
  styles: fragment,
});
