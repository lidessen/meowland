import {
  defaultRuntime,
  type ElementType,
  type FragmentComponent,
  type Key,
  type Props,
  type Runtime,
  type VNode,
} from "./runtime";

export interface JSXRuntime {
  Fragment: FragmentComponent;
  jsx: JSXFactory;
  jsxs: JSXFactory;
  jsxDEV: JSXDevFactory;
}

export type JSXFactory = (type: ElementType, props: Props | null, key?: Key) => VNode;
export type JSXDevFactory = (
  type: ElementType,
  props: Props | null,
  key?: Key,
  isStaticChildren?: boolean,
  source?: unknown,
  self?: unknown,
) => VNode;

function createJSX(runtime: Runtime, type: ElementType, props: Props | null, key?: Key): VNode {
  const { children, ...rest } = props ?? {};
  if (key !== undefined) rest.key = key;
  return children === undefined
    ? runtime.h(type as any, rest as any)
    : runtime.h(type as any, rest as any, children);
}

export function createJSXRuntime(runtime: Runtime): JSXRuntime {
  const jsx: JSXFactory = (type, props, key) => createJSX(runtime, type, props, key);
  const jsxDEV: JSXDevFactory = (type, props, key) => createJSX(runtime, type, props, key);
  return {
    Fragment: runtime.Fragment,
    jsx,
    jsxs: jsx,
    jsxDEV,
  };
}

const defaultJSXRuntime = /* @__PURE__ */ createJSXRuntime(defaultRuntime);

// A pure read lets bundlers drop the default JSX runtime when none of these members is used.
/* @__NO_SIDE_EFFECTS__ */
function defaultMember<Key extends keyof JSXRuntime>(key: Key): JSXRuntime[Key] {
  return defaultJSXRuntime[key];
}

export const Fragment = /* @__PURE__ */ defaultMember("Fragment");
export const jsx = /* @__PURE__ */ defaultMember("jsx");
export const jsxs = /* @__PURE__ */ defaultMember("jsxs");
export const jsxDEV = /* @__PURE__ */ defaultMember("jsxDEV");
