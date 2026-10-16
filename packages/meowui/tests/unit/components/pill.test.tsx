import { expect, test } from "bun:test";
import { h } from "meowjsx";
import { renderToHtml } from "meowjsx/web";
import { Pill } from "../../../src/components/pill";
import { installMeowUI } from "../../../src/registry";

installMeowUI();
test("pill facts remain spans and actions use native buttons", () => {
  const fact = renderToHtml(<Pill active>退出码 1</Pill>);
  expect(fact).toContain("<span");
  expect(fact).toContain('data-active="true"');
  const action = renderToHtml(
    <Pill onClick={() => {}} disabled aria-pressed="false">
      筛选
    </Pill>,
  );
  expect(action).toContain("<button");
  expect(action).toContain('type="button"');
  expect(action).toContain("disabled");
});
