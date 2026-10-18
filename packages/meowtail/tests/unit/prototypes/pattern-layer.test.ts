import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "bun:test";

const prototype = resolve(import.meta.dir, "../../../prototypes/pattern-layer");
const authorPages = ["src/pages/composer-page.tsx", "src/pages/mobile-page.tsx"];

const forbidden = [
  { label: "style attribute", pattern: /\bstyle\s*=/ },
  { label: "className attribute", pattern: /\bclassName\s*=/ },
  { label: "class attribute", pattern: /\bclass\s*=/ },
  { label: "CSS import", pattern: /from\s+["'][^"']*\.css["']/ },
  { label: "meowcss import", pattern: /from\s+["']meowcss/ },
  {
    label: "raw layout element",
    pattern: /<(div|span|section|header|footer|main|button|textarea|svg)\b/,
  },
];

describe("pattern-layer author scenes", () => {
  for (const page of authorPages) {
    test(`${page} contains no author styling`, () => {
      const source = readFileSync(resolve(prototype, page), "utf8");
      for (const rule of forbidden)
        expect(source, `${page}: ${rule.label}`).not.toMatch(rule.pattern);
    });
  }
});
