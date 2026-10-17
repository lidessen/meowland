import { expect, test } from "bun:test";
import { createRuntime, createThemePlugin, h, signal, type Child } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { installMeowUI } from "../../../src/registry";
import {
  AddButton,
  Alert,
  Button,
  Badge,
  Card,
  Dialog,
  DialogActions,
  DialogHeader,
  DialogPanel,
  EmptyState,
  Field,
  IconButton,
  Input,
  NavItem,
  Separator,
  Textarea,
  Toolbar,
} from "../../../src/components";

function web() {
  const result = createRuntime();
  installMeowUI(result);
  return createWebRenderer(result);
}

test("style option signals update normalized selections and preserve native props", () => {
  const app = web();
  const variant = signal<"quiet" | "danger" | undefined>("quiet");
  const view = (
    <Button variant={variant} size="small" className="caller" type="submit" disabled>
      Send
    </Button>
  );
  const first = app.renderToHtml(view);
  expect(first).toContain('class="caller"');
  expect(first).toContain('data-meowui-part="button/root"');
  expect(first).toContain('data-option-button-size="small"');
  expect(first).toContain('data-option-button-variant="quiet"');
  expect(first).toContain('type="submit" disabled');
  expect(first).not.toMatch(/\s(?:variant|size)="/);
  variant.value = "danger";
  expect(app.renderToHtml(view)).toContain('data-option-button-variant="danger"');
  variant.value = undefined;
  expect(app.renderToHtml(view)).toContain('data-option-button-variant="primary"');
});

test("icon and badge selections accept signals and restore per-instance defaults", () => {
  const app = web();
  const size = signal<"small" | undefined>("small");
  const tone = signal<"danger" | undefined>("danger");
  const view = [
    <IconButton label="Close" size={size} disabled>
      ×
    </IconButton>,
    <Badge tone={tone}>Status</Badge>,
  ];
  const html = app.renderToHtml(view);
  expect(html).toContain('aria-label="Close"');
  expect(html).toContain('data-option-icon-button-size="small"');
  expect(html).toContain('data-option-badge-tone="danger"');
  size.value = undefined;
  tone.value = undefined;
  const reset = app.renderToHtml(view);
  expect(reset).toContain('data-option-icon-button-size="default"');
  expect(reset).toContain('data-option-badge-tone="neutral"');
});

test("Alert binds tone to its own root and title without leaking into nested instances", () => {
  const app = web();
  const tone = signal<"danger" | "success">("danger");
  const view = (
    <Alert title="Outer" tone={tone} role="alert">
      <Alert title="Inner">Body</Alert>
    </Alert>
  );
  const html = app.renderToHtml(view);
  expect(html.match(/data-option-alert-tone="danger"/g)).toHaveLength(2);
  expect(html.match(/data-option-alert-tone="info"/g)).toHaveLength(2);
  expect(html).toContain('role="alert"');
  expect(html).toContain('role="status"');
  expect(html).not.toMatch(/\stone="/);
  tone.value = "success";
  const updated = app.renderToHtml(view);
  expect(updated.match(/data-option-alert-tone="success"/g)).toHaveLength(2);
  expect(updated.match(/data-option-alert-tone="info"/g)).toHaveLength(2);
});

test("unthemed base components preserve caller classes and native semantics", () => {
  const html = web().renderToHtml(
    <main>
      <Card as="article" className="feature-card">
        <Badge tone="accent" size="small" className="host-badge">
          Demo
        </Badge>
        <Field label="标题" htmlFor="title" description="Required" error="Missing">
          <Input id="title" name="title" required />
        </Field>
        <Textarea name="copy">Draft</Textarea>
        <Separator orientation="vertical" />
        <NavItem label="Notes" active icon="N" badge="2" />
        <IconButton label="Close" type="submit" disabled>
          ×
        </IconButton>
        <Toolbar label="编辑工具">
          <IconButton label="搜索">⌕</IconButton>
        </Toolbar>
        <AddButton variant="quiet" size="small" />
        <EmptyState title="Empty" copy="Add a note" action="Create" />
      </Card>
      <Dialog labelledBy="dialog-title" describedBy="dialog-description" open>
        <DialogPanel as="form" method="dialog">
          <DialogHeader
            title="确认"
            titleId="dialog-title"
            eyebrow="Note"
            description="Review"
            descriptionId="dialog-description"
            actions="Close"
          />
          <DialogActions>操作</DialogActions>
        </DialogPanel>
      </Dialog>
    </main>,
  );
  expect(html).toContain('<article class="feature-card"');
  expect(html).toContain('data-card-depth="0"');
  expect(html).toContain('data-option-badge-tone="accent"');
  expect(html).toContain('<label for="title" data-meowui-part="field/label">标题</label>');
  expect(html).toContain(
    'id="title-description" data-meowui-part="field/description">Required</span>',
  );
  expect(html).toContain('id="title-error" data-meowui-part="field/error">Missing</span>');
  expect(html).toContain('aria-describedby="title-description title-error"');
  expect(html).toContain('aria-invalid="true"');
  expect(html).toContain('id="title" name="title" required');
  expect(html).toContain('<textarea name="copy" data-meowui-part="textarea/root">Draft</textarea>');
  expect(html).toContain('role="separator" aria-orientation="vertical"');
  expect(html).toContain('aria-current="page"');
  expect(html).toContain('type="submit" disabled aria-label="Close"');
  expect(html).toContain('role="toolbar" aria-label="编辑工具" aria-orientation="horizontal"');
  expect(html).toContain('aria-labelledby="dialog-title" aria-describedby="dialog-description"');
  expect(html).toContain('<h2 id="dialog-title" data-meowui-part="dialog-header/title">确认</h2>');
  expect(html).toContain(
    '<p id="dialog-description" data-meowui-part="dialog-header/description">Review</p>',
  );
  expect(html).toContain('<form method="dialog" data-meowui-part="dialog-panel/root">');
  expect(html).not.toMatch(/\s(?:tone|size|active|orientation|as|label|variant)="/);
});

test("registered components expose stable parts without a visual plugin", () => {
  const app = web();
  const cases: [Child, string[]][] = [
    [<Card />, ["card/root"]],
    [<Badge />, ["badge/root"]],
    [<Input />, ["input/root"]],
    [<Textarea />, ["textarea/root"]],
    [<IconButton label="Close">×</IconButton>, ["icon-button/root"]],
    [<Toolbar label="编辑工具" />, ["toolbar/root"]],
    [<AddButton />, ["button/root"]],
    [<Separator />, ["separator/root"]],
    [
      <NavItem label="Notes" active icon="N" badge="2" />,
      ["nav-item/root", "nav-item/icon", "nav-item/label", "nav-item/badge"],
    ],
    [
      <Field label="Title" description="Required" error="Missing">
        <Input />
      </Field>,
      ["field/root", "field/label", "field/description", "field/control", "field/error"],
    ],
    [<Dialog />, ["dialog/root"]],
    [<DialogPanel />, ["dialog-panel/root"]],
    [<DialogActions />, ["dialog-actions/root"]],
    [
      <DialogHeader title="Title" eyebrow="Note" description="Review" actions="Close" />,
      [
        "dialog-header/root",
        "dialog-header/identity",
        "dialog-header/eyebrow",
        "dialog-header/title",
        "dialog-header/description",
        "dialog-header/actions",
      ],
    ],
    [
      <EmptyState title="Empty" copy="Add a note" action="Create" />,
      [
        "empty-state/root",
        "empty-state/illustration",
        "empty-state/title",
        "empty-state/description",
        "empty-state/action",
      ],
    ],
  ];
  for (const [view, parts] of cases) {
    const html = app.renderToHtml(view);
    for (const part of parts) expect(html).toContain(`data-meowui-part="${part}"`);
  }
});

test("theme sees original visual props while native elements do not", () => {
  const app = web();
  const seen: unknown[] = [];
  app.runtime.use(
    createThemePlugin({
      name: "host-style",
      resolve({ component }) {
        if (component.component !== "badge" || component.part !== "root") return null;
        seen.push(component.state);
        return { className: `custom-${component.state?.tone}` };
      },
    }),
  );
  const html = app.renderToHtml(
    <Badge tone="warning" size="small" className="host">
      Alert
    </Badge>,
  );
  expect(seen).toEqual([
    expect.objectContaining({ tone: "warning", size: "small", className: "host" }),
  ]);
  expect(html).toContain('class="host custom-warning"');
  expect(html).toContain('data-option-badge-tone="warning"');
  const nav = app.renderToHtml(<NavItem label="Notes" active className="host" />);
  expect(nav).toContain('class="host" aria-current="page"');
});

test("navigation retains zero as meaningful badge content", () => {
  const app = web();
  expect(app.renderToHtml(<NavItem label="等待审阅" badge={0} />)).toContain(
    '<span data-meowui-part="nav-item/badge">0</span>',
  );
  expect(app.renderToHtml(<NavItem label="等待审阅" badge={false} />)).not.toContain(
    'data-meowui-part="nav-item/badge"',
  );
});

test("empty states preserve caller status semantics and identity", () => {
  const html = web().renderToHtml(
    <EmptyState
      id="empty-records"
      role="status"
      aria-live="polite"
      title="No records"
      size="compact"
    />,
  );
  expect(html).toContain('id="empty-records"');
  expect(html).toContain('role="status"');
  expect(html).toContain('aria-live="polite"');
  expect(html).toContain('data-option-empty-state-size="compact"');
  expect(html).not.toContain(' size="compact"');
});
