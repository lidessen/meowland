import { expect, test } from "bun:test";
import { compileTokens, defineOptions, defineTokens } from "../../src/index";
import { defineTheme } from "../../src/assembly";

const options = defineOptions("root", { density: ["compact", "normal"] });
const conflicting = defineOptions("root", { density: ["compact", "wide"] });
const first = defineTokens("component", {
  gap: options.by.density(["4px", "8px"]),
});
const second = defineTokens("component-other", {
  gap: conflicting.by.density(["4px", "12px"]),
});
const fragment = { text: "", toString: () => "" };

test("token source conflicts are distinct from component metadata validation", () => {
  expect(() =>
    compileTokens([first, second], {
      constants: ".theme",
      sources: [{ options, selector: ".theme" }],
    }),
  ).toThrow("Conflicting source definition");

  expect(() =>
    defineTheme({
      options,
      defaults: { scheme: "auto", density: "normal" },
      tokens: [first],
      styles: fragment,
    }),
  ).not.toThrow();
});
