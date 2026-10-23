import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { renderToHtmlWithRuntime } from "meowjsx/web";
import { ActionRow, Button, CardFooter, createMeowUI, DialogActions } from "meowtail";

test("action rows render as plain rows; only a client measurement stacks them", () => {
  const html = renderToHtmlWithRuntime(
    createRuntime({ plugins: [createMeowUI()] }),
    h("div", null, [
      h(ActionRow, { align: "end" }, [
        h(Button, { variant: "quiet" }, "Cancel"),
        h(Button, null, "Save"),
      ]),
      h(CardFooter, null, h(Button, null, "Open")),
      h(DialogActions, null, h(Button, null, "Close")),
    ]),
  );
  expect(html).toContain('data-meowui-part="action-row/root"');
  expect(html).toContain('data-option-action-row-align="end"');
  expect(html).not.toContain("data-stacked");
  expect(html).not.toContain("data-measuring");
});
