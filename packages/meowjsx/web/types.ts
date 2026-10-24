import type { RefBinding, RefCallback, RefCleanup } from "../src/parts";
import type { Child, ClassValue } from "../src/types";

export type WebRefCleanup = RefCleanup;
export type WebRefCallback<TElement extends Element> = RefCallback<TElement>;
export type WebRef<TElement extends Element> = RefBinding<TElement>;
export type WebHostProps<TElement extends Element> = {
  [name: string]: unknown;
  children?: Child;
  className?: ClassValue;
  ref?: WebRef<TElement>;
};

export type WebIntrinsicElements = {
  [Tag in keyof HTMLElementTagNameMap]: WebHostProps<HTMLElementTagNameMap[Tag]>;
} & {
  [Tag in Exclude<keyof SVGElementTagNameMap, keyof HTMLElementTagNameMap>]: WebHostProps<
    SVGElementTagNameMap[Tag]
  >;
};

declare global {
  namespace JSX {
    interface IntrinsicElements extends WebIntrinsicElements {}
  }
}
