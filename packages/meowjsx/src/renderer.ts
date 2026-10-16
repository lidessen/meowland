import type { ContextScope } from "./context";
import { isKeyedChild, readKeyedEntries, type KeyedChild } from "./keyed";
import { signal } from "./reactive";
export {
  createComponentObservation,
  type ComponentObservation,
  type ComponentObservationOptions,
} from "./observation";
import type { ComponentContract, ComponentMetadata } from "./types";

/** A target-owned cleanup operation. */
export type RendererCleanup = () => void;

/**
 * The smallest signal contract a renderer needs. The concrete Signal
 * implementation stays in the MeowJSX runtime; this structural type keeps a
 * target renderer free of DOM and Bun dependencies.
 */
export interface SignalLike<T = unknown> {
  readonly value: T;
  subscribe(listener: (value: T) => void): RendererCleanup;
}

export type RenderableChild =
  | RenderableVNode
  | KeyedChild<any>
  | SignalLike<unknown>
  | string
  | number
  | boolean
  | null
  | undefined
  | RenderableChild[]
  | PromiseLike<unknown>
  | AsyncIterable<unknown>;

export type RenderableProps = Record<string, unknown> & {
  children?: RenderableChild;
};

/**
 * A callable component uses `never` parameters so concrete component props
 * remain structurally compatible across targets. The renderer casts to the
 * target's actual invocation signature at the call boundary.
 */
export type RenderableComponent = {
  (...args: never[]): RenderableChild;
  readonly contract?: ComponentContract;
  metadata?: ComponentMetadata;
};

export interface RenderableComponentPart {
  readonly component: string;
  readonly part: string;
  readonly state?: Readonly<Record<string, unknown>>;
}

export interface RenderableVNode {
  readonly type: string | RenderableComponent;
  readonly props: RenderableProps;
  readonly key?: string | number;
  readonly raw?: boolean;
  readonly componentPart?: RenderableComponentPart;
}

/**
 * The platform boundary for MeowJSX rendering.
 *
 * JSX construction, component invocation, Signal subscriptions, lifecycle,
 * and runtime hooks remain core concerns. A target strategy owns only its node
 * representation and the operations needed to place and update those nodes.
 */
export interface RenderStrategy<TNode> {
  createText(value: string): TNode;
  createElement(type: string, parent?: TNode): TNode;
  createMarker(kind: string): TNode;
  getNextSibling(node: TNode): TNode | null;
  insert(parent: TNode, node: TNode, before?: TNode | null): void;
  remove(node: TNode): void;
  setProperty(node: TNode, name: string, value: unknown): void | RendererCleanup;
  /**
   * Optional host-node rule: return true when the target node's content comes
   * from the node itself instead of mounted children (the Web target's raw
   * HTML). A strategy that does not implement it always mounts children.
   */
  ownsChildren?(vnode: RenderableVNode): boolean;
}

export interface ComponentInvocation {
  readonly child: RenderableChild;
  readonly dispose: RendererCleanup;
  readonly contextScope?: ContextScope;
  /** The function actually invoked after runtime component selection. */
  readonly component?: RenderableComponent;
  readonly semantic?: "fragment" | "context-provider";
}

/** A live development projection of one mounted component invocation. */
export interface ObservedComponent<TNode> {
  /** Unique within this renderer; not a persistent component address. */
  readonly id: number;
  readonly parent: ObservedComponent<TNode> | null;
  readonly originalComponent: RenderableComponent;
  readonly component: RenderableComponent;
  readonly semantic?: "fragment" | "context-provider";
  /** Live host/text output, including descendants; internal markers are excluded. */
  readonly nodes: ReadonlySet<TNode>;
}

/** Opt-in target-neutral observation. Callbacks run synchronously. */
export interface ComponentObserver<TNode> {
  /** Observe only these child identities and their descendants; omit for the whole tree. */
  readonly roots?: readonly RenderableChild[];
  onComponent(instance: ObservedComponent<TNode>): void;
  onNode?(instance: ObservedComponent<TNode>, node: TNode, mounted: boolean): void;
  onUnmount?(instance: ObservedComponent<TNode>): void;
  /** Coalesced invalidation after synchronous changes; not layout, paint, or success evidence. */
  onFlush?(changed: readonly ObservedComponent<TNode>[]): void;
}

declare const queueMicrotask: (callback: () => void) => void;

