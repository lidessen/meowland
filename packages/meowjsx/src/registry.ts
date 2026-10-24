import { createPartDescriptor, normalizeRefBinding, isNormalizedRef } from "./parts";
import type {
  AnyShadowDefinition,
  Child,
  Cleanup,
  Component,
  ComponentMeta,
  ComponentRegistry,
  ComponentRenderContext,
  CreateContext,
  CreateHook,
  LifecycleScope,
  Props,
  RegisteredComponent,
  RenderHook,
  ResolveComponentHook,
  Runtime,
  RuntimePluginEnforce,
  ShadowRegistry,
  VNode,
} from "./types";
import { contextScopeForProvider, withContextScope, type ContextScope } from "./context";
import { createLifecycleScope } from "./lifecycle";

export interface HookEntry<Hook> {
  readonly handler: Hook;
  readonly enforce?: RuntimePluginEnforce;
}
export interface RuntimeState {
  createHooks: HookEntry<CreateHook>[];
  renderHooks: HookEntry<RenderHook>[];
  resolveComponentHooks: HookEntry<ResolveComponentHook>[];
  shadowRegistry: ShadowRegistry;
  overrides: Map<string, Component<any>>;
}
export function addHook<Hook>(
  hooks: HookEntry<Hook>[],
  handler: Hook,
  enforce: RuntimePluginEnforce | undefined,
): HookEntry<Hook> {
  const entry: HookEntry<Hook> = { handler, enforce };
  if (enforce === "pre") {
    const index = hooks.findIndex((hook) => hook.enforce !== "pre");
    if (index >= 0) hooks.splice(index, 0, entry);
    else hooks.push(entry);
    return entry;
  }
  if (enforce === "post") hooks.push(entry);
  else {
    const index = hooks.findIndex((hook) => hook.enforce === "post");
    if (index >= 0) hooks.splice(index, 0, entry);
    else hooks.push(entry);
  }
  return entry;
}
export function removeHook<Hook>(hooks: HookEntry<Hook>[], entry: HookEntry<Hook>): void {
  const index = hooks.indexOf(entry);
  if (index >= 0) hooks.splice(index, 1);
}

export function createComponentRegistry(
  initial: readonly RegisteredComponent[],
): ComponentRegistry {
  const components = new Map<string, RegisteredComponent>();
  const register = (component: RegisteredComponent): (() => void) => {
    const meta = component.meta;
    if (!meta?.name.trim()) throw new Error("meowjsx components need a nonempty meta.name");
    if (!Array.isArray(meta.parts) || new Set(meta.parts).size !== meta.parts.length)
      throw new Error(`meowjsx component ${meta.name} needs unique meta.parts`);
    if (meta.parts.some((part: string) => typeof part !== "string" || !part.trim()))
      throw new Error(`meowjsx component ${meta.name} has an invalid meta.parts entry`);
    const previous = components.get(meta.name);
    components.set(meta.name, component);
    let active = true;
    return () => {
      if (!active) return;
      active = false;
      if (components.get(meta.name) !== component) return;
      if (previous) components.set(meta.name, previous);
      else components.delete(meta.name);
    };
  };
  for (const component of initial) register(component);
  return {
    register,
    get: (name) => components.get(name),
    has: (name) => components.has(name),
    list: () => [...components.values()],
  };
}
export function createShadowRegistry(initial: readonly AnyShadowDefinition[] = []): ShadowRegistry {
  const shadows: AnyShadowDefinition[] = [];
  const register = (shadow: AnyShadowDefinition): Cleanup => {
    shadows.push(shadow);
    let active = true;
    return () => {
      if (!active) return;
      active = false;
      const index = shadows.lastIndexOf(shadow);
      if (index >= 0) shadows.splice(index, 1);
    };
  };
  for (const shadow of initial) register(shadow);
  return { register, list: () => [...shadows] };
}
export function createComponentContext<Meta extends ComponentMeta, PropsType extends object>(
  runtime: Runtime,
  component: Component<PropsType, Meta>,
  props: PropsType,
  scope: LifecycleScope,
): ComponentRenderContext<Meta, PropsType> {
  const meta = component.meta ?? ({ name: "anonymous", parts: [] } as unknown as Meta);
  const bindings = Object.create(null) as Record<string, ReturnType<typeof createPartDescriptor>>;
  for (const part of meta.parts)
    bindings[part] = createPartDescriptor(
      meta.name,
      part,
      props as unknown as Readonly<Record<string, unknown>>,
    );
  return {
    ...scope,
    component: meta,
    props,
    parts: Object.freeze(bindings) as ComponentRenderContext<Meta, PropsType>["parts"],
  };
}
interface ComponentInvocation {
  child: Child;
  dispose: Cleanup;
  contextScope?: ContextScope;
}
export function invokeComponent(
  component: Component<any, any>,
  props: Props,
  runtime: Runtime,
  contextScope?: ContextScope,
): ComponentInvocation {
  const scope = createLifecycleScope(runtime);
  const componentContext = createComponentContext(runtime, component, props, scope);
  try {
    return {
      child: withContextScope(contextScope, () => component(props, componentContext)),
      contextScope: contextScopeForProvider(component, props.value, contextScope),
      dispose: scope.dispose,
    };
  } catch (error) {
    scope.dispose();
    throw error;
  }
}
export function createBaseVNode(context: CreateContext): VNode {
  const props: Props = { ...context.props };
  if (context.children.length > 0)
    props.children = context.children.length === 1 ? context.children[0] : context.children;
  const key = props.key;
  return {
    type: context.type,
    props,
    ...(typeof key === "string" || typeof key === "number" ? { key } : {}),
    ...(context.raw ? { raw: true } : {}),
  };
}
export function runCreateHooks(state: RuntimeState, context: CreateContext): VNode {
  if (context.raw || state.createHooks.length === 0) return createBaseVNode(context);
  const dispatch = (index: number, next: CreateContext): VNode => {
    const entry = state.createHooks[index];
    if (!entry) return createBaseVNode(next);
    return entry.handler(next, (updated) => dispatch(index + 1, updated));
  };
  return dispatch(0, context);
}
export function runRenderHooks(state: RuntimeState, runtime: Runtime, vnode: VNode): VNode {
  if (state.renderHooks.length === 0) return vnode;
  const dispatch = (index: number, node: VNode): VNode => {
    const entry = state.renderHooks[index];
    if (!entry) return node;
    return entry.handler({ vnode: node, runtime }, (updated) => dispatch(index + 1, updated));
  };
  return normalizeHostVNode(dispatch(0, vnode));
}
export function normalizeHostVNode(vnode: VNode): VNode {
  if (typeof vnode.type !== "string" || !Object.hasOwn(vnode.props, "ref")) return vnode;
  if (isNormalizedRef(vnode.props.ref)) return vnode;
  const normalized = normalizeRefBinding(vnode.props.ref);
  const props = { ...vnode.props };
  if (normalized.ref) (props as Record<string, unknown>).ref = normalized.ref;
  else delete props.ref;
  if (!normalized.part) return { ...vnode, props };
  const current = vnode.componentPart;
  if (
    current &&
    (current.component !== normalized.part.component || current.part !== normalized.part.part)
  )
    throw new Error("meowjsx host refs cannot bind multiple distinct parts");
  return {
    ...vnode,
    raw: true,
    props,
    componentPart: {
      component: normalized.part.component,
      part: normalized.part.part,
      state: normalized.part.state,
    },
  };
}
export { isNormalizedRef, isPartDescriptor, mountRefBindings } from "./parts";
