import { isPartDescriptor, type PartDescriptor } from "meowjsx";
import { css as composeCSS, type CSSFragment as Fragment } from "../fragments";
import type { ClassValue } from "../class-values";
import type { Condition, TokenRef } from "../values";

export type CSSFragment = Fragment;

/** CSS composition emits part selectors while leaving theme assembly registry-free. */
export function css(
  strings: TemplateStringsArray,
  ...values: (string | number | TokenRef | Condition | PartDescriptor | ClassValue | CSSFragment)[]
): CSSFragment {
  const rendered = values.map((value) => {
    if (isPartDescriptor(value)) {
      return `:where([data-meowui-part=${JSON.stringify(`${value.component}/${value.part}`)}])`;
    }
    return value;
  });
  return composeCSS(strings, ...rendered);
}
