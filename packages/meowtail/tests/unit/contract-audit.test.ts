import { expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import baseline from "./contract-baseline.json";

const root = resolve(import.meta.dir, "../..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");
const stories = new Set(readdirSync(resolve(root, "stories")));
const mutable = /^(disabled|readOnly|open|value|checked|pressed|selected|expanded|labels)$/;
type Violation = { component: string; kind: string; detail: string };

function interfaceBody(text: string, name: string): string | undefined {
  const match = new RegExp(`(?:export\\s+)?interface\\s+${name}\\b[^\\{]*\\{`).exec(text);
  if (!match) return undefined;
  const start = match.index + match[0].length;
  let depth = 1;
  for (let i = start; i < text.length; i++) {
    if (text[i] === "{") depth++;
    if (text[i] === "}" && --depth === 0) return text.slice(start, i);
  }
  throw new Error(`Unclosed interface ${name}`);
}

function audit(readSource = read, storyFiles = stories) {
  const files = ["components", "chat"].flatMap((dir) =>
    readdirSync(resolve(root, `src/${dir}`))
      .filter((file) => /\.tsx?$/.test(file))
      .map((file) => ({ path: `src/${dir}/${file}`, text: readSource(`src/${dir}/${file}`) })),
  );
  const violations: Violation[] = [];
  const components: { name: string; source: string }[] = [];
  const registry = readSource("src/registry/index.ts");
  const entries = registry.match(/export const meowUIComponents\s*=\s*\[([\s\S]*?)\]/)?.[1];
  if (!entries) throw new Error("Cannot read meowUIComponents");
  const registered = entries
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  const registeredSymbols = new Set(registered.map((entry) => entry.split(".").at(-1)));
  const exports = new Map<string, string>();
  for (const dir of ["components", "chat"]) {
    const index = readSource(`src/${dir}/index.ts`);
    for (const match of index.matchAll(/export\s*\{([^}]+)\}\s*from\s*["']\.\/([^"']+)["']/gs)) {
      for (const name of match[1]!.split(",").map((part) => part.trim())) {
        if (/^[A-Z]\w*$/.test(name) && !registeredSymbols.has(name))
          exports.set(name, `src/${dir}/${match[2]}.tsx`);
      }
    }
  }
  for (const entry of [...registered, ...exports.keys()]) {
    const symbol = entry.split(".").at(-1)!;
    if (!/^\w+$/.test(symbol)) throw new Error(`Cannot read registry entry ${entry}`);
    const candidates = files.filter(({ path, text }) =>
      exports.has(symbol)
        ? path === exports.get(symbol)
        : new RegExp(`\\b${symbol}\\.meta\\s*=`).test(text),
    );
    if (candidates.length !== 1) throw new Error(`Cannot resolve registry entry ${entry}`);
    const source = candidates[0]!;
    const target = source.text.match(new RegExp(`\\b${symbol}\\.meta\\s*=\\s*(\\w+)`))?.[1];
    const isMetaReference = target && source.text.includes(`${symbol}.meta = ${target}.meta`);
    const metaOwner = isMetaReference
      ? `\\b${target}\\.meta`
      : target
        ? `(?:const|let)\\s+${target}`
        : `\\b${symbol}\\.meta`;
    const meta = source.text.match(
      new RegExp(`${metaOwner}\\s*=\\s*\\{[\\s\\S]*?\\bname\\s*:\\s*["']([^"']+)["']`),
    );
    const name = exports.has(symbol)
      ? symbol.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()
      : meta?.[1];
    if (!name) throw new Error(`Cannot resolve metadata for ${entry}`);
    components.push({ name, source: source.path });
    if (!storyFiles.has(`${name}.stories.tsx`))
      violations.push({ component: name, kind: "story", detail: `${name}.stories.tsx` });

    const start = source.text.search(new RegExp(`export\\s+function\\s+${symbol}\\s*\\(`));
    const metaEnd = source.text.search(new RegExp(`\\b${symbol}\\.meta\\s*=`));
    const nextFunction = source.text.slice(start + 1).search(/export\s+function\s+\w+\s*\(/);
    const ends = [metaEnd, nextFunction < 0 ? -1 : start + 1 + nextFunction].filter(
      (end) => end > start,
    );
    const end = ends.length ? Math.min(...ends) : source.text.length;
    if (start < 0 || end < start) throw new Error(`Cannot inspect function for ${entry}`);
    const body = source.text.slice(start, end);
    const propType = body
      .match(/\}\s*:\s*(\w+Props)\s*[,)]|\b\w+\s*:\s*(\w+Props)\s*[,)]/)
      ?.slice(1)
      .find(Boolean);
    if (
      !propType &&
      !/\}\s*:\s*(?:\{|Props\b)/.test(
        body.slice(0, body.indexOf("context:") < 0 ? body.indexOf(")") : body.indexOf("context:")),
      )
    )
      throw new Error(`Cannot inspect props for ${entry}`);
    // Inspect the component's own named interface. Nested item models are structural data.
    const propsSource = propType
      ? (files.find(({ text }) =>
          new RegExp(`^(?:export\\s+)?(?:interface|type)\\s+${propType}\\b`, "m").test(text),
        )?.text ?? source.text)
      : source.text;
    const declaredProps = propType
      ? (interfaceBody(propsSource, propType) ??
        propsSource.match(new RegExp(`(?:export\\s+)?type\\s+${propType}\\s*=([\\s\\S]*?);`))?.[1])
      : undefined;
    if (propType && declaredProps === undefined)
      throw new Error(`Cannot inspect ${propType} for ${entry}`);
    for (const match of (declaredProps ?? body.slice(0, body.indexOf("context:"))).matchAll(
      /(?:^\s*|[;{]\s*)(\w+)\??\s*:\s*([^;\n}]+)(?=[;\n}]|$)/gm,
    )) {
      const [, prop, type] = match;
      if (
        prop &&
        type &&
        mutable.test(prop) &&
        !/\b(?:MaybeSignal|ReadableSignal|Signal)\b/.test(type)
      ) {
        violations.push({ component: name, kind: "liveness", detail: prop });
      }
    }
    const occurrences = new Map<string, number>();
    for (const match of body.matchAll(
      /\b(data-(?:active|expanded|open|selected))\s*=|["'](data-(?:active|expanded|open|selected))["']\s*:|\bsetAttribute\(\s*["'](data-(?:active|expanded|open|selected))["']/g,
    )) {
      const attr = (match[1] ?? match[2] ?? match[3])!;
      const count = (occurrences.get(attr) ?? 0) + 1;
      occurrences.set(attr, count);
      // Only the existing selection expressions are recognized without review.
      const selectedValue = body.slice(match.index, match.index + 200);
      if (
        attr === "data-selected" &&
        count === 1 &&
        ((name === "item" &&
          selectedValue.startsWith('data-selected={selected ? "true" : undefined}')) ||
          (name === "table" &&
            /^data-selected=\{derived\(\(\) =>\s*selectedState\.value\.includes\(row\.value\.id\)/.test(
              selectedValue,
            )))
      )
        continue;
      violations.push({ component: name, kind: "dom-state", detail: `${attr} #${count}` });
    }
  }
  return {
    components: components.sort((a, b) => a.name.localeCompare(b.name)),
    violations: violations.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
  };
}

const current = audit();
if (process.env.CONTRACT_AUDIT_REPORT) console.log(JSON.stringify(current));

test("component contract violations do not grow beyond the recorded baseline", () => {
  const known = new Set(baseline.violations.map((violation) => JSON.stringify(violation)));
  const added = current.violations.filter((violation) => !known.has(JSON.stringify(violation)));
  expect(added).toEqual([]);
});

test("the audit detects new static props, legacy state, and missing stories", () => {
  const changed = (path: string) => {
    const text = read(path);
    if (path !== "src/components/button.tsx") return text;
    return text
      .replace(
        '  className?: Props["className"];',
        '  disabled?: boolean;\n  className?: Props["className"];',
      )
      .replace("      <a\n", "      <a data-open={true} data-selected={true}\n");
  };
  const withoutStory = new Set(stories);
  withoutStory.delete("button.stories.tsx");
  const findings = audit(changed, withoutStory).violations;
  expect(findings).toContainEqual({ component: "button", kind: "liveness", detail: "disabled" });
  expect(findings).toContainEqual({
    component: "button",
    kind: "dom-state",
    detail: "data-open #1",
  });
  expect(findings).toContainEqual({
    component: "button",
    kind: "dom-state",
    detail: "data-selected #1",
  });
  expect(findings).toContainEqual({
    component: "button",
    kind: "story",
    detail: "button.stories.tsx",
  });
});
