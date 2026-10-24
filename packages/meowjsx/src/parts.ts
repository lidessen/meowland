import type { Cleanup } from "./types";

/** An opaque component and part identity carried by a host VNode. */
export interface PartDescriptor<Name extends string = string, Part extends string = string> {
  readonly component: Name;
  readonly part: Part;
  readonly state?: Readonly<Record<string, unknown>>;
}

const descriptors = new WeakSet<object>();

/** Create a descriptor by stable component and part names. */
export function createPartDescriptor<Name extends string, Part extends string>(
  component: Name,
  part: Part,
  state?: Readonly<Record<string, unknown>>,
): PartDescriptor<Name, Part> {
  const descriptor = Object.freeze({
    component,
    part,
    ...(state === undefined ? {} : { state }),
  });
  descriptors.add(descriptor);
  return descriptor;
}

export function isPartDescriptor(value: unknown): value is PartDescriptor {
  return typeof value === "object" && value !== null && descriptors.has(value);
}

export type RefCleanup = () => void | { readonly then?: never };
export type RefCallback<TNode> = (node: TNode) => void | RefCleanup;
export type RefBinding<TNode> =
  | RefCallback<TNode>
  | PartDescriptor
  | false
  | null
  | undefined
  | readonly RefBinding<TNode>[];

const normalizedRef = Symbol("meowjsx.normalized-ref");
export interface NormalizedRef<TNode = unknown> {
  readonly [normalizedRef]: true;
  readonly callbacks: readonly RefCallback<TNode>[];
}

/** Flatten composed refs and resolve the single host part identity before hooks. */
export function normalizeRefBinding<TNode>(value: unknown): {
  readonly ref?: NormalizedRef<TNode>;
  readonly part?: PartDescriptor;
} {
  const callbacks: RefCallback<TNode>[] = [];
  let part: PartDescriptor | undefined;
  const visit = (entry: unknown): void => {
    if (entry === undefined || entry === null || entry === false) return;
    if (Array.isArray(entry)) {
      for (const nested of entry) visit(nested);
      return;
    }
    if (isPartDescriptor(entry)) {
      if (part && (part.component !== entry.component || part.part !== entry.part))
        throw new Error("meowjsx host refs cannot bind multiple distinct parts");
      if (!part || (part.state === undefined && entry.state !== undefined)) part = entry;
      return;
    }
    if (typeof entry === "function") {
      callbacks.push(entry as RefCallback<TNode>);
      return;
    }
    throw new Error("meowjsx ref bindings must be callbacks, part descriptors, or nested arrays");
  };
  visit(value);
  return {
    ...(callbacks.length > 0
      ? {
          ref: Object.freeze({
            [normalizedRef]: true as const,
            callbacks: Object.freeze(callbacks),
          }),
        }
      : {}),
    ...(part ? { part } : {}),
  };
}

export function isNormalizedRef(value: unknown): value is NormalizedRef {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.hasOwn(value, normalizedRef) &&
    (value as NormalizedRef)[normalizedRef] === true
  );
}

/** Invoke callbacks in order and release their successful cleanups in reverse order. */
export function mountRefBindings<TNode>(ref: NormalizedRef<TNode>, node: TNode): Cleanup {
  const cleanups: RefCleanup[] = [];
  let active = true;
  const release: Cleanup = () => {
    if (!active) return;
    active = false;
    let firstError: unknown;
    let failed = false;
    for (let index = cleanups.length - 1; index >= 0; index -= 1) {
      try {
        cleanups[index]!();
      } catch (error) {
        if (!failed) {
          failed = true;
          firstError = error;
        }
      }
    }
    cleanups.length = 0;
    if (failed) throw firstError;
  };
  try {
    for (const callback of ref.callbacks) {
      const cleanup = callback(node);
      if (typeof cleanup === "function") cleanups.push(cleanup as RefCleanup);
    }
  } catch (error) {
    try {
      release();
    } catch {
      // Keep the callback failure primary while attempting every rollback cleanup.
    }
    throw error;
  }
  return release;
}
