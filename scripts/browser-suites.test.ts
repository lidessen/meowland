import { expect, test } from "bun:test";
import { join } from "node:path";
import {
  browserSuites,
  readWorkspaces,
  selectSuites,
  type BrowserSuite,
  type Workspace,
} from "./browser-suites.ts";

const workspaces: Workspace[] = [
  { dir: "packages/jsx", name: "jsx", dependencies: [] },
  { dir: "packages/ui", name: "ui", dependencies: ["jsx", "book"] },
  { dir: "packages/book", name: "book", dependencies: ["jsx", "ui"] },
  { dir: "packages/slides", name: "slides", dependencies: ["ui"] },
  { dir: "apps/docs", name: "docs", dependencies: ["ui", "slides"] },
];
const suites: BrowserSuite[] = [
  { suite: "jsx", config: "jsx.config.ts", root: "packages/jsx" },
  { suite: "ui", config: "ui.config.ts", root: "packages/ui" },
  { suite: "book", config: "book.config.ts", root: "packages/book" },
  { suite: "slides", config: "slides.config.ts", root: "packages/slides" },
];
const names = (changed: string[]) =>
  selectSuites(changed, workspaces, suites).map((suite) => suite.suite);

test("a change runs its own suite and every suite that depends on it", () => {
  expect(names(["packages/jsx/src/index.ts"])).toEqual(["jsx", "ui", "book", "slides"]);
  expect(names(["packages/slides/src/deck.tsx"])).toEqual(["slides"]);
});

test("a test change runs only its own workspace's suites", () => {
  expect(names(["packages/jsx/tests/browser/render.spec.ts"])).toEqual(["jsx"]);
  expect(
    names(["packages/jsx/tests/browser/render.spec.ts", "packages/slides/src/deck.tsx"]),
  ).toEqual(["jsx", "slides"]);
});

test("workspaces that depend on each other select each other", () => {
  expect(names(["packages/book/src/server.ts"])).toEqual(["ui", "book", "slides"]);
});

test("a workspace without browser suites, or prose, selects nothing", () => {
  expect(names(["apps/docs/document.tsx"])).toEqual([]);
  expect(names(["packages/ui/README.md", "docs/checks.md"])).toEqual([]);
});

test("a file outside every workspace runs every suite", () => {
  expect(names(["bun.lock"])).toEqual(["jsx", "ui", "book", "slides"]);
  expect(names([".github/workflows/checks.yml"])).toEqual(["jsx", "ui", "book", "slides"]);
});

test("every real suite belongs to a workspace and points at its own configuration", () => {
  const real = readWorkspaces(join(import.meta.dir, ".."));
  for (const suite of browserSuites) {
    expect(real.some((workspace) => workspace.dir === suite.root)).toBe(true);
    expect(suite.config.startsWith(`${suite.root}/`)).toBe(true);
  }
  expect(new Set(browserSuites.map((suite) => suite.suite)).size).toBe(browserSuites.length);
});
