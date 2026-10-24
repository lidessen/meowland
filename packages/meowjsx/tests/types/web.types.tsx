import { createRuntime, h, type Context } from "../../src/runtime";
import {
  createWebRenderer,
  type SkeletonOptions,
  type WebRef,
  type WebRenderer,
} from "../../web/index";
import type {} from "../../web/index";

const host = document.createElement("main");
function Input(
  { label }: { readonly label: string },
  context: Context<typeof Input, { readonly label: string }>,
) {
  const typedLabel: string = context.props.label;
  // @ts-expect-error Component context preserves the declared props.
  const invalidLabel: number = context.props.label;
  void typedLabel;
  void invalidLabel;
  return (
    <input
      aria-label={label}
      ref={[context.parts.control, [(element) => element.select()], forwardedRef]}
    />
  );
}
Input.meta = { name: "type-input", parts: ["control"] } as const;
const forwardedRef: WebRef<HTMLInputElement> = (element) => element.focus();
const automaticInput = <input ref={[undefined, [false, (element) => element.select()], null]} />;
const svgRefs = (
  <svg
    ref={[
      (element) => {
        element.createSVGRect();
      },
      undefined,
    ]}
  />
);
const sectionRef = <section ref={(element) => element.focus()} />;
const circleRef = (
  <circle
    ref={(element) => {
      void element.cx.baseVal.value;
    }}
  />
);

type Assert<T extends true> = T;
type _WebRendererHasNoMountAlias = Assert<"mount" extends keyof WebRenderer ? false : true>;
const web: WebRenderer = createWebRenderer(createRuntime());
const mounted = web.render(h("p", {}, "Web target"), host);
mounted.unmount();
const skeleton: SkeletonOptions = { scope: host };

const selectInput = <input ref={(element) => element.select()} />;
const inputRef: WebRef<HTMLInputElement> = [
  (element) => element.setSelectionRange(0, 1),
  false,
  undefined,
  null,
];
const elementRef: WebRef<HTMLInputElement> = (element) => element.select();
// @ts-expect-error Wrong node types are rejected by Web intrinsic refs.
const wrongNode = <input ref={(element: HTMLButtonElement) => element.click()} />;
// @ts-expect-error Async callbacks are not valid ref bindings.
const asyncRef = <input ref={async (element) => element.select()} />;
// @ts-expect-error Async cleanup callbacks are not valid ref bindings.
const asyncCleanupRef = <input ref={(element) => async () => element.select()} />;
void skeleton;
void selectInput;
void inputRef;
void elementRef;
void wrongNode;
void asyncRef;
void asyncCleanupRef;
void automaticInput;
void svgRefs;
void sectionRef;
void circleRef;
// @ts-expect-error DOM mounting requires an Element, not a text identifier.
web.render(h("p", {}, "Web target"), "host");
