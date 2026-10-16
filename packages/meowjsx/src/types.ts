import type { ContextScope } from "./context";
import type { KeyedChild } from "./keyed";
import type { RendererOptions, RenderStrategy, Renderer as TargetRenderer } from "./renderer";

export interface ReadableSignal<T = unknown> {
  readonly value: T;
  subscribe(listener: (value: T) => void): () => void;
}

export interface WritableSignal<T = unknown> extends ReadableSignal<T> {
  value: T;
  set(value: T): void;
  update(updater: (previous: T) => T): void;
}

export type Signal<T = unknown> = ReadableSignal<T>;
export type MaybeSignal<T> = T | ReadableSignal<T>;
export type Cleanup = () => void;
export type Effect = () => void | Cleanup;

export type Child =
  | VNode
  | KeyedChild<any>
  | ReadableSignal<unknown>
  | string
  | number
  | boolean
  | null
  | undefined
  | Child[]
  | PromiseLike<Child>
  | AsyncIterable<Child>;

export type Props = {
  [name: string]: unknown;
  children?: Child;
};

/**
 * Open type-level registry. Component packages extend this interface with
 * declaration merging so themes can offer component/part completion without
 * making the runtime depend on a particular UI library.
 */
export interface ComponentRegistryMap {}

/** Open development-tool metadata; namespace owners extend this interface. */
export interface ComponentMetadata {}

export type RegisteredComponentName = Extract<keyof ComponentRegistryMap, string>;
export type RegisteredComponentPart<Name extends string> = Name extends keyof ComponentRegistryMap
  ? ComponentRegistryMap[Name] extends { parts: infer Part extends string }
    ? Part
    : string
  : string;

export interface ComponentContract<Name extends string = string, Part extends string = string> {
  readonly name: Name;
  readonly parts: readonly Part[];
}

export interface ComponentPartRef<Name extends string = string, Part extends string = string> {
  readonly component: Name;
  readonly part: Part;
  readonly state?: Readonly<Record<string, unknown>>;
}

export interface ComponentRegistry {
  register(contract: ComponentContract): () => void;
  get(name: string): ComponentContract | undefined;
  has(name: string): boolean;
  list(): readonly ComponentContract[];
}

export interface ComponentRenderContext<
  Name extends string = string,
  Part extends string = string,
  PropsType extends object = Props,
> extends LifecycleScope {
  readonly runtime: Runtime;
  readonly component: ComponentContract<Name, Part>;
  readonly props: PropsType;
  part(part: Part, type: string, props: Props | null, ...children: Child[]): VNode;
}

export interface LifecycleScope {
  readonly runtime: Runtime;
  signal<T>(initialValue: T): WritableSignal<T>;
  effect(run: Effect): Cleanup;
  onCleanup(cleanup: Cleanup): void;
}

export type Component<
  PropsType extends object = Props,
  Name extends string = string,
  Part extends string = string,
> = {
  (props: PropsType, context?: ComponentRenderContext<Name, Part, PropsType>): Child;
  readonly contract?: ComponentContract<Name, Part>;
  metadata?: ComponentMetadata;
};

export type ElementType = string | Component<any, any, any>;
export type Key = string | number;

export type StyleScalar =
  | string
  | number
  | boolean
  | null
  | undefined
  | ReadableSignal<string | number | boolean | null | undefined>;
export type StyleObject = Record<string, StyleScalar>;
export type StyleValue = string | StyleObject;

export interface ThemeStyle {
  className?: MaybeSignal<string | null | undefined>;
  style?: MaybeSignal<StyleValue | null | undefined>;
  props?: Props;
}

export interface ThemeContext {
  readonly component: ComponentPartRef;
  readonly vnode: VNode;
  readonly runtime: Runtime;
}

export type ThemeRule<Name extends string = string, Part extends string = string> =
  | ThemeStyle
  | ((
      context: ThemeContext & { component: ComponentPartRef<Name, Part> },
    ) => ThemeStyle | null | undefined);

/**
 * A shadow runs against one target-owned host handle. Core keeps the contract
 * and the lifecycle; the target package decides what `element` actually is and
 * narrows `TNode` (the Web package narrows it to a real element).
 */
export interface ShadowContext<
  PropsType extends object = Props,
  Name extends string = string,
  Part extends string = string,
  TNode = unknown,
> extends LifecycleScope {
  readonly component: ComponentPartRef<Name, Part>;
  readonly props: PropsType;
  readonly vnode: VNode;
  /** The target-owned host handle for this part. */
  readonly element: TNode;
}

export interface ShadowDefinition<
  PropsType extends object = Props,
  Name extends string = string,
  AllPart extends string = string,
  Part extends AllPart = AllPart,
  TNode = unknown,
> {
  /** A debugging label; the definition is not a component or VNode. */
  readonly name: string;
  readonly contract: ComponentContract<Name, AllPart>;
  readonly part: Part;
  readonly setup: ShadowSetup<PropsType, Name, Part, TNode>;
}

export type AnyShadowDefinition = ShadowDefinition<any, any, any, any, any>;

export type ShadowSetup<
  PropsType extends object = Props,
  Name extends string = string,
  Part extends string = string,
  TNode = unknown,
> = (props: PropsType, context: ShadowContext<PropsType, Name, Part, TNode>) => void | Cleanup;

export interface ShadowRegistry {
  register(shadow: AnyShadowDefinition): Cleanup;
  list(): readonly AnyShadowDefinition[];
}

/**
 * A typed rule table for theme authors. UI packages extend ComponentRegistryMap;
 * the resulting component and part names then become editor completions here.
 * The string index keeps the registry open for application-specific packages.
 */
