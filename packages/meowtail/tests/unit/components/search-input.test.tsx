import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { Field, SearchInput, installMeowUI } from "../../../src/index";

test("SearchInput keeps native input semantics and Field associations without a runtime visual plugin", () => {
  const runtime = createRuntime();
  installMeowUI(runtime);
  const onInput = (_event: Event) => {};
  let inputProps: Record<string, unknown> | undefined;
  runtime.use({
    render({ vnode }, next) {
      if (vnode.type === "input") inputProps = vnode.props;
      return next(vnode);
    },
  });
  const web = createWebRenderer(runtime);
  const view = (
    <Field label="查找" htmlFor="query" description="本地结果" error="查询有误">
      <SearchInput
        id="query"
        label="查找"
        name="q"
        value="主题"
        disabled
        readOnly
        onInput={onInput}
      />
    </Field>
  );
  const html = web.renderToHtml(view);
  expect(inputProps).toMatchObject({
    id: "query",
    name: "q",
    value: "主题",
    disabled: true,
    readOnly: true,
    onInput,
    type: "search",
    "aria-label": "查找",
    "aria-invalid": "true",
    "aria-describedby": "query-description query-error",
  });
  expect(html).toContain('data-meowui-part="search-input/root"');
  expect(html).toContain('data-meowui-part="search-input/control"');
});
