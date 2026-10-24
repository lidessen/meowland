import {
  createContext,
  useContext,
  defineShadow,
  h,
  keyed,
  type Child,
  type ClassValue,
  type Component,
  type Context,
  type LifecycleScope,
  type ShadowContext,
  type Props,
  type ThemeStyle,
  type RuntimePlugin,
  type RuntimePluginOption,
} from "../../src/runtime";
import { mapSignal, signal } from "meowjsx/signal";
import type { MaybeSignal, ReadableSignal, Signal, WritableSignal } from "meowjsx/signal";

const externalSignal: ReadableSignal<number> = { value: 1, subscribe: () => () => {} };
const writableSignal: WritableSignal<number> = signal(1);
const readableSignal: Signal<number> = externalSignal;
const maybeSignal: MaybeSignal<number> = readableSignal;
void writableSignal;
void maybeSignal;

const classList: ClassValue = ["base", [false, null, undefined, signal("active")]] as const;
const classProps: Props = { className: signal<ClassValue>(classList) };
const themeClasses: ThemeStyle = { className: [classList, { toString: () => "surface" }] };
const classNode = <div className={classList} />;
void classProps;
void themeClasses;
void classNode;
// @ts-expect-error Class lists accept false as an omission, not true.
const invalidClass: ClassValue = true;
void invalidClass;

type Assert<T extends true> = T;
type _LifecycleHasNoSignalFactory = Assert<"signal" extends keyof LifecycleScope ? false : true>;
type _ComponentHasNoSignalFactory = Assert<
  "signal" extends keyof Context<typeof Card> ? false : true
>;
type _ShadowHasNoSignalFactory = Assert<"signal" extends keyof ShadowContext ? false : true>;
const rows = signal<readonly { id: string; label: string }[]>([]);
const keyedChild: Child = keyed(
  rows,
  (row) => row.id,
  (row) =>
    h(
      "p",
      {},
      mapSignal(row, (value) => value.label),
    ),
);
void keyedChild;
keyed(
  rows,
  // @ts-expect-error Keyed identity must be a string or number.
  () => true,
  () => null,
);
keyed(
  rows,
  (row) => row.id,
  (row) => {
    // @ts-expect-error Per-row signals are read-only to consumers.
    row.value = { id: "replacement", label: "replacement" };
    return null;
  },
);
type IsAssignable<From, To> = From extends To ? true : false;

const syncComponent = (props: { label: string }): Child => <span>{props.label}</span>;
const asyncComponent = async (props: { label: string }) => <span>{props.label}</span>;
async function* streamComponent(props: { label: string }) {
  yield <span>{props.label}</span>;
}
const signalComponent = (props: { label: string }) => signal(<span>{props.label}</span>);

const typedAsyncComponent: Component<{ label: string }> = async (props) => (
  <span>{props.label}</span>
);
const typedStreamComponent: Component<{ label: string }> = async function* (props) {
  yield <span>{props.label}</span>;
};

const noPropsNode = h(() => "constant", {});
void noPropsNode;
const syncNode = h(syncComponent, { label: "sync" });
const asyncNode = h(asyncComponent, { label: "promise" });
const streamNode = h(streamComponent, { label: "stream" });
const signalNode = h(signalComponent, { label: "signal" });
const typedAsyncNode = h(typedAsyncComponent, { label: "typed promise" });
const typedStreamNode = h(typedStreamComponent, { label: "typed stream" });

const SyncComponent = syncComponent;
const AsyncComponent = asyncComponent;
const StreamComponent = streamComponent;
const SignalComponent = signalComponent;

const childValues: Child[] = [
  syncNode,
  asyncNode,
  streamNode,
  signalNode,
  typedAsyncNode,
  typedStreamNode,
  signal("text"),
];
const syncJsxNode: JSX.Element = <SyncComponent label="sync" />;
const asyncJsxNode: JSX.Element = <AsyncComponent label="promise" />;
const streamJsxNode: JSX.Element = <StreamComponent label="stream" />;
const signalJsxNode: JSX.Element = <SignalComponent label="signal" />;

