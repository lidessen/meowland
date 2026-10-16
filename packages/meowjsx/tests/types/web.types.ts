import { createRuntime, h } from "meowjsx";
import { createWebRenderer, type SkeletonOptions, type WebRenderer } from "meowjsx/web";

declare const host: Element;
const web: WebRenderer = createWebRenderer(createRuntime());
const mounted = web.mount(h("p", {}, "Web target"), host);
mounted.unmount();
const skeleton: SkeletonOptions = { scope: host };
void skeleton;
// @ts-expect-error DOM mounting requires an Element, not a text identifier.
web.mount(h("p", {}, "Web target"), "host");
