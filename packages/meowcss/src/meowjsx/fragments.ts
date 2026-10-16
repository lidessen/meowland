import type { ComponentContract } from "meowjsx";
import { css as composeCSS, type CSSFragment as Fragment } from "../fragments";
import type { Condition, TokenRef } from "../values";
import type { PartSelector } from "./parts";

export type CSSFragment = Fragment<ComponentContract>;

/** The core preserves opaque dependencies; this adapter types them as component contracts. */
export function css(
  strings: TemplateStringsArray,
  ...values: (string | number | TokenRef | Condition | PartSelector | CSSFragment)[]
): CSSFragment {
  return composeCSS(strings, ...values) as CSSFragment;
}
