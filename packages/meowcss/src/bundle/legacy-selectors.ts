const legacyAny = /:-(?:webkit|moz)-any\(/;

/**
 * Remove the `:-webkit-any()` and `:-moz-any()` copies a bundler adds beside every `:is()` rule.
 * Bun's CSS bundler (1.4.4) writes each `:is()` rule, and each `:not()` with a selector list, three
 * times, and `Bun.build` offers no CSS targets to turn the old copies off; delete this pass once
 * it does. They are not harmless: iOS Safari matches the `:-moz-any()` copy of a rule such as
 * `:where(.field):-moz-any(:focus-visible, :focus-within)` on every element with focus inside, so
 * a field's focus halo spreads to every container of a tapped button. The `:is()` copy always
 * stays, so a browser that reads `:where()`, which the themes require, loses nothing.
 *
 * Only style rules whose selector holds one of the two legacy pseudo-classes are dropped; other
 * vendor prefixes such as `::-webkit-details-marker` stay. At-rule blocks and nested rules are
 * cleaned inside.
 */
export function removeLegacyIsFallbacks(css: string): string {
  let out = "";
  let start = 0;
  let index = 0;
  while (index < css.length) {
    const char = css[index]!;
    if (char === '"' || char === "'") {
      index = skipString(css, index);
      continue;
    }
    if (char === "/" && css[index + 1] === "*") {
      const end = css.indexOf("*/", index + 2);
      index = end < 0 ? css.length : end + 2;
      continue;
    }
    if (char === ";" || char === "}") {
      index++;
      out += css.slice(start, index);
      start = index;
      continue;
    }
    if (char !== "{") {
      index++;
      continue;
    }
    const prelude = css.slice(start, index);
    const end = blockEnd(css, index);
    const body = css.slice(index + 1, end);
    // At-rule blocks and nested style rules are cleaned inside; a legacy rule is left out whole.
    const selector = prelude.replace(/\/\*[\s\S]*?\*\//g, "").trim();
    if (selector.startsWith("@") || !legacyAny.test(selector))
      out += prelude + "{" + (body.includes("{") ? removeLegacyIsFallbacks(body) : body) + "}";
    index = end + 1;
    start = index;
  }
  return out + css.slice(start);
}

function skipString(css: string, index: number): number {
  const quote = css[index];
  let cursor = index + 1;
  while (cursor < css.length && css[cursor] !== quote) cursor += css[cursor] === "\\" ? 2 : 1;
  return cursor + 1;
}

/** The index of the `}` that closes the block opened at `open`. */
function blockEnd(css: string, open: number): number {
  let depth = 0;
  let index = open;
  while (index < css.length) {
    const char = css[index]!;
    if (char === '"' || char === "'") {
      index = skipString(css, index);
      continue;
    }
    if (char === "/" && css[index + 1] === "*") {
      const end = css.indexOf("*/", index + 2);
      index = end < 0 ? css.length : end + 2;
      continue;
    }
    if (char === "{") depth++;
    else if (char === "}" && --depth === 0) return index;
    index++;
  }
  return css.length;
}
