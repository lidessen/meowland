import { describe, expect, test } from "bun:test";
import { compileTokens, css, defineOptions, defineTokens, tokenRef } from "meowcss/meowjsx";
import { partSelector } from "meowcss/meowjsx";

describe("parameterized theme values", () => {
  test("CSS composition retains typed component dependencies without parsing text", () => {
    const contract = { name: "button", parts: ["root", "label"] } as const;
    const other = { name: "alert", parts: ["root"] } as const;
    const fragment = css`
      ${partSelector(contract, "root")} {
        color: red;
      }
    `;
    const composed = css`
      ${fragment} ${partSelector(contract, "label")} {
        padding: ${4}px;
      }
      ${partSelector(other, "root")} {
        display: flex;
      }
    `;
    expect(composed.dependencies).toEqual([contract, other]);
    expect(composed.text).toContain(String(partSelector(contract, "root")));
    expect(String(composed)).toBe(composed.text);
    expect(
      css`
        ${String(fragment)}
      `.dependencies,
    ).toEqual([]);
    const conflict = { ...contract };
    expect(
      css`
        ${partSelector(contract, "root")} ${partSelector(conflict, "root")}
      `.dependencies,
    ).toEqual([contract, conflict]);
  });
  test("aggregate compilation rejects token collisions across independent groups", () => {
    const first = defineTokens("same", { height: "1px" });
    const second = defineTokens("same", { height: "2px" });
    expect(() => compileTokens([first, second], { constants: ".root", sources: [] })).toThrow(
      "collision",
    );
  });
  test("explicit constant scopes reset instance values while source-dependent values remain regional", () => {
    const global = defineTokens("ui", { radius: "4px" });
    const local = defineTokens("button", { radius: "8px", foreground: ["black", "white"] });
    const output = compileTokens([global, local], {
      constants: ".theme-root",
      constantScopes: new Map([[local, ".button"]]),
      sources: [{ options: "scheme", selector: ".theme" }],
    });
    expect(output).toContain(".theme-root {\n  --ui-radius: 4px;");
    expect(output).toContain(".button {\n  --button-radius: 8px;");
    expect(output).toContain(
      '.theme:where([data-meowui-color-scheme="dark"]) {\n  --button-foreground: white;',
    );
    expect(() =>
      compileTokens(local, {
        constants: ".theme",
        constantScopes: new Map([[local, ""]]),
        sources: [],
      }),
    ).toThrow("Missing constants selector");
  });
  const app = defineOptions("app", { density: ["compact", "normal"] });
  const button = defineOptions("button", { size: ["small", "large"] });
  test("direct tuples, objects, stable references, and alias strings", () => {
    const one = defineTokens("ui", {
      color: { surface: ["white", "black"] },
      h: app.by.density(["32px", "36px"]),
    });
    const two = defineTokens("ui", {
      h: app.by.density({ compact: "32px", normal: "36px" }),
      color: { surface: ["white", "black"] },
    });
    expect(one.color.surface.name).toBe(two.color.surface.name);
    expect(
      css`
        color: ${one.color.surface};
        ${one.h.name}: 40px;
      `.text
        .replace(/\s+/g, " ")
        .trim(),
    ).toBe("color: var(--ui-color-surface); --ui-h: 40px;");
    const alias = defineTokens("alias", { h: `${one.h}` });
    expect(compileTokens(alias, { constants: ".theme", sources: [] })).toContain(
      "--alias-h: var(--ui-h)",
    );
    expect(`${tokenRef("grid", "minColumn")}`).toBe("var(--grid-min-column)");
  });
  test("mixed source groups route each declaration to its own host", () => {
    const tokens = defineTokens("button", {
      color: ["white", "black"],
      height: app.by.density(["32px", "36px"]),
      padding: button.by.size(["4px", "8px"]),
      radius: "4px",
    });
    const output = compileTokens(tokens, {
      constants: ".button",
      sources: [
        { options: app, selector: ".theme" },
        { options: button, selector: ".button" },
        { options: "scheme", selector: ".theme" },
      ],
    });
    expect(output).toContain(
      '.theme:where([data-meowui-color-scheme="dark"]) {\n  --button-color: black;',
    );
    expect(output).toContain(
      '.theme:where([data-option-app-density="compact"]) {\n  --button-height: 32px;',
    );
    expect(output).toContain(
      '.button:where([data-option-button-size="small"]) {\n  --button-padding: 4px;',
    );
    expect(output).toContain(".button {\n  --button-radius: 4px;");
    expect(output).toContain("@media (prefers-color-scheme: dark)");
    expect(output).not.toContain(".theme {"); // no unconditional child defaults
  });
  test("same textual branches retain dependency and non-color schemes", () => {
    const tokens = defineTokens("ui", {
      shadow: ["0 1px 2px #ddd", "0 2px 4px #111"],
      alias: ["var(--base)", "var(--base)"],
    });
    const output = compileTokens(tokens, {
      constants: ".theme",
      sources: [{ options: "scheme", selector: ".theme" }],
    });
    expect(output).toContain("--ui-shadow: 0 2px 4px #111");
    expect(output.match(/--ui-alias:/g)?.length).toBe(4); // light, dark, auto-light, auto-dark
    expect(output).not.toContain("light-dark(");
  });
  test("selection preserves explicit fields, when matches same node", () => {
    expect(app.select({ density: "compact" }).attributes).toEqual({
      "data-option-app-density": "compact",
    });
    expect(app.select({}).attributes).toEqual({});
    expect(String(app.when({ scheme: "auto", density: "normal" }))).toBe(
      '&:where([data-meowui-color-scheme="auto"][data-option-app-density="normal"])',
    );
    const other = defineOptions("other", { density: ["compact", "normal"] });
    expect(app.attribute("density")).not.toBe(other.attribute("density"));
    expect(app.attribute("scheme")).toBe(other.attribute("scheme"));
  });
  test("method-like option names are ordinary custom axes", () => {
    const options = defineOptions("safe", {
      by: ["yes", "no"],
      select: ["one", "two"],
      when: ["on", "off"],
    });
    expect(options.by.select(["1", "2"]).values).toEqual({ one: "1", two: "2" });
    expect(options.select({ when: "on" }).attributes).toHaveProperty("data-option-safe-when", "on");
  });
  test("untyped inputs fail rather than fall back or silently collide", () => {
    expect(() => defineOptions("bad", { scheme: ["x", "y"] } as any)).toThrow();
    expect(() => defineOptions("bad", { size: ["small", "small"] })).toThrow();
    expect(() => app.by.density(["32px"] as any)).toThrow();
    expect(() => app.by.density({ compact: "32px", typo: "36px" } as any)).toThrow();
    expect(() => app.select({ typo: "x" } as any)).toThrow();
    expect(() => app.select({ density: undefined } as any)).toThrow();
    expect(() => defineTokens("bad", { x: ["a", "b", "c"] } as any)).toThrow();
    expect(() => defineTokens("bad", { x: 32 } as any)).toThrow();
    expect(() => defineTokens("bad", { "a-b": "1", a: { b: "2" } })).toThrow(/collision/);
    expect(() => defineOptions("bad", { fontSize: ["a"], "font-size": ["a"] })).toThrow();
  });
  test("assembly rejects missing or conflicting source bindings", () => {
    const tokens = defineTokens("ui", { h: app.by.density(["1", "2"]) });
    expect(() => compileTokens(tokens, { constants: ".theme", sources: [] })).toThrow(
      /Missing source/,
    );
    const conflict = defineOptions("app", { density: ["dense", "normal"] });
    expect(() =>
      compileTokens(tokens, {
        constants: ".theme",
        sources: [{ options: conflict, selector: ".theme" }],
      }),
    ).toThrow(/Conflicting source/);
    expect(() =>
      compileTokens(tokens, {
        constants: ".theme",
        sources: [
          { options: app, selector: ".theme" },
          { options: app, selector: ".elsewhere" },
        ],
      }),
    ).toThrow(/Conflicting source/);
  });
});