export interface RendererOptions<TNode> {
  readonly observer?: ComponentObserver<TNode>;
  /** Runtime-aware component invocation, including lifecycle ownership. */
  readonly invokeComponent?: (
    component: RenderableComponent,
    props: RenderableProps,
    contextScope?: ContextScope,
  ) => ComponentInvocation;
  /** Runtime render hooks can transform a host VNode before target mounting. */
  readonly transformVNode?: (vnode: RenderableVNode) => RenderableVNode;
  /** Runtime overrides can replace a host element with a component. */
  readonly replacementFor?: (vnode: RenderableVNode) => RenderableComponent | undefined;
  /** Optional target-specific mount hook, such as a supported shadow system. */
  readonly onMount?: (vnode: RenderableVNode, node: TNode) => void | RendererCleanup;
  /** The host decides how asynchronous renderer errors should be reported. */
  readonly onError?: (error: unknown, phase: "async") => void;
}

export interface Rendered<TNode> {
  readonly nodes: readonly TNode[];
  unmount(): void;
}

export interface Renderer<TNode> {
  readonly strategy: RenderStrategy<TNode>;
  createText(value: string): TNode;
  createElement(type: string, parent?: TNode): TNode;
  createMarker(kind: string): TNode;
  getNextSibling(node: TNode): TNode | null;
  insert(parent: TNode, node: TNode, before?: TNode | null): void;
  remove(node: TNode): void;
  setProperty(node: TNode, name: string, value: unknown): void | RendererCleanup;
  mount(node: RenderableChild, parent: TNode, before?: TNode | null): Rendered<TNode>;
  render(node: RenderableChild, parent: TNode, before?: TNode | null): Rendered<TNode>;
}

const noop = (): void => {};

/** Run every cleanup, retaining the first error raised by any operation. */
function runCleanups(cleanups: readonly RendererCleanup[]): void {
  let firstError: unknown;
  let failed = false;

  for (const cleanup of cleanups) {
    try {
      cleanup();
    } catch (error) {
      if (!failed) {
        failed = true;
        firstError = error;
      }
    }
  }

  if (failed) throw firstError;
}

