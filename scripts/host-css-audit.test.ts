import { expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = join(import.meta.dir, "..");
const roots = ["apps/docs", "apps/showcase"];

// Existing violations only. Keys include file, reason and selector; counts cannot increase.
const baseline: Record<string, number> = {};

function cssFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === "dist" || entry.name === "node_modules") return [];
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return cssFiles(path);
    return entry.isFile() && entry.name.endsWith(".css") ? [path] : [];
  });
}

function unescapeCss(value: string): string {
  return value.replace(/\\([\da-fA-F]{1,6}\s?|[^\n\r\f\da-fA-F])/g, (_, escaped: string) => {
    const hex = escaped.trim();
    if (/^[\da-fA-F]{1,6}$/.test(hex)) {
      const code = Number.parseInt(hex, 16);
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "\ufffd";
    }
    return escaped;
  });
}

// Split only at top-level commas, preserving lists in :is(), :not() and attributes.
function selectorList(value: string): string[] {
  let depth = 0;
  let start = 0;
  const result: string[] = [];
  for (let i = 0; i < value.length; i++) {
    if (value[i] === "(" || value[i] === "[") depth++;
    else if (value[i] === ")" || value[i] === "]") depth--;
    else if (value[i] === "," && depth === 0) {
      result.push(value.slice(start, i));
      start = i + 1;
    }
  }
  result.push(value.slice(start));
  return result.map((selector) => selector.trim()).filter(Boolean);
}

function violations(css: string): string[] {
  const found: string[] = [];
  // Remove comments and strings before tokenizing, retaining separation between tokens.
  const source = css.replace(/\/\*[\s\S]*?\*\/|"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'/g, " ");
  const stack: { layer: boolean; keyframes: boolean }[] = [];
  let start = 0;
  let parens = 0;
  let brackets = 0;

  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (char === "\\") {
      // Escaped punctuation is part of a token, not a structural delimiter.
      i++;
      continue;
    }
    if (char === "(") parens++;
    else if (char === ")") parens--;
    else if (char === "[") brackets++;
    else if (char === "]") brackets--;
    if (parens || brackets) continue;
    if (char === ";" || char === "}") {
      if (char === "}") stack.pop();
      start = i + 1;
    } else if (char === "{") {
      const header = source.slice(start, i).trim();
      const parent = stack.at(-1);
      const layer = Boolean(parent?.layer || /^@layer(?:\s|\{|$)/i.test(header));
      const keyframes = Boolean(parent?.keyframes || /^@(?:-\w+-)?keyframes\b/i.test(header));
      if (header && !header.startsWith("@") && !keyframes) {
        for (const raw of selectorList(header)) {
          const selector = unescapeCss(raw).replace(/\s+/g, " ").trim();
          // A negative guard excludes the part itself; it does not target it.
          const positive = selector.replace(/:not\(\s*\[\s*data-meowui-part\s*\]\s*\)/gi, "");
          if (/\[\s*data-meowui-part\b/i.test(positive)) {
            found.push(`part: ${selector}`);
            continue;
          }
          // Attribute values and class/id/pseudo names are not type selectors. Type
          // selectors in functional pseudos remain visible, including :is(a, button).
          const types = positive.replace(/\[[^\]]*\]/g, "");
          const hostOnly = /^\.host-css-only(?:\s*>|\s+(?=[^\s+~>]))/i.test(types);
          if (!layer && !hostOnly && /(?:^|[\s>+~,(])(?:\*\|)?[a-z_][\w-]*/i.test(types)) {
            found.push(`element: ${selector}`);
          }
        }
      }
      stack.push({ layer, keyframes });
      start = i + 1;
    }
  }
  return found;
}

test("host CSS adds no violations beyond the recorded baseline", () => {
  const counts: Record<string, number> = {};
  for (const dir of roots) {
    for (const file of cssFiles(join(root, dir))) {
      for (const violation of violations(readFileSync(file, "utf8"))) {
        const key = `${relative(root, file)}: ${violation}`;
        counts[key] = (counts[key] ?? 0) + 1;
      }
    }
  }
  const added = Object.entries(counts).filter(([key, count]) => count > (baseline[key] ?? 0));
  expect(added).toEqual([]);
});

test("the audit checks selector lists, nested rules, escapes and layers", () => {
  expect(
    violations(`
      /* button {} */ .card, a:hover { color: red; }
      @media (min-width: 1px) { :is(button, input) { color: red; } }
      @layer reset { button { color: red; } [data-meowui-part="root"] { color: red; } }
      .host-css-only > a { color: red; }
      .card { & button { color: red; } }
      b\\75 tton { color: red; }
      @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
    `),
  ).toEqual([
    "element: a:hover",
    "element: :is(button, input)",
    "part: [data-meowui-part= ]",
    "element: & button",
    "element: button",
  ]);
});

test("a host wrapper must be an ancestor and every selector is checked", () => {
  expect(violations(`.host-css-only, a { color: red; } .host-css-only.button { color: red; }
    .host-css-only [data-meowui-part] { color: red; }
    .host-css-only + button, :is(.host-css-only a, button) { color: red; }`)).toEqual([
    "element: a",
    "part: .host-css-only [data-meowui-part]",
    "element: .host-css-only + button",
    "element: :is(.host-css-only a, button)",
  ]);
});
