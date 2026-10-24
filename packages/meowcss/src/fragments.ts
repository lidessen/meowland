import { classDeclarations, isClassValue, type ClassValue } from "./class-values";

/** CSS text has no component registry or contract dependencies. */
export interface CSSFragment {
  readonly text: string;
  toString(): string;
}

export interface CSSValue {
  toString(): string;
}

/* @__NO_SIDE_EFFECTS__ */
export function css(
  strings: TemplateStringsArray,
  ...values: (string | number | CSSValue | ClassValue)[]
): CSSFragment {
  const text = strings.reduce((result, part, index) => {
    const value = values[index];
    if (value === undefined) return result + part;
    const interpolation = isClassValue(value) ? classDeclarations(value) : String(value);
    return result + part + interpolation;
  }, "");
  return Object.freeze({ text, toString: () => text });
}
