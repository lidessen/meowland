import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import {
  Alert,
  AppBar,
  ChatStatus,
  ComposerPanel,
  PageFrame,
  installMeowUI,
  meowUIComponents,
} from "meowtail";

function web() {
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
  return createWebRenderer(runtime);
}

test("PageFrame puts notice and footer in named parts around the body", () => {
  const html = web().renderToHtml(
    <PageFrame
      variant="workspace"
      header={<AppBar title="Studio" status={<ChatStatus label="Offline" />} />}
      notice={<Alert tone="warning">Saved</Alert>}
      footer={<ComposerPanel placeholder="Message" />}
    >
      <p>Body</p>
    </PageFrame>,
  );
  for (const part of ["root", "header", "notice", "body", "footer"])
    expect(html).toContain(`data-meowui-part="page-frame/${part}"`);
  expect(html.indexOf("page-frame/notice")).toBeLessThan(html.indexOf("page-frame/body"));
  expect(html.indexOf("page-frame/body")).toBeLessThan(html.indexOf("page-frame/footer"));
  expect(html).toContain('data-meowui-part="app-bar/root"');
  expect(html).toContain('data-meowui-part="alert/root"');
  expect(html).toContain('data-meowui-part="composer-panel/root"');
});

test("AppBar exposes title, status and actions", () => {
  const html = web().renderToHtml(
    <AppBar
      title="Studio MacBook"
      status={<ChatStatus label="Offline" />}
      actions={<button>Reconnect</button>}
    />,
  );
  for (const part of ["root", "identity", "title", "status", "actions"])
    expect(html).toContain(`data-meowui-part="app-bar/${part}"`);
  expect(html).toContain('<h1 data-meowui-part="app-bar/title">Studio MacBook</h1>');
});
