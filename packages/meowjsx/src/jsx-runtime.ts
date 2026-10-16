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
  return children === undefined ? runtime.h(type, rest) : runtime.h(type, rest, children);
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

const defaultJSXRuntime = createJSXRuntime(defaultRuntime);

export const Fragment = defaultJSXRuntime.Fragment;
export const jsx = defaultJSXRuntime.jsx;
export const jsxs = defaultJSXRuntime.jsxs;
export const jsxDEV = defaultJSXRuntime.jsxDEV;
