import type { Child, Component } from "./runtime";

/** A render-tree environment. Targets carry it through deferred child regions. */
export type ContextScope = ReadonlyMap<symbol, unknown>;

export interface ContextValue<T> {
  readonly key: symbol;
  readonly defaultValue: T;
  readonly Provider: Component<{ value: T; children?: Child }>;
}

const providers = new WeakMap<Function, symbol>();
let activeScope: ContextScope | undefined;
let componentBodyRunning = false;

export function isContextProvider(component: Function): boolean {
  return providers.has(component);
}

/* @__NO_SIDE_EFFECTS__ */
export function createContext<T>(defaultValue: T): ContextValue<T> {
  const key = Symbol("meowjsx.context");
  const Provider: ContextValue<T>["Provider"] = ({ children }) => children ?? null;
  providers.set(Provider, key);
  return Object.freeze({ key, defaultValue, Provider });
}

export function useContext<T>(context: ContextValue<T>): T {
  return activeScope?.has(context.key) ? (activeScope.get(context.key) as T) : context.defaultValue;
}

export function withContextScope<T>(scope: ContextScope | undefined, run: () => T): T {
  const previous = activeScope;
  activeScope = scope;
  try {
    return run();
  } finally {
    activeScope = previous;
  }
}

/**
 * Whether a component function body is executing synchronously right now. This
 * is a different fact from "no Provider above": `useContext` returns the default
 * in both cases. Handlers, derived and effect bodies, keyed callbacks, code after
 * `await` and module top level are all outside a component body.
 */
export function isInComponentBody(): boolean {
  return componentBodyRunning;
}

/** Run one component function body with its Context scope and the in-body fact set. */
export function runComponentBody<T>(scope: ContextScope | undefined, run: () => T): T {
  const previous = componentBodyRunning;
  componentBodyRunning = true;
  try {
    return withContextScope(scope, run);
  } finally {
    componentBodyRunning = previous;
  }
}

/**
 * Run user code that a component body may trigger synchronously but that is not
 * itself the body: derived reads, effects, flushed subscribers, keyed callbacks.
 */
export function outsideComponentBody<T>(run: () => T): T {
  if (!componentBodyRunning) return run();
  componentBodyRunning = false;
  try {
    return run();
  } finally {
    componentBodyRunning = true;
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
