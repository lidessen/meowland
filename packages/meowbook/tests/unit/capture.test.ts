import { expect, test } from "bun:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pixelCrop, selectCaptureNodes } from "../../src/capture/selection";
import {
  createCaptureReport,
  summarizeCapture,
  writeCaptureReport,
} from "../../src/capture/report";
import { validateCaptureGeometry, validateCaptureSelection } from "../../src/capture/page";
import type { CaptureInstance, CaptureManifest, CaptureScene } from "../../src/capture/types";

function instance(
  id: string,
  name: string,
  parentId: string | null,
  transparent = false,
): CaptureInstance {
  return {
    id,
    name,
    parentId,
    transparent,
    rects: [],
    visibleRects: [],
    visibility: "no-visual-output",
  };
}

test("depth passes through explicit transparent ancestors while retaining the complete tree", () => {
  const tree = [
    instance("app", "App", null),
    instance("provider", "Provider", "app", true),
    instance("layout", "Layout", "provider", true),
    instance("button", "Button", "layout"),
    instance("label", "Label", "button"),
    instance("sibling", "Sibling", null),
  ];
  const { nodes } = selectCaptureNodes(tree, 1);
  expect(
    nodes.map((node) => [node.id, node.selection, node.captureDepth, node.captureParentId]),
  ).toEqual([
    ["app", "selected", 0, null],
    ["provider", "transparent", 1, "app"],
    ["layout", "transparent", 1, "app"],
    ["button", "selected", 1, "app"],
    ["label", "depth", 2, "button"],
    ["sibling", "selected", 0, null],
  ]);
  expect(nodes.find((node) => node.id === "button")?.parentId).toBe("layout");
  expect(tree[1].transparent).toBe(true);
});

test("select matches all original and actual names, deduplicates nested roots and explicitly photographs transparent roots", () => {
  const tree = [
    instance("root", "Layout", null, true),
    instance("inner", "Layout", "root", true),
    { ...instance("replacement", "ErrorPanel", "inner"), originalName: "Layout" },
    instance("other", "Button", null),
  ];
  const result = selectCaptureNodes(tree, 0, "Layout");
  expect(result.matched).toBe(3);
  expect(
    result.nodes.filter((node) => node.selection === "selected").map((node) => node.id),
  ).toEqual(["root", "inner", "replacement"]);
  expect(
    result.nodes
      .filter((node) => node.selection === "selected")
      .every((node) => node.captureDepth === 0),
  ).toBe(true);
  expect(result.nodes[3].selection).toBe("outside-selection");
  expect(selectCaptureNodes(tree, "all", "ErrorPanel").matched).toBe(1);
});

test("undeclared layout consumes depth and offscreen matched nodes remain selected", () => {
  const tree = [
    instance("root", "Layout", null),
    { ...instance("button", "Button", "root"), visibility: "offscreen" as const },
    instance("label", "Label", "button"),
  ];
  expect(selectCaptureNodes(tree, 0).nodes[1].selection).toBe("depth");
  const result = selectCaptureNodes(tree, 0, "Button");
  expect(result.matched).toBe(1);
  expect(result.nodes[1].selection).toBe("selected");
  expect(result.nodes[1].visibility).toBe("offscreen");
});

test("DPR crops use PNG dimensions, round outward and bound padding to the original frame", () => {
  expect(
    pixelCrop(
      { x: 10.25, y: 5.25, width: 20.5, height: 10.5 },
      { width: 100, height: 50 },
      { width: 200, height: 100 },
      4,
    ),
  ).toEqual({ x: 12, y: 2, width: 58, height: 38 });
  expect(
    pixelCrop(
      { x: 0.5, y: 40, width: 99.5, height: 10 },
      { width: 100, height: 50 },
      { width: 125, height: 63 },
      4,
    ),
  ).toEqual({ x: 0, y: 45, width: 125, height: 18 });
});

function scene(): CaptureScene {
  const nodes = selectCaptureNodes([
    instance("provider", "Provider", null, true),
    { ...instance("one", "Button", "provider"), visibility: "offscreen" },
    instance("two", "Button", "provider"),
  ]).nodes;
  nodes[1].image = "s001/nodes/n001.png";
  nodes[2].image = "s001/nodes/n001.png";
  return {
    story: {
      id: "buttons/default",
      title: "Buttons",
      file: "buttons.story.tsx",
      exportName: "Default",
      line: 1,
    },
    status: "success",
    matched: 2,
    nodes,
  };
}

function manifest(): CaptureManifest {
  return {
    version: 1,
    createdAt: "2026-10-10T00:00:00.000Z",
    status: "complete",
    input: { depth: 1 },
    scenes: [scene()],
  };
}

test("summary counts unique photo files without merging instance identities and distinguishes unmatched from unexecuted", () => {
  const one = scene();
  const summary = summarizeCapture([
    one,
    { ...one, status: "failed", nodes: [], matched: 0, error: "ready failed" },
    { ...one, status: "unmatched", nodes: [], matched: 0 },
    { ...one, status: "unexecuted", nodes: [], matched: 0 },
  ]);
  expect(summary).toMatchObject({
    requested: 4,
    successful: 1,
    failed: 1,
    unmatched: 1,
    unexecuted: 1,
    images: 1,
    matched: 2,
    transparent: 1,
    offscreen: 1,
  });
  expect(one.nodes.map((node) => node.id)).toEqual(["provider", "one", "two"]);
});

test("offline report embeds recoverable JSON even when fixture names contain script endings", () => {
  const data = manifest();
  const unusual = '</script><img src=x onerror="bad()">&\u2028';
  data.scenes[0].story.title = unusual;
  const html = createCaptureReport(data);
  const embedded = html.match(
    /<script id="capture-manifest" type="application\/json">([\s\S]*?)<\/script>/,
  )?.[1];
  expect(embedded).toBeDefined();
  expect(embedded).not.toContain("<");
  const decoded = JSON.parse(embedded!);
  expect(decoded.scenes[0].story.title).toBe(unusual);
  expect(decoded.summary.images).toBe(1);
});

test("report writes the same complete index and refuses to overwrite an existing run", async () => {
  const directory = await mkdtemp(join(tmpdir(), "meowbook-report-"));
  try {
    const data = manifest();
    const paths = await writeCaptureReport(directory, data);
    const decoded = JSON.parse(await readFile(paths.manifestPath, "utf8"));
    expect(decoded.scenes[0].nodes).toHaveLength(3);
    expect(decoded.summary.images).toBe(1);
    await expect(writeCaptureReport(directory, data)).rejects.toThrow();
    expect(JSON.parse(await readFile(paths.manifestPath, "utf8"))).toEqual(decoded);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("shared validation rejects image allocations and unbounded time/depth before browser work", () => {
  expect(() => validateCaptureGeometry({ width: 4096, height: 4096 }, 2)).toThrow("allocation");
  expect(() => validateCaptureGeometry({ width: 1100, height: 900 }, NaN)).toThrow("DPR");
  expect(() => validateCaptureSelection(1001)).toThrow("depth");
  expect(() => validateCaptureSelection(1, 120001)).toThrow("timeout");
  expect(() => validateCaptureGeometry({ width: 390, height: 844 }, 2)).not.toThrow();
});