function tryCleanups(cleanups: readonly RendererCleanup[]): { failed: boolean; error?: unknown } {
  try {
    runCleanups(cleanups);
    return { failed: false };
  } catch (error) {
    return { failed: true, error };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSignal(value: unknown): value is SignalLike<unknown> {
  return (
    (typeof value === "object" || typeof value === "function") &&
    value !== null &&
    "value" in value &&
    "subscribe" in value &&
    typeof (value as { subscribe?: unknown }).subscribe === "function"
  );
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    (typeof value === "object" || typeof value === "function") &&
    value !== null &&
    typeof (value as { then?: unknown }).then === "function"
  );
}

function isAsyncIterable(value: unknown): value is AsyncIterable<RenderableChild> {
  return (
    (typeof value === "object" || typeof value === "function") &&
    value !== null &&
    typeof (value as { [Symbol.asyncIterator]?: unknown })[Symbol.asyncIterator] === "function"
  );
}

function isVNode(value: unknown): value is RenderableVNode {
  if (!isRecord(value) || !("type" in value) || !("props" in value)) return false;
  return typeof value.type === "string" || typeof value.type === "function";
}

function isComponent(value: unknown): value is RenderableComponent {
  return typeof value === "function";
}

function childrenOf(vnode: RenderableVNode): RenderableChild[] {
  const children = vnode.props.children;
  if (children === undefined || children === null) return [];
  return Array.isArray(children) ? children : [children];
}

function cleanupResult(value: void | RendererCleanup): RendererCleanup {
  return typeof value === "function" ? value : noop;
}

/**
 * Bind the MeowJSX core operations to one target strategy.
 *
 * The renderer owns a small, complete mount loop rather than exposing a bag
 * of operations only: host nodes, components, arrays, Signals, and async
 * regions all use the same target contract. Runtime-specific hooks are
 * injected through `RendererOptions`, so a terminal target does not need to
 * import the DOM runtime.
 */
export function createRenderer<TNode>(
  strategy: RenderStrategy<TNode>,
  options: RendererOptions<TNode> = {},
): Renderer<TNode> {
  type Owner = ObservedComponent<TNode> | undefined;
  type Mounted = {
    nodes: TNode[];
    dispose(): void;
  };
  let nextInstanceId = 1;
  const observationRoots = options.observer?.roots ? new Set(options.observer.roots) : undefined;
  const dirty = options.observer?.onFlush ? new Set<ObservedComponent<TNode>>() : undefined;
  let flushScheduled = false;
  const invalidate = (instance: Owner): void => {
    if (!dirty || !instance) return;
    dirty.add(instance);
    if (flushScheduled) return;
    flushScheduled = true;
    queueMicrotask(() => {
      flushScheduled = false;
      const changed = [...dirty];
      dirty.clear();
      try {
        options.observer!.onFlush!(changed);
      } catch (error) {
        if (options.onError) options.onError(error, "async");
        else throw error;
      }
    });
  };

  const associateNode = (owner: Owner, node: TNode, mounted: boolean): void => {
    if (!owner) return;
    invalidate(owner);
    const notifications: RendererCleanup[] = [];
    for (let instance: Owner = owner; instance; instance = instance.parent ?? undefined) {
      const nodes = instance.nodes as Set<TNode>;
      if (nodes.has(node) === mounted) continue;
      if (mounted) nodes.add(node);
      else nodes.delete(node);
      const observed = instance;
      if (options.observer?.onNode)
        notifications.push(() => options.observer!.onNode!(observed, node, mounted));
    }
    runCleanups(notifications);
  };

  const mountChild = (
    child: RenderableChild,
    parent: TNode,
    before: TNode | null,
    contextScope?: ContextScope,
    owner?: Owner,
    observing = !!options.observer && !observationRoots,
  ): Mounted => {
    if (observationRoots?.has(child)) {
      observing = true;
      owner = undefined;
    }
    if (child === null || child === undefined || typeof child === "boolean") {
      return { nodes: [], dispose: noop };
    }

    if (isPromiseLike(child) || isAsyncIterable(child)) {
      return mountAsync(child, parent, before, contextScope, owner, observing);
    }

    if (isSignal(child)) return mountSignal(child, parent, before, contextScope, owner, observing);

    if (isKeyedChild(child))
      return mountKeyed(child, parent, before, contextScope, owner, observing);

    if (Array.isArray(child))
      return mountArray(child, parent, before, contextScope, owner, observing);

    if (typeof child === "string" || typeof child === "number") {
      const text = strategy.createText(String(child));
      strategy.insert(parent, text, before);
      try {
        associateNode(owner, text, true);
      } catch (error) {
        tryCleanups([() => associateNode(owner, text, false), () => strategy.remove(text)]);
        throw error;
      }
      let disposed = false;
      return {
        nodes: [text],
        dispose() {
          if (disposed) return;
          disposed = true;
          runCleanups([() => associateNode(owner, text, false), () => strategy.remove(text)]);
        },
      };
    }

    if (!isVNode(child)) throw new Error("meowjsx renderer received an invalid child");

    // Component nodes are invoked, not transformed: render hooks and overrides
    // describe how a host element becomes target output, and both MeowJSX mount
    // paths have always evaluated them only for host nodes.
    if (isComponent(child.type)) {
      return mountComponent(
        child.type,
        child.props,
        parent,
        before,
        contextScope,
        owner,
        observing,
      );
    }

    const replacement = options.replacementFor?.(child);
    if (replacement)
      return mountComponent(
        replacement,
        child.props,
        parent,
        before,
        contextScope,
        owner,
        observing,
      );

    const rendered = options.transformVNode?.(child) ?? child;
    if (isComponent(rendered.type)) {
      return mountComponent(
        rendered.type,
        rendered.props,
        parent,
        before,
        contextScope,
        owner,
        observing,
      );
    }

    return mountHost(rendered, parent, before, contextScope, owner, observing);
  };

  function mountArray(
    children: RenderableChild[],
    parent: TNode,
    before: TNode | null,
    contextScope?: ContextScope,
    owner?: Owner,
    observing = false,
  ): Mounted {
    const mounts: Mounted[] = [];
    let cursor = before;

    try {
      for (let index = children.length - 1; index >= 0; index -= 1) {
        const childMount = mountChild(
          children[index]!,
          parent,
          cursor,
          contextScope,
          owner,
          observing,
        );
        mounts.unshift(childMount);
        if (childMount.nodes.length > 0) cursor = childMount.nodes[0]!;
      }
    } catch (error) {
      // The mount error is the operation's primary failure. Still dispose
      // every already-mounted child before returning it to the caller.
      tryCleanups(mounts.reverse().map((childMount) => childMount.dispose));
      throw error;
    }

    let disposed = false;
    return {
      nodes: mounts.flatMap((childMount) => childMount.nodes),
      dispose() {
        if (disposed) return;
        disposed = true;
        runCleanups(mounts.map((childMount) => childMount.dispose));
      },
    };
  }

  function mountKeyed(
    child: KeyedChild<unknown>,
    parent: TNode,
    before: TNode | null,
    contextScope?: ContextScope,
    owner?: Owner,
    observing = false,
  ): Mounted {
    const start = strategy.createMarker("keyed");
    const end = strategy.createMarker("keyed-end");
    type Row = {
      start: TNode;
      end: TNode;
      value: ReturnType<typeof signal<unknown>>;
      content: Mounted;
    };
    let rows = new Map<string | number, Row>();
    let disposed = false;
    let unsubscribe: RendererCleanup = noop;
    const range = (first: TNode, last: TNode): TNode[] => {
      const nodes: TNode[] = [];
      for (let node: TNode | null = first; node; node = strategy.getNextSibling(node)) {
        nodes.push(node);
        if (node === last) return nodes;
      }
      throw new Error("Keyed child range lost its boundary");
    };
    const disposeRow = (row: Row) =>
      runCleanups([
        row.content.dispose,
        () => strategy.remove(row.start),
        () => strategy.remove(row.end),
      ]);
    const createRow = (value: unknown, anchor: TNode): Row => {
      const rowStart = strategy.createMarker("keyed-item");
      const rowEnd = strategy.createMarker("keyed-item-end");
      strategy.insert(parent, rowStart, anchor);
      strategy.insert(parent, rowEnd, anchor);
      const item = signal(value);
      try {
        return {
          start: rowStart,
          end: rowEnd,
          value: item,
          content: mountChild(child.render(item), parent, rowEnd, contextScope, owner, observing),
        };
      } catch (error) {
        tryCleanups([() => strategy.remove(rowStart), () => strategy.remove(rowEnd)]);
        throw error;
      }
    };
    const update = (items?: readonly unknown[]) => {
      if (disposed) return;
      const entries = readKeyedEntries(child, items);
      const next = new Map<string | number, Row>();
      const added: Row[] = [];
      let anchor = end;
      try {
        // Place new ranges beside their intended neighbour so append/prepend
        // never moves an existing row, including its focused native controls.
        for (let index = entries.length - 1; index >= 0; index--) {
          const entry = entries[index]!;
          let row = rows.get(entry.key);
          if (!row) {
            row = createRow(entry.value, anchor);
            added.push(row);
          }
          next.set(entry.key, row);
          anchor = row.start;
        }
      } catch (error) {
        tryCleanups(added.map((row) => () => disposeRow(row)));
        throw error;
      }
      const removed = [...rows].filter(([key]) => !next.has(key)).map(([, row]) => row);
      rows = next;
      // Remove obsolete ranges first: deleting the trailing row must not move
      // its retained neighbour merely to make it adjacent to the end marker.
      const cleanup = tryCleanups(removed.map((row) => () => disposeRow(row)));
      anchor = end;
      for (let index = entries.length - 1; index >= 0; index--) {
        const row = next.get(entries[index]!.key)!;
        if (strategy.getNextSibling(row.end) !== anchor)
          for (const node of range(row.start, row.end)) strategy.insert(parent, node, anchor);
        anchor = row.start;
      }
      for (const entry of entries) rows.get(entry.key)!.value.value = entry.value;
      invalidate(owner);
      if (cleanup.failed) throw cleanup.error;
    };
    strategy.insert(parent, start, before);
    strategy.insert(parent, end, before);
    try {
      update();
      if (isSignal(child.items)) {
        unsubscribe = child.items.subscribe((items) => {
          try {
            update(items as readonly unknown[]);
          } catch (error) {
            if (options.onError) options.onError(error, "async");
            else throw error;
          }
        });
      }
    } catch (error) {
      tryCleanups([
        ...[...rows.values()].map((row) => () => disposeRow(row)),
        () => strategy.remove(start),
        () => strategy.remove(end),
      ]);
      throw error;
    }
    return {
      get nodes() {
        return disposed ? [] : range(start, end);
      },
      dispose() {
        if (disposed) return;
        disposed = true;
        const previous = [...rows.values()];
        rows.clear();
        runCleanups([
          unsubscribe,
          ...previous.map((row) => () => disposeRow(row)),
          () => strategy.remove(start),
          () => strategy.remove(end),
        ]);
      },
    };
  }

  function anchorAfter(marker: TNode, fallback: TNode | null): TNode | null {
    return strategy.getNextSibling(marker) ?? fallback;
  }

  function mountSignal(
    source: SignalLike<unknown>,
    parent: TNode,
    before: TNode | null,
    contextScope?: ContextScope,
    owner?: Owner,
    observing = false,
  ): Mounted {
    const marker = strategy.createMarker("signal");
    strategy.insert(parent, marker, before);
    let current: Mounted;
    try {
      current = mountChild(
        source.value as RenderableChild,
        parent,
        anchorAfter(marker, before),
        contextScope,
        owner,
        observing,
      );
    } catch (error) {
      tryCleanups([() => strategy.remove(marker)]);
      throw error;
    }
    let disposed = false;

    const replace = (next: unknown): void => {
      if (disposed) return;
      // Keep the old region intact if mounting the replacement fails.
      const nextMount = mountChild(
        next as RenderableChild,
        parent,
        anchorAfter(marker, before),
        contextScope,
        owner,
        observing,
      );
      const previous = current;
      current = nextMount;
      previous.dispose();
    };
    let unsubscribe: RendererCleanup;
    try {
      unsubscribe = source.subscribe(replace);
    } catch (error) {
      tryCleanups([() => current.dispose(), () => strategy.remove(marker)]);
      throw error;
    }

    return {
      nodes: [marker, ...current.nodes],
      dispose() {
        if (disposed) return;
        disposed = true;
        runCleanups([unsubscribe, () => current.dispose(), () => strategy.remove(marker)]);
      },
    };
  }

  function mountAsync(
    source: PromiseLike<unknown> | AsyncIterable<unknown>,
    parent: TNode,
    before: TNode | null,
    contextScope?: ContextScope,
    owner?: Owner,
    observing = false,
  ): Mounted {
    const marker = strategy.createMarker("async");
    strategy.insert(parent, marker, before);
    let current: Mounted = { nodes: [], dispose: noop };
    let disposed = false;

    const replace = (next: RenderableChild): void => {
      if (disposed) return;
      // Keep the previous async value mounted if the replacement is invalid
      // or otherwise fails to mount.
      const nextMount = mountChild(
        next,
        parent,
        anchorAfter(marker, before),
        contextScope,
        owner,
        observing,
      );
      const previous = current;
      current = nextMount;
      previous.dispose();
    };

    if (isPromiseLike(source)) {
      void Promise.resolve(source)
        .then((next) => replace(next as RenderableChild))
        .catch((error: unknown) => {
          if (!disposed) options.onError?.(error, "async");
        });
    } else {
      let iterator: AsyncIterator<unknown>;
      try {
        iterator = source[Symbol.asyncIterator]();
      } catch (error) {
        tryCleanups([() => strategy.remove(marker)]);
        throw error;
      }
      void (async (): Promise<void> => {
        try {
          while (!disposed) {
            const result = await iterator.next();
            if (result.done) break;
            replace(result.value as RenderableChild);
          }
        } catch (error) {
          if (!disposed) options.onError?.(error, "async");
        }
      })();

      return {
        nodes: [marker],
        dispose() {
          if (disposed) return;
          disposed = true;
          let returnResult: unknown;
          let returnError: unknown;
          let returnFailed = false;
          try {
            returnResult = iterator.return?.();
          } catch (error) {
            returnFailed = true;
            returnError = error;
          }
          const cleanupResult = tryCleanups([
            () => current.dispose(),
            () => strategy.remove(marker),
          ]);
          if (returnFailed) throw returnError;
          if (isPromiseLike(returnResult)) {
            void Promise.resolve(returnResult).catch((error: unknown) => {
              options.onError?.(error, "async");
            });
          }
          if (cleanupResult.failed) throw cleanupResult.error;
        },
      };
    }

    return {
      nodes: [marker],
      dispose() {
        if (disposed) return;
        disposed = true;
        runCleanups([() => current.dispose(), () => strategy.remove(marker)]);
      },
    };
  }

  function mountComponent(
    component: RenderableComponent,
    props: RenderableProps,
    parent: TNode,
    before: TNode | null,
    contextScope?: ContextScope,
    owner?: Owner,
    observing = false,
  ): Mounted {
    if (!options.invokeComponent) {
      throw new Error(
        "meowjsx renderer needs a runtime-aware invokeComponent callback for component nodes",
      );
    }
    const invocation = options.invokeComponent(component, props, contextScope);
    const instance: Owner =
      options.observer && observing
        ? {
            id: nextInstanceId++,
            parent: owner ?? null,
            originalComponent: component,
            component: invocation.component ?? component,
            semantic: invocation.semantic,
            nodes: new Set<TNode>(),
          }
        : undefined;
    const unobserve = (): void => {
      if (instance) {
        invalidate(instance);
        options.observer?.onUnmount?.(instance);
      }
    };
    let childMount: Mounted;

    try {
      if (instance) {
        invalidate(instance);
        options.observer?.onComponent(instance);
      }
      childMount = mountChild(
        invocation.child,
        parent,
        before,
        invocation.contextScope ?? contextScope,
        instance,
        observing,
      );
    } catch (error) {
      tryCleanups([invocation.dispose, unobserve]);
      throw error;
    }

    let disposed = false;
    return {
      nodes: childMount.nodes,
      dispose() {
        if (disposed) return;
        disposed = true;
        runCleanups([invocation.dispose, childMount.dispose, unobserve]);
      },
    };
  }

  function mountHost(
    vnode: RenderableVNode,
    parent: TNode,
    before: TNode | null,
    contextScope?: ContextScope,
    owner?: Owner,
    observing = false,
  ): Mounted {
    const element = strategy.createElement(vnode.type as string, parent);
    const propertyCleanups: RendererCleanup[] = [];
    let childrenMount: Mounted | undefined;
    let observed = false;

    try {
      for (const [name, value] of Object.entries(vnode.props)) {
        if (name === "children" || name === "key") continue;

        if (isSignal(value)) {
          let propertyCleanup = cleanupResult(strategy.setProperty(element, name, value.value));
          const unsubscribe = value.subscribe((next) => {
            try {
              propertyCleanup();
              propertyCleanup = cleanupResult(strategy.setProperty(element, name, next));
            } finally {
              if (observed) invalidate(owner);
            }
          });
          propertyCleanups.push(() => {
            runCleanups([unsubscribe, propertyCleanup]);
          });
        } else {
          propertyCleanups.push(cleanupResult(strategy.setProperty(element, name, value)));
        }
      }

      childrenMount = mountArray(
        strategy.ownsChildren?.(vnode) ? [] : childrenOf(vnode),
        element,
        null,
        contextScope,
        owner,
        observing,
      );
      strategy.insert(parent, element, before);
      associateNode(owner, element, true);
      observed = true;
      const mountCleanup = cleanupResult(options.onMount?.(vnode, element));
      let disposed = false;

      return {
        nodes: [element],
        dispose() {
          if (disposed) return;
          disposed = true;
          observed = false;
          runCleanups([
            mountCleanup,
            childrenMount!.dispose,
            () => runCleanups(propertyCleanups.reverse()),
            () => associateNode(owner, element, false),
            () => strategy.remove(element),
          ]);
        },
      };
    } catch (error) {
      observed = false;
      tryCleanups([
        () => childrenMount?.dispose(),
        () => runCleanups(propertyCleanups.reverse()),
        () => associateNode(owner, element, false),
        () => strategy.remove(element),
      ]);
      throw error;
    }
  }

  const mount = (
    node: RenderableChild,
    parent: TNode,
    before: TNode | null = null,
  ): Rendered<TNode> => {
    const mounted = mountChild(node, parent, before);
    return {
      nodes: mounted.nodes,
      unmount: mounted.dispose,
    };
  };

  return {
    strategy,
    createText: (value) => strategy.createText(value),
    createElement: (type, parent) => strategy.createElement(type, parent),
    createMarker: (kind) => strategy.createMarker(kind),
    getNextSibling: (node) => strategy.getNextSibling(node),
    insert: (parent, node, before) => strategy.insert(parent, node, before),
    remove: (node) => strategy.remove(node),
    setProperty: (node, name, value) => strategy.setProperty(node, name, value),
    mount,
    render: mount,
  };
}
