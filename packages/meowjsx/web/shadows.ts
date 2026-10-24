import {
  createLifecycleScope,
  defineShadow as defineTargetShadow,
  type Cleanup,
  type Component,
  type ComponentMeta,
  type Props,
  type Runtime,
  type ShadowContext,
  type ShadowDefinition,
  type ShadowSetup,
  type VNode,
} from "../src/index";

/** Run every cleanup, retaining the first error raised by any operation. */
function disposeCleanups(cleanups: Cleanup[]): void {
  let firstError: unknown;
  for (const cleanup of cleanups.reverse()) {
    try {
      cleanup();
    } catch (error) {
      firstError ??= error;
    }
  }
  if (firstError) throw firstError;
}

/**
 * Mount the registered shadows of a component part against the real element the
 * DOM renderer just inserted. A shadow that is registered for a part whose
 * component is not registered is ignored, matching the runtime contract.
 */
export function runShadows(runtime: Runtime, vnode: VNode, element: Element): Cleanup {
  const identity = vnode.componentPart;
  if (!identity || !runtime.registry.has(identity.component)) return () => {};
  const shadows = runtime.shadowRegistry.list().filter((shadow) => {
    return shadow.component.meta.name === identity.component && shadow.part === identity.part;
  });
  if (shadows.length === 0) return () => {};

  const props = (identity.state ?? vnode.props) as unknown as Props;
  const mounted: Cleanup[] = [];

  try {
    for (const shadow of shadows) {
      const scope = createLifecycleScope(runtime);
      const context: ShadowContext = {
        ...scope,
        component: identity,
        props,
        vnode,
        element,
      };
      try {
        const cleanup = shadow.setup(props, context);
        mounted.push(() => {
          try {
            cleanup?.();
          } finally {
            scope.dispose();
          }
        });
      } catch (error) {
        try {
          scope.dispose();
        } catch {
          // Preserve the setup error; cleanup is best-effort while mounting fails.
        }
        throw error;
      }
    }
  } catch (error) {
    try {
      disposeCleanups(mounted);
    } catch {
      // Preserve the setup error; cleanup is best-effort while mounting fails.
    }
    throw error;
  }

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    disposeCleanups(mounted);
  };
}

/**
 * DOM shadows receive the real element. Core's `defineShadow` keeps the same
 * contract with a target-neutral host handle; Web code uses this narrowing so a
 * shadow can work with the element the renderer mounted.
 */
export function defineShadow<
  C extends Component<any, any> & { readonly meta: ComponentMeta },
  Part extends C["meta"]["parts"][number],
>(
  target: C,
  part: Part,
  setup: ShadowSetup<Parameters<C>[0], C["meta"]["name"], Part, Element>,
): ShadowDefinition<
  Parameters<C>[0],
  C["meta"]["name"],
  C["meta"]["parts"][number],
  Part,
  Element
> {
  return defineTargetShadow(target, part, setup);
}
