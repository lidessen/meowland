import { css, defineClassValue, type ClassValue, type CSSFragment } from "meowcss";
import { uiTokens } from "./tokens";

function kebab(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

/** Hands out stylesheet order for one catalog; each catalog owns its identity and counter. */
function catalogGroups() {
  const identity = {};
  let order = 0;
  return function group<const Key extends string>(
    path: string,
    keys: readonly Key[],
    declarations: (key: Key) => string,
  ): Readonly<Record<Key, ClassValue>> {
    const values = Object.create(null) as Record<Key, ClassValue>;
    for (const key of keys)
      values[key] = defineClassValue(
        `ui-${path}-${kebab(key)}`,
        order++,
        declarations(key),
        identity,
      );
    return Object.freeze(values);
  };
}

function declaration(property: string, value: unknown): string {
  return `${property}: ${String(value)};`;
}

const spaceKeys = [
  "group",
  "section",
  "panel",
  "prose",
  "insetBlock",
  "insetInline",
  "pageBlock",
  "pageInline",
  "pageBlockCompact",
  "pageInlineCompact",
] as const;
type SpaceKey = (typeof spaceKeys)[number];

const surfaceKeys = ["canvas", "raised", "overlay", "fill"] as const;
type SurfaceKey = (typeof surfaceKeys)[number];

function textDeclarations(key: TextKey): string {
  const declarations: Record<TextKey, string> = {
    eyebrow: `color: ${uiTokens.ink.tertiary}; font: ${uiTokens.type.weight.medium} ${uiTokens.type.micro} / ${uiTokens.type.line.micro} ${uiTokens.type.sans}; letter-spacing: ${uiTokens.type.trackingCaps}; text-transform: uppercase;`,
    caption: `color: ${uiTokens.ink.secondary}; font: ${uiTokens.type.weight.regular} ${uiTokens.type.caption} / ${uiTokens.type.line.caption} ${uiTokens.type.sans};`,
    label: `color: ${uiTokens.ink.primary}; font: ${uiTokens.type.weight.medium} ${uiTokens.type.label} / ${uiTokens.type.line.label} ${uiTokens.type.sans};`,
    body: `color: ${uiTokens.ink.primary}; font: ${uiTokens.type.weight.regular} ${uiTokens.type.body} / ${uiTokens.type.leading} ${uiTokens.type.sans};`,
    secondary: `color: ${uiTokens.ink.secondary}; font: ${uiTokens.type.weight.regular} ${uiTokens.type.body} / ${uiTokens.type.leading} ${uiTokens.type.sans};`,
    reading: `color: ${uiTokens.ink.primary}; font: ${uiTokens.type.weight.regular} ${uiTokens.type.readingSize} / ${uiTokens.type.line.reading} ${uiTokens.type.reading};`,
    title: `color: ${uiTokens.ink.primary}; font: ${uiTokens.type.weight.semibold} ${uiTokens.type.title} / ${uiTokens.type.line.title} ${uiTokens.type.display}; letter-spacing: ${uiTokens.type.trackingTight};`,
    heading: `color: ${uiTokens.ink.primary}; font: ${uiTokens.type.weight.semibold} ${uiTokens.type.heading} / ${uiTokens.type.line.heading} ${uiTokens.type.display}; letter-spacing: ${uiTokens.type.trackingTight};`,
    pageTitle: `color: ${uiTokens.ink.primary}; font: ${uiTokens.type.weight.semibold} ${uiTokens.type.pageTitle} / ${uiTokens.type.line.pageTitle} ${uiTokens.type.display}; letter-spacing: ${uiTokens.type.trackingTight};`,
  };
  return declarations[key];
}
const textKeys = [
  "eyebrow",
  "caption",
  "label",
  "body",
  "secondary",
  "reading",
  "title",
  "heading",
  "pageTitle",
] as const;
type TextKey = (typeof textKeys)[number];

function surfaceDeclarations(key: SurfaceKey): string {
  switch (key) {
    case "canvas":
      return `background: ${uiTokens.surface.canvas}; color: ${uiTokens.ink.primary};`;
    case "raised":
      return `border: ${uiTokens.line.width} solid ${uiTokens.line.edge}; border-radius: ${uiTokens.radius.xl}; background: ${uiTokens.surface.raised}; box-shadow: ${uiTokens.shadow.raised}; color: ${uiTokens.ink.primary}; --meowui-focus-halo: ${uiTokens.surface.raised};`;
    case "overlay":
      return `border: 0; border-radius: ${uiTokens.radius.xl}; background: ${uiTokens.surface.overlay}; box-shadow: ${uiTokens.shadow.float}; color: ${uiTokens.ink.primary}; --meowui-focus-halo: ${uiTokens.surface.overlay};`;
    case "fill":
      return `border: 0; border-radius: ${uiTokens.radius.lg}; background: ${uiTokens.surface.fill}; box-shadow: none; color: ${uiTokens.ink.primary};`;
  }
}

function interactiveDeclarations(on: "flat" | "raised", pressed: "active" | "shadow"): string {
  const overlay =
    on === "raised"
      ? (tone: string) => `background-image: linear-gradient(${tone}, ${tone});`
      : (tone: string) => `background-color: ${tone};`;
  const active =
    pressed === "shadow"
      ? `box-shadow: ${uiTokens.shadow.pressed};`
      : overlay(String(uiTokens.state.active));
  return `
    cursor: pointer;
    transition:
      background-color ${uiTokens.motion.response} ${uiTokens.motion.ease},
      box-shadow ${uiTokens.motion.response} ${uiTokens.motion.ease},
      color ${uiTokens.motion.response} ${uiTokens.motion.ease};
    @media (hover: hover) {
      &:hover:not(:disabled, [aria-disabled="true"]) {
        ${overlay(String(uiTokens.state.hover))}
      }
    }
    &:active:not(:disabled, [aria-disabled="true"]) {
      ${active}
      transition-duration: ${uiTokens.motion.instant};
    }
    &:focus-visible {
      outline: 2px solid ${uiTokens.state.focus};
      outline-offset: 2px;
    }
    &:is(:disabled, [aria-disabled="true"]) {
      color: ${uiTokens.ink.tertiary};
      box-shadow: none;
      cursor: not-allowed;
    }
    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  `;
}

/* @__NO_SIDE_EFFECTS__ */
function createCatalog() {
  const group = catalogGroups();
  return Object.freeze({
    p: group("p", spaceKeys, (key: SpaceKey) => declaration("padding", uiTokens.space[key])),
    px: group("px", spaceKeys, (key: SpaceKey) =>
      declaration("padding-inline", uiTokens.space[key]),
    ),
    py: group("py", spaceKeys, (key: SpaceKey) =>
      declaration("padding-block", uiTokens.space[key]),
    ),
    gap: group("gap", ["group", "section", "panel", "prose"] as const, (key) =>
      declaration("gap", uiTokens.space[key]),
    ),
    bg: group(
      "bg",
      [
        "canvas",
        "reading",
        "raised",
        "overlay",
        "fill",
        "field",
        "tint",
        "knockout",
        "scrim",
        "primary",
        "primaryHover",
        "onPrimary",
        "soft",
        "danger",
        "onDanger",
        "accent",
        "accentSoft",
        "accentSelected",
      ] as const,
      (key) => {
        const token = {
          canvas: uiTokens.surface.canvas,
          reading: uiTokens.surface.reading,
          raised: uiTokens.surface.raised,
          overlay: uiTokens.surface.overlay,
          fill: uiTokens.surface.fill,
          field: uiTokens.surface.field,
          tint: uiTokens.surface.tint,
          knockout: uiTokens.surface.knockout,
          scrim: uiTokens.surface.scrim,
          primary: uiTokens.action.primary,
          primaryHover: uiTokens.action.primaryHover,
          onPrimary: uiTokens.action.onPrimary,
          soft: uiTokens.action.soft,
          danger: uiTokens.action.danger,
          onDanger: uiTokens.action.onDanger,
          accent: uiTokens.accent.base,
          accentSoft: uiTokens.accent.soft,
          accentSelected: uiTokens.accent.selected,
        }[key];
        return declaration("background-color", token);
      },
    ),
    color: group(
      "color",
      [
        "primary",
        "secondary",
        "tertiary",
        "chip",
        "inverse",
        "inverseAction",
        "actionPrimary",
        "onPrimary",
        "soft",
        "danger",
        "onDanger",
        "accent",
        "accentInk",
        "info",
        "success",
        "warning",
        "unknown",
        "focus",
      ] as const,
      (key) => {
        const token = {
          primary: uiTokens.ink.primary,
          secondary: uiTokens.ink.secondary,
          tertiary: uiTokens.ink.tertiary,
          chip: uiTokens.ink.chip,
          inverse: uiTokens.inverse.ink,
          inverseAction: uiTokens.inverse.action,
          actionPrimary: uiTokens.action.primary,
          onPrimary: uiTokens.action.onPrimary,
          soft: uiTokens.action.soft,
          danger: uiTokens.action.danger,
          onDanger: uiTokens.action.onDanger,
          accent: uiTokens.accent.base,
          accentInk: uiTokens.accent.ink,
          info: uiTokens.status.info,
          success: uiTokens.status.success,
          warning: uiTokens.status.warning,
          unknown: uiTokens.status.unknown,
          focus: uiTokens.state.focus,
        }[key];
        return declaration("color", token);
      },
    ),
    radius: group("radius", ["xs", "sm", "md", "lg", "xl", "xxl", "full"] as const, (key) =>
      declaration("border-radius", uiTokens.radius[key]),
    ),
    text: group("text", textKeys, textDeclarations),
    surface: group("surface", surfaceKeys, surfaceDeclarations),
    focus: group(
      "focus",
      ["ring", "inset"] as const,
      (key) =>
        `outline: 2px solid ${uiTokens.state.focus}; outline-offset: ${key === "inset" ? "-2px" : "2px"};`,
    ),
    interactive: group(
      "interactive",
      ["flat", "raised", "flatShadow", "raisedShadow"] as const,
      (key) =>
        interactiveDeclarations(
          key.startsWith("flat") ? "flat" : "raised",
          key.endsWith("Shadow") ? "shadow" : "active",
        ),
    ),
    shadow: group(
      "shadow",
      [
        "raised",
        "field",
        "action",
        "filled",
        "thumb",
        "pressed",
        "knob",
        "sheet",
        "float",
        "dock",
      ] as const,
      (key) => declaration("box-shadow", uiTokens.shadow[key]),
    ),
    border: group(
      "border",
      ["width", "edge", "divider", "control", "controlHover"] as const,
      (key) =>
        key === "width"
          ? declaration("border-width", uiTokens.line.width)
          : `border: ${uiTokens.line.width} solid ${uiTokens.line[key]};`,
    ),
    font: group("font", ["sans", "mono"] as const, (key) =>
      declaration("font-family", uiTokens.type[key]),
    ),
  });
}

/** Meowtail's typed class values over `uiTokens`. */
export const ui = /* @__PURE__ */ createCatalog();

/** One rule per catalog value, in catalog order, for themes to place after component rules. */
/* @__NO_SIDE_EFFECTS__ */
function catalogStyles(
  catalog: Readonly<Record<string, Readonly<Record<string, ClassValue>>>>,
): CSSFragment {
  const values = Object.values(catalog).flatMap((group) => Object.values(group));
  // A template call with one hole per value, so `css` expands each value's declarations.
  const strings = values.map((value, index) =>
    index === 0 ? `.${value.className} {\n` : `\n}\n.${value.className} {\n`,
  );
  strings.push("\n}");
  Object.defineProperty(strings, "raw", { value: strings });
  return css(strings as unknown as TemplateStringsArray, ...values);
}

export const utilityStyles: CSSFragment = /* @__PURE__ */ catalogStyles(ui);
