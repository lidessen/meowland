import type { CSSFragment } from "./fragments";
import {
  compileTokens,
  isTokenSet,
  type Options,
  type Selection,
  type TokenBinding,
  type TokenSet,
} from "./values";

type Defaults<O extends Options<any>> = {
  [K in keyof O["axes"]]: O["axes"][K][number];
} & { scheme: "light" | "dark" | "auto" };

export interface ThemeDefinition {
  readonly name: string;
  readonly defaults: Selection;
  readonly cssText: string;
}

/** An explicit selector resets constants; conditional values follow their source binding. */
export interface ScopedTokens {
  readonly at: string;
  readonly values: TokenSet;
}

function assembleTheme<O extends Options<any>>(
  config: {
    options: O;
    defaults: Defaults<NoInfer<O>>;
    tokens: readonly (TokenSet | ScopedTokens)[];
    styles: CSSFragment | readonly CSSFragment[];
    sources?: TokenBinding["sources"];
  },
  resolveSource?: TokenBinding["resolveSource"],
): ThemeDefinition {
  for (const field of ["scheme", ...Object.keys(config.options.axes)]) {
    if (!Object.hasOwn(config.defaults, field)) throw new Error(`Missing theme default: ${field}`);
  }
  const defaults = config.options.select(config.defaults);
  const fragments = Array.isArray(config.styles) ? config.styles : [config.styles];
  const constantScopes = new Map<TokenSet, string>();
  const groups = config.tokens.map((entry) => {
    if (isTokenSet(entry)) return entry;
    if (!entry || typeof entry.at !== "string" || !entry.at.trim() || !isTokenSet(entry.values))
      throw new Error("Expected tokens or an explicit scoped token definition");
    constantScopes.set(entry.values, entry.at);
    return entry.values;
  });
  const scope = ":where([data-meowui-scope])";
  const declarations = compileTokens(groups, {
    constants: `:where([data-meowui-theme-root="${config.options.name}"])`,
    constantScopes,
    sources: [
      { options: config.options, selector: scope },
      { options: "scheme", selector: scope },
      ...(config.sources ?? []),
    ],
    resolveSource,
  });
  return Object.freeze({
    name: config.options.name,
    defaults,
    cssText: [declarations, ...fragments.map((fragment) => fragment.text)].join("\n"),
  });
}

/** A static attribute snapshot; no subscriptions, JSX runtime or DOM access. */
export function themeAttributes(
  theme?: ThemeDefinition,
  config?: Selection,
): Record<string, string> {
  return {
    "data-meowui-scope": "",
    ...(theme ? { "data-meowui-theme-root": theme.name } : {}),
    ...theme?.defaults.attributes,
    ...config?.attributes,
  };
}

export function defineTheme<O extends Options<any>>(config: {
  options: O;
  defaults: Defaults<NoInfer<O>>;
  tokens: readonly (TokenSet | ScopedTokens)[];
  styles: CSSFragment | readonly CSSFragment[];
  sources?: TokenBinding["sources"];
}): ThemeDefinition {
  return assembleTheme(config);
}

/** Internal bridge for the JSX adapter's option-attribute source lookup. */
export function defineThemeWithSourceResolver<O extends Options<any>>(
  config: {
    options: O;
    defaults: Defaults<NoInfer<O>>;
    tokens: readonly (TokenSet | ScopedTokens)[];
    styles: CSSFragment | readonly CSSFragment[];
    sources?: TokenBinding["sources"];
  },
  resolver: NonNullable<TokenBinding["resolveSource"]>,
): ThemeDefinition {
  return assembleTheme(config, resolver);
}
