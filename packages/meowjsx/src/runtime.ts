export { createContext, useContext, type ContextScope, type ContextValue } from "./context";
export { keyed, type KeyedChild } from "./keyed";
export { createPartDescriptor, isPartDescriptor } from "./parts";
export type { PartDescriptor, RefBinding, RefCallback, RefCleanup } from "./parts";
import { isContextProvider } from "./context";
import {
  createRenderer as createTargetRenderer,
  type RenderableComponent,
  type RenderableChild,
  type RenderableVNode,
  type RenderStrategy,
  type Renderer as TargetRenderer,
} from "./renderer";
import {
  addHook,
  createBaseVNode,
  createComponentRegistry,
  createShadowRegistry,
  invokeComponent,
  removeHook,
  runCreateHooks,
  runRenderHooks,
  normalizeHostVNode,
  type HookEntry,
  type RuntimeState,
} from "./registry";
import { disposeCleanups } from "./lifecycle";
import type {
  AnyShadowDefinition,
  Child,
  Cleanup,
  ComponentMeta,
  Component,
  HFactory,
  ShadowDefinition,
  ShadowSetup,
  CreateHook,
  FragmentComponent,
  Props,
  RenderHook,
  Runtime,
  RuntimeOptions,
  RuntimePlugin,
  RuntimePluginOption,
  RuntimeRendererOptions,
  RuntimeTargetHooks,
  VNode,
} from "./types";

// Public surface: runtime.ts stays the single entry point for these modules.
export type {
  Child,
  ClassValue,
  Cleanup,
  Component,
  ComponentMeta,
  ComponentMetadata,
  ComponentPartRef,
  ComponentRegistry,
  ComponentRegistryMap,
  ComponentRenderContext,
  Context,
  CreateContext,
  CreateHook,
  Effect,
  ElementType,
  FragmentComponent,
  Key,
  LifecycleScope,
  MaybeSignal,
  MountResult,
  Props,
  ReadableSignal,
  RegisteredComponent,
  RegisteredComponentName,
  RegisteredComponentPart,
  RenderContext,
  RenderHook,
  ResolveComponentContext,
  ResolveComponentHook,
  Runtime,
  RuntimeOptions,
  RuntimePlugin,
  RuntimePluginContext,
  RuntimePluginEnforce,
  RuntimePluginOption,
  RuntimePluginSetup,
  RuntimeRendererOptions,
  RuntimeTargetHooks,
  ShadowContext,
  ShadowDefinition,
  ShadowRegistry,
  ShadowSetup,
  Signal,
  StyleObject,
  StyleScalar,
  StyleValue,
  Theme,
  ThemeContext,
  ThemeRule,
  ThemeRules,
  ThemeStyle,
  VNode,
  WritableSignal,
} from "./types";
export {
  batch,
  isAsyncIterable,
  isPromiseLike,
  derived,
  isSignal,
  mapSignal,
  signal,
  unwrap,
} from "./reactive";
export { createLifecycleScope } from "./lifecycle";
export { createThemePlugin, styleText } from "./style";

function isRuntimePluginArray(
  option: RuntimePluginOption,
): option is readonly RuntimePluginOption[] {
  return Array.isArray(option);
}

const fragments = new WeakSet<Function>();

function replacementFor(state: RuntimeState, node: VNode): Component<any> | undefined {
  if (node.raw || typeof node.type !== "string") return undefined;
  return state.overrides.get(node.type);
}
export function defineShadow<
  C extends Component<any, any> & { readonly meta: ComponentMeta },
  Part extends C["meta"]["parts"][number],
  TNode = unknown,
>(
  component: C,
  part: Part,
  setup: ShadowSetup<Parameters<C>[0], C["meta"]["name"], Part, TNode>,
): ShadowDefinition<Parameters<C>[0], C["meta"]["name"], C["meta"]["parts"][number], Part, TNode> {
  const meta = component.meta;
  if (!meta.parts.includes(part))
    throw new Error(
      `meowjsx shadow ${meta.name}.${String(part)} is not declared in component metadata`,
    );
  return {
    name: `meowjsx-shadow:${meta.name}/${String(part)}`,
    component,
    part,
    setup,
  } as ShadowDefinition<
    Parameters<C>[0],
    C["meta"]["name"],
    C["meta"]["parts"][number],
    Part,
    TNode
  >;
}

