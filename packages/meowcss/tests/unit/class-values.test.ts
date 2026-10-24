import { expect, test } from "bun:test";
import { css, cx, defineClassValue } from "../../src/index";

const catalog = {};
const padding = defineClassValue("ui-p-panel", 10, "padding: 1rem;", catalog);
const background = defineClassValue("ui-bg-panel", 20, "background: white;", catalog);
const conflicting = defineClassValue("ui-p-compact", 5, "padding: 0.5rem;", catalog);
const unrelated = defineClassValue("other-p-reset", 1, "padding: 0;", {});

test("cx composes class values and strings while retaining class names", () => {
  const panel = cx("host-panel", [padding, false, null], undefined, background);
  expect(String(panel)).toBe("host-panel ui-p-panel ui-bg-panel");
  expect(panel.className).toBe("host-panel ui-p-panel ui-bg-panel");
  expect(String(cx())).toBe("");
});

test("class declarations expand in stable catalog order rather than cx argument order", () => {
  const fragment = css`
    .panel {
      ${cx(background, padding, conflicting)}
    }
  `;
  expect(fragment.text).toContain("padding: 0.5rem;\npadding: 1rem;\nbackground: white;");
});

test("numeric order is scoped to catalog identity", () => {
  const fragment = css`
    .panel {
      ${cx(unrelated, background, padding)}
    }
  `;
  expect(fragment.text).toContain("padding: 0;\npadding: 1rem;\nbackground: white;");
});

test("plain strings are valid class inputs but cannot expand as declarations", () => {
  const value = cx(padding, "host-panel");
  expect(String(value)).toBe("ui-p-panel host-panel");
  expect(
    () => css`
      .panel {
        ${value}
      }
    `,
  ).toThrow("Plain class strings");
});

test("class values validate names, order, and declaration fragments", () => {
  expect(() => defineClassValue("two classes", 0, "color: red;")).toThrow("one nonempty");
  expect(() => defineClassValue("ui-invalid", Number.NaN, "color: red;")).toThrow("finite");
  expect(() => defineClassValue("ui-invalid", 0, " ")).toThrow("nonempty");
});

test("composite declaration fragments preserve nested at-rules", () => {
  const responsive = defineClassValue(
    "ui-width-wide",
    30,
    "@media (min-width: 48rem) { width: 48rem; }",
    catalog,
  );
  const fragment = css`
    .panel {
      ${cx(responsive, padding)}
    }
  `;
  expect(fragment.text).toContain("padding: 1rem;\n@media (min-width: 48rem) { width: 48rem; }");
});
