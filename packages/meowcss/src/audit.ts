/** One declaration found in CSS text. Custom property declarations are where values are defined, so they are never audited. */
export interface AuditDeclaration {
  readonly property: string;
  readonly value: string;
  readonly selector: string;
  readonly line: number;
}

/** A rule names the declarations it inspects and decides whether one breaks the scale. */
export interface AuditRule {
  readonly name: string;
  readonly message: string;
  readonly properties: readonly string[] | RegExp;
  /** True when the declaration is a violation. */
  violates(declaration: AuditDeclaration): boolean;
}

export interface AuditViolation extends AuditDeclaration {
  readonly rule: string;
  readonly message: string;
}

export interface AuditOptions {
  /** Return true to accept one declaration a rule would flag, with the reason kept beside the call. */
  readonly allow?: (violation: AuditViolation) => boolean;
}

/** Every declaration in CSS text, nested rules included, with the selector or at-rule that holds it. */
export function auditDeclarations(input: string | { readonly text: string }): AuditDeclaration[] {
  const text = (typeof input === "string" ? input : input.text).replace(
    /\/\*[\s\S]*?\*\//g,
    (comment) => comment.replace(/[^\n]/g, " "),
  );
  const declarations: AuditDeclaration[] = [];
  const selectors: string[] = [];
  let buffer = "";
  let start = 0;
  let line = 1;
  let depth = 0;
  let quote = "";
  const flush = (end: string) => {
    const source = buffer;
    buffer = "";
    if (end === "{") {
      selectors.push(source.trim());
      return;
    }
    const colon = source.indexOf(":");
    if (colon > 0) {
      const property = source.slice(0, colon).trim().toLowerCase();
      const value = source.slice(colon + 1).trim();
      if (property && !property.startsWith("--") && /^[-a-z]+$/.test(property))
        declarations.push({ property, value, selector: selectors.at(-1) ?? "", line: start });
    }
    if (end === "}") selectors.pop();
  };
  for (const char of text) {
    if (char === "\n") line++;
    if (quote) {
      buffer += char;
      if (char === quote) quote = "";
      continue;
    }
    if (char === '"' || char === "'") quote = char;
    if (char === "(") depth++;
    if (char === ")") depth = Math.max(0, depth - 1);
    if (depth === 0 && (char === "{" || char === "}" || char === ";")) {
      flush(char);
      continue;
    }
    if (!buffer.trim()) start = line;
    buffer += char;
  }
  return declarations;
}

/** Declarations in `input` that a rule flags and `allow` does not accept. */
export function auditCSS(
  input: string | { readonly text: string },
  rules: readonly AuditRule[],
  options: AuditOptions = {},
): AuditViolation[] {
  const violations: AuditViolation[] = [];
  for (const declaration of auditDeclarations(input)) {
    for (const rule of rules) {
      const applies = Array.isArray(rule.properties)
        ? rule.properties.includes(declaration.property)
        : (rule.properties as RegExp).test(declaration.property);
      if (!applies || !rule.violates(declaration)) continue;
      const violation = { ...declaration, rule: rule.name, message: rule.message };
      if (!options.allow?.(violation)) violations.push(violation);
    }
  }
  return violations;
}
