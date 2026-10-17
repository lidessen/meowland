import { expect, test } from "bun:test";
import { validateRegionLayout } from "../../../src/components/region-layout-types";

const fixtures = (await Bun.file(
  new URL("../../fixtures/layout-fixtures.json", import.meta.url),
).json()) as { name: string; valid: boolean; layout?: unknown }[];
for (const fixture of fixtures)
  test(`shared region contract: ${fixture.name}`, () => {
    if (fixture.valid) expect(() => validateRegionLayout(fixture.layout)).not.toThrow();
    else expect(() => validateRegionLayout(fixture.layout)).toThrow();
  });

test("region admission preserves spanning rectangles and rejects disconnected or missing content", () => {
  const layout = {
    areas: [
      ["list", "header"],
      ["list", "body"],
      ["list", "footer"],
    ],
    columns: ["compact", "fill"],
    rows: ["content", "fill", "content"],
    regions: {
      list: { group: "browse" },
      header: { group: "detail" },
      body: { group: "detail", scrollOwner: "content" },
      footer: { group: "detail" },
    },
  } as const;
  expect(validateRegionLayout(layout)).toBe(layout);
  const sparseRow = Array<string>(3);
  sparseRow[0] = "body";
  sparseRow[2] = "other";
  for (const invalid of [
    { areas: [sparseRow], regions: { body: {}, other: {} } },
    {
      ...layout,
      areas: [
        ["list", "header"],
        ["body", "list"],
        [null, "footer"],
      ],
    },
    { ...layout, areas: [["list"], ["list", "body"]] },
    { ...layout, columns: ["fill"] },
    { ...layout, rows: ["content", "200px", "fill"] },
    { ...layout, regions: { ...layout.regions, extra: {} } },
    { ...layout, regions: { ...layout.regions, body: { position: "fixed" } } },
    { ...layout, regions: { ...layout.regions, list: { group: null } } },
    { ...layout, template: "list-detail" },
  ])
    expect(() => validateRegionLayout(invalid)).toThrow();
});

test("region declaration accepts empty cells but requires one complete declaration per area", () => {
  expect(
    validateRegionLayout({
      areas: [
        ["auto", null],
        ["auto", "span"],
      ],
      regions: { auto: {}, span: {} },
    }).areas,
  ).toHaveLength(2);
  for (const invalid of [
    { areas: [[null]], regions: {} },
    { areas: [["body"]], regions: {} },
    { areas: [["body"]], regions: { body: { scrollOwner: "both" } } },
    { areas: [["body"]], regions: { body: { gap: 20 } } },
  ])
    expect(() => validateRegionLayout(invalid)).toThrow();
});
