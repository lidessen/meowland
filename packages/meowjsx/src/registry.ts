import { contextScopeForProvider, withContextScope, type ContextScope } from "./context";
import { createLifecycleScope } from "./lifecycle";
import type {
  AnyShadowDefinition,
  Child,
  Cleanup,
  Component,
  ComponentContract,
  ComponentRegistry,
  ComponentRenderContext,
  CreateContext,
  CreateHook,
  LifecycleScope,
  Props,
  RenderHook,
  ResolveComponentHook,
  Runtime,
  RuntimePluginEnforce,
  ShadowRegistry,
  VNode,
} from "./types";

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
    const firstNonPre = hooks.findIndex((hook) => hook.enforce !== "pre");
    if (firstNonPre >= 0) hooks.splice(firstNonPre, 0, entry);
    else hooks.push(entry);
    return entry;
  }

  if (enforce === "post") {
    hooks.push(entry);
    return entry;
  }

  const firstPost = hooks.findIndex((hook) => hook.enforce === "post");
  if (firstPost >= 0) hooks.splice(firstPost, 0, entry);
  else hooks.push(entry);
  return entry;
}

export function removeHook<Hook>(hooks: HookEntry<Hook>[], entry: HookEntry<Hook>): void {
  const index = hooks.indexOf(entry);
  if (index >= 0) hooks.splice(index, 1);
}

export function createComponentRegistry(initial: readonly ComponentContract[]): ComponentRegistry {
  const contracts = new Map<string, ComponentContract>();

  const register = (contract: ComponentContract): (() => void) => {
    if (!contract.name.trim()) throw new Error("meowjsx component contracts need a name");
    const previous = contracts.get(contract.name);
    contracts.set(contract.name, contract);
    let active = true;
    return () => {
      if (!active) return;
      active = false;
      if (contracts.get(contract.name) !== contract) return;
      if (previous) contracts.set(contract.name, previous);
      else contracts.delete(contract.name);
    };
  };

  for (const contract of initial) register(contract);

  return {
    register,
    get: (name) => contracts.get(name),
    has: (name) => contracts.has(name),
    list: () => [...contracts.values()],
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

  return {
    register,
    list: () => [...shadows],
  };
}

export function createComponentContext<
  PropsType extends object,
  Name extends string,
  Part extends string,
>(
  runtime: Runtime,
  contract: ComponentContract<Name, Part>,
  props: PropsType,
  scope: LifecycleScope,
): ComponentRenderContext<Name, Part, PropsType> {
  return {
    ...scope,
    component: contract,
    props,
    part(part, type, partProps, ...children) {
      return runtime.part(
        {
          component: contract.name,
          part,
          state: props as unknown as Readonly<Record<string, unknown>>,
        },
        type,
        partProps,
        ...children,
      );
    },
  };
}

interface ComponentInvocation {
  child: Child;
  dispose: Cleanup;
  contextScope?: ContextScope;
}

export function invokeComponent(
  component: Component<any, any, any>,
  props: Props,
  runtime: Runtime,
  contextScope?: ContextScope,
): ComponentInvocation {
  const scope = createLifecycleScope(runtime);
  const contract = component.contract;
  const componentContext = createComponentContext(
    runtime,
    contract ?? { name: "anonymous", parts: [] },
    props,
    scope,
  );

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
  if (context.children.length > 0) {
    props.children = context.children.length === 1 ? context.children[0] : context.children;
  }

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

  const dispatch = (index: number, nextContext: CreateContext): VNode => {
    const entry = state.createHooks[index];
    if (!entry) return createBaseVNode(nextContext);
    return entry.handler(nextContext, (updatedContext) => dispatch(index + 1, updatedContext));
  };

  return dispatch(0, context);
}

export function runRenderHooks(state: RuntimeState, runtime: Runtime, vnode: VNode): VNode {
  if (state.renderHooks.length === 0) return vnode;

  const dispatch = (index: number, nextVNode: VNode): VNode => {
    const entry = state.renderHooks[index];
    if (!entry) return nextVNode;
    return entry.handler({ vnode: nextVNode, runtime }, (updatedVNode) =>
      dispatch(index + 1, updatedVNode),
    );
  };

  return dispatch(0, vnode);
}
