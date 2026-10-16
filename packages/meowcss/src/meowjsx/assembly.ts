import { defineTheme as assembleTheme, type ThemeDefinition } from "../assembly";
import type { CSSFragment } from "./fragments";
import type { ComponentContract } from "meowjsx";
import { partSelector, type PartSelector, type StylePropsBinding } from "./parts";
import { isTokenSet, type Options, type Selection, type TokenSet } from "../values";

type Defaults<O extends Options<any>> = {
  [K in keyof O["axes"]]: O["axes"][K][number];
} & { scheme: "light" | "dark" | "auto" };

/** Constants normally belong to the theme root; instance-local defaults opt into a part. */
export interface ScopedTokens {
  readonly at: PartSelector;
  readonly values: TokenSet;
}

export function defineTheme<O extends Options<any>>(config: {
  options: O;
  defaults: Defaults<NoInfer<O>>;
  tokens: readonly (TokenSet | ScopedTokens)[];
  styles: CSSFragment | readonly CSSFragment[];
}): ThemeDefinition {
  for (const field of ["scheme", ...Object.keys(config.options.axes)]) {
    if (!Object.hasOwn(config.defaults, field)) throw new Error(`Missing theme default: ${field}`);
  }
  const fragments = Array.isArray(config.styles) ? config.styles : [config.styles];
  const components = new Map<string, ComponentContract>();
  const add = (contract: ComponentContract) => {
    const existing = components.get(contract.name);
    if (existing && JSON.stringify(existing) !== JSON.stringify(contract)) {
      throw new Error(`Conflicting component definition: ${contract.name}`);
    }
    components.set(contract.name, contract);
  };
  for (const fragment of fragments) for (const contract of fragment.dependencies) add(contract);
  const constantScopes = new Map<TokenSet, string>();
  const groups: TokenSet[] = config.tokens.map((entry) => {
    if (isTokenSet(entry)) return entry;
    const scoped = entry as ScopedTokens;
    if (!scoped.at || !isTokenSet(scoped.values))
      throw new Error("Expected tokens or a scoped token definition");
    add(scoped.at.contract);
    constantScopes.set(scoped.values, String(scoped.at));
    return scoped.values;
  });
  const sources: { options: Options<any> | "scheme"; selector: string }[] = [];
  const carriers = new Map<string, { options: Options<any>; selectors: Set<string> }>();
  for (const contract of components.values()) {
    const binding = (contract as ComponentContract & { styleProps?: StylePropsBinding }).styleProps;
    if (!binding) continue;
    const selectors = binding.parts.map((part) => String(partSelector(contract, part)));
    if (!selectors.length) throw new Error(`No style carrier: ${contract.name}`);
    const existing = carriers.get(binding.options.name);
    if (existing && JSON.stringify(existing.options.axes) !== JSON.stringify(binding.options.axes))
      throw new Error(`Conflicting option definition: ${binding.options.name}`);
    const carrier = existing ?? { options: binding.options, selectors: new Set<string>() };
    for (const selector of selectors) carrier.selectors.add(selector);
    carriers.set(binding.options.name, carrier);
  }
  for (const { options, selectors } of carriers.values())
    sources.push({ options, selector: `:where(${[...selectors].join(",")})` });
  return assembleTheme({
    options: config.options,
    defaults: config.defaults,
    tokens: groups.map((values) => {
      const at = constantScopes.get(values);
      return at ? { at, values } : values;
    }),
    styles: fragments,
    sources,
  });
}
