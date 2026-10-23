import type { AuditRule } from "meowcss";

/*
 * The standard scales as audit rules. A declaration that writes a literal
 * where the system has a role fails here, so a host stylesheet (or this
 * package's own theme) cannot drift quietly. Values are inspected after
 * url(...) and var(...) are removed: a role reference is never a violation,
 * and a length derived from a role (calc(var(...) - 1px), em) is geometry.
 */
const derived = (value: string) => /var\(/i.test(value);
const strip = (value: string) => value.replace(/url\([^)]*\)/gi, "").replace(/var\([^)]*\)/gi, "");

const colorLiteral =
  /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(|\b(?:white|black|red|green|blue|gray|grey|orange|yellow|purple|pink|silver)\b/i;

export const standardAuditRules: readonly AuditRule[] = [
  {
    name: "literal-color",
    message:
      "Paint with a uiTokens color role (surface, line, ink, state, action, accent, status).",
    // Masks use black and transparent as alpha, not as paint.
    properties: /^(?!transition|animation|font|content$|(-webkit-)?mask).*/,
    violates: ({ value }) => colorLiteral.test(strip(value)),
  },
  {
    name: "literal-duration",
    message: "Time motion with a uiTokens.motion role.",
    properties: /^(transition|animation)(-duration|-delay)?$/,
    violates: ({ value }) => /(?:^|[\s,])(?!0m?s\b)\d*\.?\d+m?s\b/.test(strip(value)),
  },
  {
    name: "literal-font-size",
    message: "Size type with a uiTokens.type role.",
    properties: ["font-size"],
    violates: ({ value }) => !derived(value) && /\d(?:px|rem)\b/.test(value),
  },
  {
    name: "literal-radius",
    message: "Round corners with a uiTokens.radius role (0 and 50% are geometry).",
    properties: /^border(-[a-z]+)*-radius$/,
    violates: ({ value }) =>
      !derived(value) &&
      strip(value)
        .split(/[\s/]+/)
        .some((length) => /\d/.test(length) && !/^(0|0px|50%|100%)$/.test(length)),
  },
];
