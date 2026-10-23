import { describe, expect, test } from "bun:test";
import { auditCSS, auditDeclarations, css, type AuditRule } from "meowcss";

const literalColor: AuditRule = {
  name: "literal-color",
  message: "Use a color role.",
  properties: /.*/,
  violates: ({ value }) => /#[0-9a-f]{3,8}\b/i.test(value.replace(/url\([^)]*\)/g, "")),
};

describe("CSS audit", () => {
  test("reads declarations from nested rules and at-rules, skipping custom properties and comments", () => {
    const declarations = auditDeclarations(css`
      /* color: #fff; */
      .card {
        --card-ink: #111;
        color: var(--card-ink);
        &:hover {
          background: #eee;
        }
        @media (hover: hover) {
          border-color: red;
        }
      }
      .icon {
        background: url("data:image/svg+xml,a;b{c}");
      }
    `);
    expect(declarations.map(({ property, selector }) => `${selector} ${property}`)).toEqual([
      ".card color",
      "&:hover background",
      "@media (hover: hover) border-color",
      ".icon background",
    ]);
    expect(declarations[1]!.line).toBe(7);
  });

  test("reports each rule violation with its place and lets the caller accept one", () => {
    const sheet = ".a { color: #fff; background: url('x.svg#a1b2c3') } .b { color: #000 }";
    expect(auditCSS(sheet, [literalColor]).map((v) => `${v.selector}:${v.value}`)).toEqual([
      ".a:#fff",
      ".b:#000",
    ]);
    expect(auditCSS(sheet, [literalColor], { allow: (v) => v.selector === ".b" })).toHaveLength(1);
  });
});
