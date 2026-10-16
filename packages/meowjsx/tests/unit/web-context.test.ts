import { expect, test } from "bun:test";
import { createContext, createRuntime, h, signal, useContext } from "../../src/index";
import { createWebRenderer } from "../../web/index";

test("HTML context is tree-local, supports prebuilt Signal children and nested independent renders", () => {
  const Value = createContext<string | undefined>("default");
  const Reader = () => String(useContext(Value));
  const prebuilt = h(Reader, {});
  const web = createWebRenderer(createRuntime());
  const other = createWebRenderer(createRuntime());
  const Reentrant = () => other.renderToHtml(prebuilt) + ":" + useContext(Value);
  const tree = h(Value.Provider, { value: "outer" }, [
    h("div", {}, prebuilt, h(Value.Provider, { value: "inner" }, signal(prebuilt)), prebuilt),
    h(Reentrant, {}),
    h(Value.Provider, { value: undefined }, prebuilt),
  ]);
  expect(web.renderToHtml(tree)).toBe("<div>outerinnerouter</div>default:outerundefined");
  expect(web.renderToHtml(prebuilt)).toBe("default");
  const Broken = () => {
    throw new Error("broken render");
  };
  expect(() => web.renderToHtml(h(Value.Provider, { value: "leak" }, h(Broken, {})))).toThrow(
    "broken render",
  );
  expect(other.renderToHtml(prebuilt)).toBe("default");
});