export function createRuntime(options: RuntimeOptions = {}): Runtime {
  const state: RuntimeState = {
    createHooks: [],
    renderHooks: [],
    resolveComponentHooks: [],
    shadowRegistry: createShadowRegistry(options.shadows),
    overrides: new Map(Object.entries(options.overrides ?? {})),
  };
  const registry = createComponentRegistry(options.components ?? []);

  const runtime = {} as Runtime;

  const installPlugin = (plugin: RuntimePlugin): Cleanup => {
    let createEntry: HookEntry<CreateHook> | undefined;
    let renderEntry: HookEntry<RenderHook> | undefined;
    let active = true;
    const pluginCleanups: Cleanup[] = [];
    const contributionCleanups: Cleanup[] = [];
    const previousOverrides = new Map<string, Component<any> | undefined>();

    const registerPluginCleanup = (cleanup: Cleanup): void => {
      let disposed = false;
      const once: Cleanup = () => {
        if (disposed) return;
        disposed = true;
        cleanup();
      };

      if (!active) once();
      else pluginCleanups.push(once);
    };

    const disposePlugin: Cleanup = () => {
      if (!active) return;
      active = false;
      let firstError: unknown;

      try {
        disposeCleanups(pluginCleanups);
      } catch (error) {
        firstError = error;
      }

      try {
        disposeCleanups(contributionCleanups);
      } catch (error) {
        firstError ??= error;
      }

      if (firstError) throw firstError;
    };

    try {
      if (plugin.create) {
        createEntry = addHook(state.createHooks, plugin.create, plugin.enforce);
        contributionCleanups.push(() => removeHook(state.createHooks, createEntry!));
      }
      if (plugin.render) {
        renderEntry = addHook(state.renderHooks, plugin.render, plugin.enforce);
        contributionCleanups.push(() => removeHook(state.renderHooks, renderEntry!));
      }
      if (plugin.resolveComponent) {
        const entry = addHook(state.resolveComponentHooks, plugin.resolveComponent, plugin.enforce);
        contributionCleanups.push(() => removeHook(state.resolveComponentHooks, entry));
      }

      for (const shadow of plugin.shadows ?? []) {
        const disposeShadow = state.shadowRegistry.register(shadow);
        contributionCleanups.push(disposeShadow);
      }
      for (const component of plugin.components ?? []) {
        const disposeComponent = registry.register(component);
        contributionCleanups.push(disposeComponent);
      }

      for (const [name, replacement] of Object.entries(plugin.overrides ?? {})) {
        previousOverrides.set(name, state.overrides.get(name));
        state.overrides.set(name, replacement);
        contributionCleanups.push(() => {
          if (state.overrides.get(name) !== replacement) return;
          const previous = previousOverrides.get(name);
          if (previous) state.overrides.set(name, previous);
          else state.overrides.delete(name);
        });
      }

      const setupCleanup = plugin.setup?.({
        runtime,
        registry,
        shadowRegistry: state.shadowRegistry,
        onCleanup: registerPluginCleanup,
      });
      if (setupCleanup) registerPluginCleanup(setupCleanup);
    } catch (error) {
      try {
        disposePlugin();
      } catch {
        // Preserve the setup/registration error; rollback is best-effort.
      }
      throw error;
    }

    return disposePlugin;
  };

  const use = (option: RuntimePluginOption): Cleanup => {
    if (!option) return () => {};
    if (isRuntimePluginArray(option)) {
      const disposals: Cleanup[] = [];
      try {
        for (const nested of option) disposals.push(use(nested));
      } catch (error) {
        try {
          disposeCleanups(disposals);
        } catch {
          // Preserve the plugin installation error; rollback is best-effort.
        }
        throw error;
      }

      let active = true;
      return () => {
        if (!active) return;
        active = false;
        disposeCleanups(disposals);
      };
    }
    return installPlugin(option);
  };

  const h: HFactory = (
    type: string | Component<any, any>,
    props: object | null,
    ...children: Child[]
  ): VNode => {
    const context = { type, props: { ...props }, children, runtime };
    // Only a host ref can carry a part, and a part bypasses create hooks; skip the probe otherwise.
    if (typeof type === "string" && Object.hasOwn(context.props, "ref")) {
      const normalized = normalizeHostVNode(createBaseVNode(context));
      if (normalized.raw) return normalized;
    }
    return normalizeHostVNode(runCreateHooks(state, context));
  };

  const raw = (type: string, props: Props | null, ...children: Child[]): VNode =>
    normalizeHostVNode(
      createBaseVNode({ type, props: { ...props }, children, runtime, raw: true }),
    );

  const Fragment: FragmentComponent = (props) => props.children ?? null;
  fragments.add(Fragment);
  const targetHooks: RuntimeTargetHooks = {
    invokeComponent(component, props, contextScope) {
      let selected = component;
      for (const entry of state.resolveComponentHooks) {
        const replacement = entry.handler({ component, props, runtime });
        if (replacement !== undefined) {
          selected = replacement;
          break;
        }
      }
      return {
        ...invokeComponent(selected, props, runtime, contextScope),
        component: selected,
        semantic: fragments.has(selected)
          ? "fragment"
          : isContextProvider(selected)
            ? "context-provider"
            : undefined,
      };
    },
    transformVNode: (vnode) => runRenderHooks(state, runtime, vnode),
    replacementFor: (vnode) => replacementFor(state, vnode),
  };
  const createRenderer = <TNode>(
    strategy: RenderStrategy<TNode>,
    rendererOptions: RuntimeRendererOptions<TNode> = {},
  ): TargetRenderer<TNode> => {
    const defaultOnMount = (vnode: RenderableVNode): void => {
      const identity = vnode.componentPart;
      if (!identity || !registry.has(identity.component)) return;
      const hasShadow = state.shadowRegistry.list().some((shadow) => {
        return shadow.component.meta.name === identity.component && shadow.part === identity.part;
      });
      if (hasShadow) {
        throw new Error(
          `meowjsx target renderer needs an onMount hook for shadow ${identity.component}.${identity.part}`,
        );
      }
    };

    return createTargetRenderer(strategy, {
      invokeComponent(component, props, contextScope) {
        const invocation = targetHooks.invokeComponent(
          component as unknown as Component<any>,
          props as unknown as Props,
          contextScope,
        );
        return {
          child: invocation.child as unknown as RenderableChild,
          dispose: invocation.dispose,
          contextScope: invocation.contextScope,
          component: invocation.component as RenderableComponent,
          semantic: invocation.semantic,
        };
      },
      transformVNode(vnode) {
        return targetHooks.transformVNode(vnode as unknown as VNode) as unknown as RenderableVNode;
      },
      replacementFor(vnode) {
        return targetHooks.replacementFor(vnode as unknown as VNode) as
          | RenderableComponent
          | undefined;
      },
      onMount: rendererOptions.onMount ?? defaultOnMount,
      onError: rendererOptions.onError,
      observer: rendererOptions.observer,
    });
  };

  const registerShadows = (shadows: readonly AnyShadowDefinition[]): Cleanup => {
    const disposals = shadows.map((shadow) => state.shadowRegistry.register(shadow));
    let active = true;
    return () => {
      if (!active) return;
      active = false;
      for (const dispose of disposals.reverse()) dispose();
    };
  };

  Object.assign(runtime, {
    registry,
    shadowRegistry: state.shadowRegistry,
    h,
    raw,
    Fragment,
    targetHooks,
    createRenderer,
    registerComponent: registry.register,
    registerShadow: state.shadowRegistry.register,
    registerShadows,
    use,
  });

  for (const plugin of options.plugins ?? []) use(plugin);
  return runtime;
}

export const defaultRuntime = /* @__PURE__ */ createRuntime();

// A pure read lets bundlers drop the default runtime when none of these members is used.
/* @__NO_SIDE_EFFECTS__ */
function defaultMember<Key extends keyof Runtime>(key: Key): Runtime[Key] {
  return defaultRuntime[key];
}

export const registry = /* @__PURE__ */ defaultMember("registry");
export const h = /* @__PURE__ */ defaultMember("h");
export const raw = /* @__PURE__ */ defaultMember("raw");
export const Fragment = /* @__PURE__ */ defaultMember("Fragment");

export const registerComponent = /* @__PURE__ */ defaultMember("registerComponent");

export function useRuntime(plugin: RuntimePluginOption): Cleanup {
  return defaultRuntime.use(plugin);
}
