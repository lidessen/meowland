/** CSS text can retain adapter-owned dependencies without interpreting their contracts. */
export interface CSSFragment<Dependency = unknown> {
  readonly text: string;
  readonly dependencies: readonly Dependency[];
  toString(): string;
}

export interface CSSValue<Dependency = never> {
  readonly dependencies?: readonly Dependency[];
  toString(): string;
}

export function css<Dependency = never>(
  strings: TemplateStringsArray,
  ...values: (string | number | CSSValue<Dependency>)[]
): CSSFragment<Dependency> {
  const dependencies = new Set<Dependency>();
  for (const value of values) {
    if (typeof value !== "object" || value === null || !value.dependencies) continue;
    for (const dependency of value.dependencies) dependencies.add(dependency);
  }
  const text = strings.reduce(
    (text, part, index) => text + part + (index < values.length ? String(values[index]) : ""),
    "",
  );
  return Object.freeze({
    text,
    dependencies: Object.freeze([...dependencies]),
    toString: () => text,
  });
}