export type ThemeRules = {
  [Name in RegisteredComponentName]?: {
    [Part in RegisteredComponentPart<Name>]?: ThemeRule<Name, Part>;
  };
} & Record<string, unknown>;

export interface Theme {
  readonly name?: string;
  resolve(context: ThemeContext): ThemeStyle | null | undefined;
}

export interface VNode {
  type: ElementType;
  props: Props;
  key?: Key;
  /** Internal escape hatch used by base components to render a native element. */
  raw?: boolean;
  /** Component/part identity consumed by registered runtime themes. */
  componentPart?: ComponentPartRef;
}

export interface CreateContext {
  type: ElementType;
  props: Props;
  children: Child[];
  runtime: Runtime;
  raw?: boolean;
}

export type CreateHook = (context: CreateContext, next: (context: CreateContext) => VNode) => VNode;

export interface RenderContext {
  vnode: VNode;
  runtime: Runtime;
}

export type RenderHook = (context: RenderContext, next: (vnode: VNode) => VNode) => VNode;

export interface ResolveComponentContext {
  readonly component: Component<any, any, any>;
  readonly props: Readonly<Props>;
  readonly runtime: Runtime;
}

/** Selects a component before its lifecycle scope exists; the first result wins. */
export type ResolveComponentHook = (
  context: ResolveComponentContext,
) => Component<any, any, any> | undefined;

export type RuntimePluginEnforce = "pre" | "post";

export interface RuntimePluginContext {
  readonly runtime: Runtime;
  readonly registry: ComponentRegistry;
  readonly shadowRegistry: ShadowRegistry;
  onCleanup(cleanup: Cleanup): void;
}

export type RuntimePluginSetup = (context: RuntimePluginContext) => void | Cleanup;

export type RuntimePlugin = {
  name?: string;
  /** Hooks marked `pre` run before normal hooks; `post` hooks run after them. */
  enforce?: RuntimePluginEnforce;
  /** Runs once after this plugin's contributions have been registered. */
  setup?: RuntimePluginSetup;
  create?: CreateHook;
  render?: RenderHook;
  resolveComponent?: ResolveComponentHook;
  shadows?: readonly AnyShadowDefinition[];
  overrides?: Record<string, Component<any>>;
  components?: readonly ComponentContract[];
};

export type RuntimePluginOption =
  | RuntimePlugin
  | readonly RuntimePluginOption[]
  | false
  | null
  | undefined;

export type RuntimeOptions = {
  plugins?: readonly RuntimePluginOption[];
  overrides?: Record<string, Component<any>>;
  components?: readonly ComponentContract[];
  shadows?: readonly AnyShadowDefinition[];
};

export interface MountResult {
  unmount(): void;
}

/**
 * Target-owned capabilities for the runtime renderer. The target must provide
 * an onMount hook when it supports registered component-part shadows; the
 * runtime does not pass a host node to a target that did not ask for one.
 */
export type RuntimeRendererOptions<TNode> = Pick<
  RendererOptions<TNode>,
  "onMount" | "onError" | "observer"
>;

/**
 * Runtime-owned operations a target renderer needs. `Runtime.createRenderer()`
 * injects these into a strategy-based renderer; a target that owns its output
 * loop instead of a node tree (the Web package's static HTML serializer) reads
 * the same operations here instead of copying component, hook, or override
 * semantics. Nothing platform-specific crosses this seam.
 */
export interface RuntimeTargetHooks {
  invokeComponent(
    component: Component<any, any, any>,
    props: Props,
    contextScope?: ContextScope,
  ): {
    readonly child: Child;
    readonly dispose: Cleanup;
    readonly contextScope?: ContextScope;
    readonly component: Component<any, any, any>;
    readonly semantic?: "fragment" | "context-provider";
  };
  transformVNode(vnode: VNode): VNode;
  replacementFor(vnode: VNode): Component<any, any, any> | undefined;
}

export type FragmentComponent = (props: { children?: Child }) => Child;

export interface Runtime {
  readonly registry: ComponentRegistry;
  readonly shadowRegistry: ShadowRegistry;
  readonly h: <PropsType extends object, Name extends string, Part extends string>(
    type: string | Component<PropsType, Name, Part>,
    props: PropsType | null,
    ...children: Child[]
  ) => VNode;
  readonly raw: (type: string, props: Props | null, ...children: Child[]) => VNode;
  readonly part: (
    identity: ComponentPartRef,
    type: string,
    props: Props | null,
    ...children: Child[]
  ) => VNode;
  readonly Fragment: FragmentComponent;
  /**
   * Runtime hooks a target renderer drives itself. A target that mounts into a
   * host (the Web package's DOM renderer) should prefer `createRenderer()`.
   */
  readonly targetHooks: RuntimeTargetHooks;
  readonly createRenderer: <TNode>(
    strategy: RenderStrategy<TNode>,
    options?: RuntimeRendererOptions<TNode>,
  ) => TargetRenderer<TNode>;
  registerComponent(contract: ComponentContract): () => void;
  registerShadow(shadow: AnyShadowDefinition): Cleanup;
  registerShadows(shadows: readonly AnyShadowDefinition[]): Cleanup;
  use(plugin: RuntimePluginOption): Cleanup;
}

declare global {
  namespace JSX {
    type Element = VNode;
    type ElementType = keyof IntrinsicElements | ((props: any) => Child);

    interface ElementChildrenAttribute {
      children: {};
    }

    interface ElementClass {}
    interface IntrinsicElements {
      [elementName: string]: Props;
    }
  }
}
