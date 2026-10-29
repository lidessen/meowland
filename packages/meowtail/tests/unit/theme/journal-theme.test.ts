import { expect, test } from "bun:test";
import { auditCSS } from "meowcss";
import {
  journalTheme,
  journalUiTokenValues,
  meowTheme,
  meowUiTokenValues,
  standardAuditRules,
  standardTheme,
  standardThemeStyles,
  standardUiTokenValues,
} from "../../../src/theme";

const declaredNames = (cssText: string) =>
  [...new Set(cssText.match(/--ui-[a-z0-9-]+(?=\s*:)/g) ?? [])].sort();

test("journal declares exactly the standard ui roles and paints with the standard rules", () => {
  expect(declaredNames(journalTheme.cssText)).toEqual(declaredNames(standardTheme.cssText));
  const rules = standardThemeStyles.map((fragment) => fragment.text).join("\n");
  expect(standardTheme.cssText.endsWith(rules)).toBe(true);
  expect(journalTheme.cssText.endsWith(rules)).toBe(true);
  expect(journalTheme.name).toBe(standardTheme.name);
  expect(auditCSS(journalTheme.cssText, standardAuditRules)).toEqual([]);
});

test("meow declares exactly the standard ui roles and changes only colors", () => {
  expect(declaredNames(meowTheme.cssText)).toEqual(declaredNames(standardTheme.cssText));
  const rules = standardThemeStyles.map((fragment) => fragment.text).join("\n");
  expect(meowTheme.cssText.endsWith(rules)).toBe(true);
  expect(meowTheme.name).toBe(standardTheme.name);
  expect(auditCSS(meowTheme.cssText, standardAuditRules)).toEqual([]);
  for (const group of ["type", "space", "icon", "radius", "shadow", "motion", "layout"] as const)
    expect(meowUiTokenValues[group]).toEqual(standardUiTokenValues[group]);
});

type Pair = readonly [ink: string, surface: string, minimum: number];
const pairs: Pair[] = [
  ...["primary", "reading", "secondary", "tertiary"].flatMap((ink) =>
    ["canvas", "reading", "raised", "fill"].map(
      (surface) => [`ink.${ink}`, `surface.${surface}`, 4.5] as const,
    ),
  ),
  ["ink.chip", "surface.fill", 4.5],
  ["accent.ink", "surface.canvas", 4.5],
  ["accent.ink", "surface.raised", 4.5],
  ["action.onPrimary", "action.primary", 4.5],
  ["action.onDanger", "action.danger", 4.5],
  ["inverse.ink", "inverse.surface", 4.5],
  ...["info", "success", "warning", "danger"].map(
    (status) => [`status.${status}`, "surface.raised", 4.5] as const,
  ),
  ["state.focus", "surface.canvas", 3],
];

function luminance(hex: string): number {
  const value = Number.parseInt(hex.slice(1), 16);
  const [r, g, b] = [value >> 16, (value >> 8) & 255, value & 255].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light! + 0.05) / (dark! + 0.05);
}

function read(values: object, path: string, scheme: 0 | 1): string {
  const leaf = path
    .split(".")
    .reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], values);
  return (Array.isArray(leaf) ? leaf[scheme] : leaf) as string;
}

test("standard, journal and meow keep text, actions and focus readable in both schemes", () => {
  for (const [name, values] of [
    ["standard", standardUiTokenValues],
    ["journal", journalUiTokenValues],
    ["meow", meowUiTokenValues],
  ] as const) {
    for (const scheme of [0, 1] as const) {
      for (const [ink, surface, minimum] of pairs) {
        const ratio = contrast(read(values, ink, scheme), read(values, surface, scheme));
        expect({ name, scheme, ink, surface, pass: ratio >= minimum }).toEqual({
          name,
          scheme,
          ink,
          surface,
          pass: true,
        });
      }
    }
  }
});
