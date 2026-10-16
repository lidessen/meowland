import type { ComponentObserver, ObservedComponent, RenderableChild } from "./renderer";

declare const queueMicrotask: (callback: () => void) => void;

export interface ComponentObservationOptions {
  readonly roots?: readonly RenderableChild[];
  readonly onError?: (error: unknown) => void;
}

export interface ComponentObservation<TNode> {
  readonly observer: ComponentObserver<TNode>;
  read(root?: ObservedComponent<TNode>): readonly ObservedComponent<TNode>[];
  subscribe(listener: () => void, options?: { root?: ObservedComponent<TNode> }): () => void;
  dispose(): void;
}

/** Keep one current membership projection; node sets remain owned by the renderer. */
export function createComponentObservation<TNode>(
  options: ComponentObservationOptions = {},
): ComponentObservation<TNode> {
  const instances = new Set<ObservedComponent<TNode>>();
  const subscriptions = new Set<{
    listener: () => void;
    root?: ObservedComponent<TNode>;
    active: boolean;
  }>();
  let disposed = false;
  const within = (instance: ObservedComponent<TNode>, root: ObservedComponent<TNode>) => {
    for (let current: ObservedComponent<TNode> | null = instance; current; current = current.parent)
      if (current === root) return true;
    return false;
  };
  const observer: ComponentObserver<TNode> = {
    get roots() {
      return options.roots;
    },
    onComponent(instance) {
      if (!disposed) instances.add(instance);
    },
    onUnmount(instance) {
      if (!disposed) instances.delete(instance);
    },
    onFlush(changed) {
      if (disposed || !changed.length) return;
      const errors: unknown[] = [];
      const current = [...subscriptions];
      for (const subscription of current) {
        if (!subscription.active) continue;
        if (subscription.root) {
          const root = subscription.root;
          const affected = changed.some(
            (instance) => within(instance, root) || (instances.has(root) && within(root, instance)),
          );
          if (!affected) continue;
        }
        try {
          subscription.listener();
        } catch (error) {
          errors.push(error);
        }
      }
      const unhandled: unknown[] = [];
      for (const error of errors) {
        if (!options.onError) {
          unhandled.push(error);
          continue;
        }
        try {
          options.onError(error);
        } catch (handlerError) {
          unhandled.push(handlerError);
        }
      }
      if (unhandled.length)
        queueMicrotask(() => {
          throw new AggregateError(unhandled, "Component observation callbacks failed");
        });
    },
  };
  return {
    observer,
    read(root) {
      if (disposed || (root && !instances.has(root))) return [];
      return [...instances].filter((instance) => !root || within(instance, root));
    },
    subscribe(listener, subscriptionOptions = {}) {
      if (disposed) throw new Error("Component observation is disposed");
      const subscription = { listener, root: subscriptionOptions.root, active: true };
      subscriptions.add(subscription);
      return () => {
        subscription.active = false;
        subscriptions.delete(subscription);
      };
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const subscription of subscriptions) subscription.active = false;
      subscriptions.clear();
      instances.clear();
    },
  };
}
