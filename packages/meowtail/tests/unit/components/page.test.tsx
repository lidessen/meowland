import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { installMeowUI } from "../../../src/registry";
import { Alert, Button, Page, Section, Toolbar } from "../../../src/components";
import { standardTheme, uiTokens } from "../../../src/theme";

function web() {
  const runtime = createRuntime();
  installMeowUI(runtime);
  return createWebRenderer(runtime);
}

test("Page arranges the identity block, toolbar, notice and content column", () => {
  const html = web().renderToHtml(
    <Page
      className="host-page"
      title="Build a page from regions"
      eyebrow="Guide · Composition"
      description="Page arranges the identity block and the page content rhythm."
      actions={<Button>Copy page link</Button>}
      leading={<span data-mark>M</span>}
      toolbar={
        <Toolbar label="Page tools">
          <Button size="small" variant="quiet">
            Filter
          </Button>
        </Toolbar>
      }
      notice={<Alert layout="bar">The draft is read-only while it is checked.</Alert>}
    >
      <Section title="Overview">The page arranges existing parts.</Section>
    </Page>,
  );
  expect(html).toContain('<div class="host-page" data-meowui-part="page/root">');
  for (const part of ["root", "header", "eyebrow", "toolbar", "notice", "content"])
    expect(html).toContain(`data-meowui-part="page/${part}"`);
  expect(html).toContain('<h1 data-meowui-part="page-header/title">Build a page from regions</h1>');
  expect(html).toContain('data-meowui-part="page-header/description"');
  expect(html).toContain('data-meowui-part="page-header/actions"');
  expect(html).toContain('data-meowui-part="page-header/leading"');
  expect(html).toContain("data-mark");
  expect(html).toContain('data-meowui-part="toolbar/root"');
  expect(html).toContain('role="status"');
  // The identity comes first, then the page tools and status, then the content.
  expect(html.indexOf('data-meowui-part="page/eyebrow"')).toBeLessThan(
    html.indexOf('data-meowui-part="page-header/title"'),
  );
  expect(html.indexOf('data-meowui-part="page-header/title"')).toBeLessThan(
    html.indexOf('data-meowui-part="page/toolbar"'),
  );
  expect(html.indexOf('data-meowui-part="page/toolbar"')).toBeLessThan(
    html.indexOf('data-meowui-part="page/notice"'),
  );
  expect(html.indexOf('data-meowui-part="page/notice"')).toBeLessThan(
    html.indexOf('data-meowui-part="page/content"'),
  );
  expect(html.indexOf('data-meowui-part="page/content"')).toBeLessThan(
    html.indexOf('data-meowui-part="section/root"'),
  );
});

test("Page's header escape replaces the identity and needs no title", () => {
  const html = web().renderToHtml(
    <Page
      eyebrow="Ignored eyebrow"
      description="Ignored description"
      actions={<Button>Ignored action</Button>}
      toolbar={<Button size="small">Filter</Button>}
      header={<nav aria-label="Page chrome">Host chrome</nav>}
    >
      Content
    </Page>,
  );
  expect(html).toContain('data-meowui-part="page/header"');
  expect(html).toContain('<nav aria-label="Page chrome">Host chrome</nav>');
  expect(html).toContain('data-meowui-part="page/toolbar"');
  expect(html).not.toContain('data-meowui-part="page-header/root"');
  expect(html).not.toContain('data-meowui-part="page/eyebrow"');
  expect(html).not.toContain("<h1");
  expect(html).not.toContain("Ignored eyebrow");
  expect(html).not.toContain("Ignored description");
  expect(html).not.toContain("Ignored action");
});

test("Page without a title or header renders no identity block", () => {
  const html = web().renderToHtml(
    <Page
      eyebrow="Ignored eyebrow"
      description="Ignored description"
      actions={<Button>Ignored action</Button>}
    >
      <Section title="Direct section">Body</Section>
    </Page>,
  );
  expect(html).toMatch(/^<div[^>]*data-meowui-part="page\/root"/);
  expect(html).not.toContain('data-meowui-part="page/header"');
  expect(html).not.toContain('data-meowui-part="page/eyebrow"');
  expect(html).not.toContain('data-meowui-part="page-header/root"');
  expect(html).not.toContain("<h1");
  expect(html).not.toContain("Ignored");
  expect(html).toContain('data-meowui-part="page/content"');
  // The section context does not depend on the identity block.
  expect(html).toContain('<h2 data-meowui-part="section/title">Direct section</h2>');
});

test("Page forwards its width to the existing Container and defaults to content", () => {
  const app = web();
  for (const width of ["narrow", "content", "wide", "full"] as const) {
    const html = app.renderToHtml(<Page title="Width" width={width} />);
    expect(html).toContain('data-meowui-part="container/root"');
    expect(html).toContain(`data-option-container-width="${width}"`);
    expect(html).not.toContain(` width="${width}"`);
  }
  const defaultWidth = app.renderToHtml(<Page title="Default width" />);
  expect(defaultWidth).toContain('data-option-container-width="content"');
});

test("Page is a content composition: it renders no frame, viewport or scroll owner", () => {
  const html = web().renderToHtml(<Page title="Content only">Body</Page>);
  expect(html).toMatch(/^<div[^>]*data-meowui-part="page\/root"/);
  expect(html).not.toContain('data-meowui-part="page-frame/root"');
  // The host shell owns the viewport and scrolling; the page region adds neither.
  expect(html).not.toMatch(/page\/root"[^>]*(?:height|overflow|scroll)/);
});

test("Page provides the level-1 section context to its content", () => {
  const html = web().renderToHtml(
    <Page title="Page title">
      <Section title="Direct section">
        <Section title="Nested section">Body</Section>
      </Section>
    </Page>,
  );
  expect(html).toContain('<h2 data-meowui-part="section/title">Direct section</h2>');
  expect(html).toContain('<h3 data-meowui-part="section/title">Nested section</h3>');
  expect([...html.matchAll(/<h1[\s>]/g)]).toHaveLength(1);
});

test("the standard theme paints every page part with the shared spacing step", () => {
  for (const part of ["root", "header", "eyebrow", "toolbar", "notice", "content"])
    expect(standardTheme.cssText).toContain(`data-meowui-part="page/${part}"`);
  expect(standardTheme.cssText).toContain(uiTokens.space.section.name);
});
