import { defineThemeWithSourceResolver, type ThemeDefinition } from "../assembly";
import { isTokenSet, type Options, type TokenSet } from "../values";
import type { PartDescriptor } from "meowjsx";
import type { CSSFragment } from "./fragments";

type Defaults<O extends Options<any>> = {
  [K in keyof O["axes"]]: O["axes"][K][number];
} & { scheme: "light" | "dark" | "auto" };

/** Constants normally belong to the theme root; instance-local defaults opt into a part. */
export interface ScopedTokens {
  readonly at: PartDescriptor;
  readonly values: TokenSet;
}

function selectorForPart(part: PartDescriptor): string {
  return `:where([data-meowui-part=${JSON.stringify(`${part.component}/${part.part}`)}])`;
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
  const constantScopes = new Map<TokenSet, string>();
  const groups: TokenSet[] = config.tokens.map((entry) => {
    if (isTokenSet(entry)) return entry;
    if (!entry.at || !isTokenSet(entry.values))
      throw new Error("Expected tokens or a scoped token definition");
    constantScopes.set(entry.values, selectorForPart(entry.at));
    return entry.values;
  });
  return defineThemeWithSourceResolver(
    {
      options: config.options,
      defaults: config.defaults,
      tokens: groups.map((values) => {
        const at = constantScopes.get(values);
        return at ? { at, values } : values;
      }),
      styles: config.styles,
    },
    (attribute) => `:where([${attribute}])`,
  );
}
