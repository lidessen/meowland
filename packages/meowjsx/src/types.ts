import type { ContextScope } from "./context";
import type { KeyedChild } from "./keyed";
import type { PartDescriptor, RefBinding } from "./parts";
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
export type ClassValue =
  | string
  | (object & { toString(): string })
  | false
  | null
  | undefined
  | readonly ClassValue[]
  | ReadableSignal<ClassValue>;
export type Props = {
  [name: string]: unknown;
  children?: Child;
  className?: ClassValue;
  ref?: RefBinding<any>;
};

/** Open type-level registry for application component name completion. */
export interface ComponentRegistryMap {}
/** Open development-tool metadata; namespace owners extend this interface. */
export interface ComponentMetadata {}
export type RegisteredComponentName = Extract<keyof ComponentRegistryMap, string>;
export type RegisteredComponentPart<Name extends string> = Name extends keyof ComponentRegistryMap
  ? ComponentRegistryMap[Name] extends { parts: infer Part extends string }
    ? Part
    : string
  : string;

export interface ComponentMeta<
  Name extends string = string,
  Parts extends readonly string[] = readonly string[],
  Style = unknown,
> {
  readonly name: Name;
  readonly parts: Parts;
  readonly style?: Style;
}
export type ComponentPartRef<
  Name extends string = string,
  Part extends string = string,
> = PartDescriptor<Name, Part>;
export interface ComponentRegistry {
  register(component: RegisteredComponent): () => void;
  get(name: string): RegisteredComponent | undefined;
  has(name: string): boolean;
  list(): readonly RegisteredComponent[];
}
export interface LifecycleScope {
  readonly runtime: Runtime;
  effect(run: Effect): Cleanup;
  onCleanup(cleanup: Cleanup): void;
}
export interface ComponentRenderContext<
  Meta extends ComponentMeta = ComponentMeta,
  PropsType extends object = Props,
> extends LifecycleScope {
  readonly runtime: Runtime;
  readonly component: Meta;
  readonly props: PropsType;
  readonly parts: { readonly [Part in Meta["parts"][number]]: PartDescriptor<Meta["name"], Part> };
}
export type Component<
  PropsType extends object = Props,
  Meta extends ComponentMeta = ComponentMeta,
> = {
  (props: PropsType, context: ComponentRenderContext<Meta, PropsType>): Child;
  readonly meta?: Meta;
  metadata?: ComponentMetadata;
};
export type RegisteredComponent = Component<any, any> & { readonly meta: ComponentMeta };
export type ElementType = string | Component<any, any>;
export type Key = string | number;
export type Context<
  T extends { readonly meta: ComponentMeta } & ((...args: any[]) => any),
  PropsType extends object = Props,
> = ComponentRenderContext<T["meta"], PropsType>;

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
  className?: ClassValue;
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
export interface ShadowContext<
  PropsType extends object = Props,
  Name extends string = string,
  Part extends string = string,
  TNode = unknown,
> extends LifecycleScope {
  readonly component: ComponentPartRef<Name, Part>;
  readonly props: PropsType;
  readonly vnode: VNode;
  readonly element: TNode;
}
export interface ShadowDefinition<
  PropsType extends object = any,
  Name extends string = string,
  AllPart extends string = string,
  Part extends AllPart = AllPart,
  TNode = unknown,
> {
  readonly name: string;
  readonly component: RegisteredComponent;
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
  raw?: boolean;
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
  readonly component: Component<any, any>;
  readonly props: Readonly<Props>;
  readonly runtime: Runtime;
}
export type ResolveComponentHook = (
  context: ResolveComponentContext,
) => Component<any, any> | undefined;
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
  enforce?: RuntimePluginEnforce;
  setup?: RuntimePluginSetup;
  create?: CreateHook;
  render?: RenderHook;
  resolveComponent?: ResolveComponentHook;
  shadows?: readonly AnyShadowDefinition[];
  overrides?: Record<string, Component<any>>;
  components?: readonly RegisteredComponent[];
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
  components?: readonly RegisteredComponent[];
  shadows?: readonly AnyShadowDefinition[];
};
export interface MountResult {
  unmount(): void;
}
export type RuntimeRendererOptions<TNode> = Pick<
  RendererOptions<TNode>,
  "onMount" | "onError" | "observer"
>;
export interface RuntimeTargetHooks {
  invokeComponent(
    component: Component<any, any>,
    props: Props,
    contextScope?: ContextScope,
  ): {
    readonly child: Child;
    readonly dispose: Cleanup;
    readonly contextScope?: ContextScope;
    readonly component: Component<any, any>;
    readonly semantic?: "fragment" | "context-provider";
  };
  transformVNode(vnode: VNode): VNode;
  replacementFor(vnode: VNode): Component<any, any> | undefined;
}
export type FragmentComponent = (props: { children?: Child }) => Child;
export type HFactory = {
  <C extends Component<any, any>>(
    type: C,
    props: (Parameters<C> extends [] ? Props : Parameters<C>[0] & object) | null,
    ...children: Child[]
  ): VNode;
  (type: string, props: Props | null, ...children: Child[]): VNode;
};
export interface Runtime {
  readonly registry: ComponentRegistry;
  readonly shadowRegistry: ShadowRegistry;
  readonly h: HFactory;
  readonly raw: (type: string, props: Props | null, ...children: Child[]) => VNode;
  readonly Fragment: FragmentComponent;
  readonly targetHooks: RuntimeTargetHooks;
  readonly createRenderer: <TNode>(
    strategy: RenderStrategy<TNode>,
    options?: RuntimeRendererOptions<TNode>,
  ) => TargetRenderer<TNode>;
  registerComponent(component: RegisteredComponent): () => void;
  registerShadow(shadow: AnyShadowDefinition): Cleanup;
  registerShadows(shadows: readonly AnyShadowDefinition[]): Cleanup;
  use(plugin: RuntimePluginOption): Cleanup;
}

declare global {
  namespace JSX {
    type Element = VNode;
    type ElementType = keyof IntrinsicElements | Component<any, any>;
    interface ElementChildrenAttribute {
      children: {};
    }
    interface ElementClass {}
    interface IntrinsicElements {
      [elementName: string]: Props;
    }
  }
}
