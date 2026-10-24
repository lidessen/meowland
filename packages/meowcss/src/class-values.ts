/** A class name with declaration metadata for deterministic CSS expansion. */
export interface ClassValue {
  readonly className: string;
  toString(): string;
}

export type ClassNameInput =
  | ClassValue
  | string
  | false
  | null
  | undefined
  | readonly ClassNameInput[];

export type ClassCatalog = object | symbol;

interface DeclarationEntry {
  readonly catalog: ClassCatalog;
  readonly order: number;
  readonly text: string;
}

interface ValueMetadata {
  readonly declarations: readonly DeclarationEntry[];
  readonly hasPlainClass: boolean;
}

const values = new WeakMap<ClassValue, ValueMetadata>();

function makeValue(className: string, metadata: ValueMetadata): ClassValue {
  const value = Object.freeze({
    className,
    toString: () => className,
  });
  values.set(value, Object.freeze(metadata));
  return value;
}

/** Creates a theme-owned class value; `order` is its position in that theme's catalog. */
export function defineClassValue(
  className: string,
  order: number,
  declarations: string,
  catalog: ClassCatalog = {},
): ClassValue {
  if (!className.trim() || /\s/.test(className))
    throw new Error("Class values need one nonempty class name");
  if (!Number.isFinite(order)) throw new Error("Class value order must be finite");
  if (typeof declarations !== "string" || !declarations.trim())
    throw new Error("Class value declarations must be nonempty CSS text");
  return makeValue(className, {
    declarations: Object.freeze([{ catalog, order, text: declarations }]),
    hasPlainClass: false,
  });
}

function appendInput(
  input: ClassNameInput,
  classNames: string[],
  declarations: DeclarationEntry[],
  state: {
    hasPlainClass: boolean;
    activeArrays: Set<readonly ClassNameInput[]>;
  },
): void {
  if (input === false || input === null || input === undefined) return;
  if (typeof input === "string") {
    const className = input.trim();
    if (!className) return;
    classNames.push(className);
    state.hasPlainClass = true;
    return;
  }
  if (Array.isArray(input)) {
    const list = input as readonly ClassNameInput[];
    if (state.activeArrays.has(list)) throw new Error("Class value lists cannot be circular");
    state.activeArrays.add(list);
    for (const child of list) appendInput(child, classNames, declarations, state);
    state.activeArrays.delete(list);
    return;
  }
  if (typeof input !== "object") throw new Error("Unsupported class value input");
  const classValue = input as ClassValue;
  const metadata = values.get(classValue);
  if (!metadata) throw new Error("Expected a class value created by defineClassValue or cx");
  if (classValue.className) classNames.push(classValue.className);
  declarations.push(...metadata.declarations);
  state.hasPlainClass ||= metadata.hasPlainClass;
}

/** Composes classes without interpreting names or resolving stylesheet conflicts. */
export function cx(...inputs: readonly ClassNameInput[]): ClassValue {
  const classNames: string[] = [];
  const declarations: DeclarationEntry[] = [];
  const state = {
    hasPlainClass: false,
    activeArrays: new Set<readonly ClassNameInput[]>(),
  };
  for (const input of inputs) appendInput(input, classNames, declarations, state);
  return makeValue(classNames.join(" "), {
    declarations: Object.freeze(declarations),
    hasPlainClass: state.hasPlainClass,
  });
}

/** Internal adapter used by CSS templates to preserve value metadata. */
export function classDeclarations(value: ClassValue): string {
  const metadata = values.get(value);
  if (!metadata) throw new Error("Expected a class value created by defineClassValue or cx");
  if (metadata.hasPlainClass)
    throw new Error("Plain class strings cannot be expanded into CSS declarations");
  const ordered = [...metadata.declarations];
  const catalogOrder = new Map<ClassCatalog, number>();
  for (const entry of ordered) {
    if (!catalogOrder.has(entry.catalog)) catalogOrder.set(entry.catalog, catalogOrder.size);
  }
  return ordered
    .map((entry, index) => ({ ...entry, index }))
    .sort((left, right) => {
      const catalogDifference = catalogOrder.get(left.catalog)! - catalogOrder.get(right.catalog)!;
      if (catalogDifference) return catalogDifference;
      return left.order - right.order || left.index - right.index;
    })
    .map((entry) => entry.text)
    .join("\n");
}

/** Internal adapter used to distinguish class values from ordinary CSS interpolations. */
export function isClassValue(value: unknown): value is ClassValue {
  return typeof value === "object" && value !== null && values.has(value as ClassValue);
}
