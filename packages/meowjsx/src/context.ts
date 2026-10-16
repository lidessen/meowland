import type { Child, Component } from "./runtime";

/** A render-tree environment. Targets carry it through deferred child regions. */
export type ContextScope = ReadonlyMap<symbol, unknown>;

export interface Context<T> {
  readonly key: symbol;
  readonly defaultValue: T;
  readonly Provider: Component<{ value: T; children?: Child }>;
}

const providers = new WeakMap<Function, symbol>();
let activeScope: ContextScope | undefined;

/** Semantic identity for runtime observation, independent of function names. */
export function isContextProvider(component: Function): boolean {
  return providers.has(component);
}

export function createContext<T>(defaultValue: T): Context<T> {
  const key = Symbol("meowjsx.context");
  const Provider: Context<T>["Provider"] = ({ children }) => children ?? null;
  providers.set(Provider, key);
  return Object.freeze({ key, defaultValue, Provider });
}

/** Read synchronously while rendering; capture the value before an await/callback. */
export function useContext<T>(context: Context<T>): T {
  return activeScope?.has(context.key) ? (activeScope.get(context.key) as T) : context.defaultValue;
}

/** Runtime/target seam, not a process-wide persistent provider stack. */
export function withContextScope<T>(scope: ContextScope | undefined, run: () => T): T {
  const previous = activeScope;
  activeScope = scope;
  try {
    return run();
  } finally {
    activeScope = previous;
  }
}

export function contextScopeForProvider(
  component: Function,
  value: unknown,
  parent: ContextScope | undefined,
): ContextScope | undefined {
  const key = providers.get(component);
  if (!key) return parent;
  const scope = new Map(parent);
  scope.set(key, value);
  return scope;
}