type _SyncComponentIsComponent = Assert<
  IsAssignable<typeof syncComponent, Component<{ label: string }>>
>;
type _AsyncComponentIsComponent = Assert<
  IsAssignable<typeof asyncComponent, Component<{ label: string }>>
>;
type _StreamComponentIsComponent = Assert<
  IsAssignable<typeof streamComponent, Component<{ label: string }>>
>;
type _SignalComponentIsComponent = Assert<
  IsAssignable<typeof signalComponent, Component<{ label: string }>>
>;
type _ChildrenAcceptComponentResults = Assert<IsAssignable<typeof childValues, Child[]>>;
type _SyncJSXIsVNode = Assert<IsAssignable<typeof syncJsxNode, JSX.Element>>;
type _AsyncJSXIsVNode = Assert<IsAssignable<typeof asyncJsxNode, JSX.Element>>;
type _StreamJSXIsVNode = Assert<IsAssignable<typeof streamJsxNode, JSX.Element>>;
type _SignalJSXIsVNode = Assert<IsAssignable<typeof signalJsxNode, JSX.Element>>;

// @ts-expect-error Components still validate required props in TSX.
const _missingRequiredProp = <SyncComponent />;
// @ts-expect-error Component props retain their declared types.
const _wrongPropType = <AsyncComponent label={42} />;
// @ts-expect-error h() infers a component's props instead of accepting arbitrary values.
const _wrongHPropType = h(StreamComponent, { label: 42 });

const cardContract = {
  name: "card",
  parts: ["root", "title"],
} as const;

type CardProps = { title: string };

function Card({ title }: CardProps, context: Context<typeof Card>): Child {
  // @ts-expect-error The one-argument context still exposes only declared parts.
  void context.parts.description;
  return (
    <article ref={context.parts.root}>
      <h2 ref={context.parts.title}>{title}</h2>
    </article>
  );
}
Card.meta = cardContract;
const CardRootShadow = defineShadow(Card, "root", (props, { component, element, effect }) => {
  const name: "card" = component.component;
  const part: "root" | "title" = component.part;
  // Core owns the shadow contract, not a target node: the host handle stays
  // target-neutral until a target package narrows it.
  const handle: unknown = element;
  effect(() => {
    void handle;
    void props.title;
  });
  void name;
  void part;
});

// @ts-expect-error Shadows can only target metadata-declared parts.
const _invalidCardShadow = defineShadow(Card, "description", () => {});
void _invalidCardShadow;

const cardNode: JSX.Element = <Card title="Typed card" />;
const cardFactoryNode = h(Card, { title: "Factory card" });
// @ts-expect-error h preserves props for a component with a required typed context.
const invalidCardFactoryNode = h(Card, { title: 42 });
void cardFactoryNode;
void invalidCardFactoryNode;
const ComponentValue = createContext(Card);
const componentProvider = (
  <ComponentValue.Provider value={Card}>{cardNode}</ComponentValue.Provider>
);
const providedComponent: typeof Card = useContext(ComponentValue);
void componentProvider;
void providedComponent;
void CardRootShadow;
void cardNode;

const lifecyclePlugin: RuntimePlugin = {
  name: "typed-plugin",
  enforce: "pre",
  setup({ runtime, registry, shadowRegistry, onCleanup }) {
    const contracts = registry.list();
    const shadows = shadowRegistry.list();
    onCleanup(() => {
      void runtime;
      void contracts;
      void shadows;
    });
  },
};

const pluginOptions: readonly RuntimePluginOption[] = [false, [lifecyclePlugin], null, undefined];

// @ts-expect-error Runtime plugin ordering only accepts pre or post.
const _invalidPluginOrder: RuntimePlugin = { enforce: "middle" };

const resolverPlugin: RuntimePlugin = {
  resolveComponent({ component, props }) {
    // @ts-expect-error resolver props are readonly
    props.children = "changed";
    return component;
  },
};
void resolverPlugin;
void pluginOptions;
void _invalidPluginOrder;
