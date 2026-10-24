import { expect, test } from "bun:test";
import { h, defaultRuntime } from "meowjsx";
import { renderToHtml } from "meowjsx/web";
import { DetailSection } from "../../../src/components/detail-section";
import { Drawer } from "../../../src/components/drawer";
import { ListGroup, ListRow } from "../../../src/components/list-group";
import { PageHeader } from "../../../src/components/page-header";
import { ResourceCard } from "../../../src/components/resource-card";
import { ResourceLink } from "../../../src/components/resource-link";
import { Timeline, TimelineItem } from "../../../src/components/timeline";
import { installMeowUI, meowUIComponents } from "../../../src/registry";

installMeowUI({ components: meowUIComponents }, defaultRuntime);

test("detail sections keep a heading, an optional aside and their body", () => {
  const html = renderToHtml(
    <DetailSection title="Delegated execution" aside="2 times">
      <p>Content</p>
    </DetailSection>,
  );
  expect(html).toContain("<h3");
  expect(html).toContain("Delegated execution");
  expect(html).toContain("2 times");
  expect(html).toContain("<p>Content</p>");
  expect(renderToHtml(<DetailSection title="Goal" />)).not.toContain("detail-section/aside");
});

test("timeline items are list entries whose marker carries one state", () => {
  const html = renderToHtml(
    <Timeline>
      <TimelineItem
        state="processing"
        title="Review the record format"
        stateLabel="In progress"
        description="Started at 09:46"
        actions={<button type="button">View outcome</button>}
      />
      <TimelineItem state="returned" title="Draft the record body" stateLabel="Returned" />
    </Timeline>,
  );
  expect(html.startsWith("<ol")).toBe(true);
  expect(html.match(/<li/g)?.length).toBe(2);
  expect(html).toContain('data-option-status-dot-state="processing"');
  expect(html).toContain('data-option-status-dot-state="returned"');
  expect(html).toContain("View outcome");
});

test("a resource link is an anchor for a destination and a button for an action", () => {
  expect(renderToHtml(<ResourceLink href="/records/a" title="Record" />).startsWith("<a")).toBe(
    true,
  );
  const action = renderToHtml(<ResourceLink title="Material" detail="Selected material" />);
  expect(action.startsWith("<button")).toBe(true);
  expect(action).toContain('type="button"');
  expect(action).toContain("Selected material");
});

test("page headers name the page and carry page-level actions", () => {
  const html = renderToHtml(
    <PageHeader
      title="Expanded"
      titleId="t"
      description="Description"
      actions={<button>Refresh</button>}
    />,
  );
  expect(html).toContain('<h1 id="t"');
  expect(html).toContain("Description");
  expect(html).toContain("Refresh");
  expect(html).not.toContain('data-meowui-part="page-header/leading"');
  expect(html).not.toContain('data-meowui-part="page-header/heading"');
});

test("a page header can lead the title with a mark", () => {
  const html = renderToHtml(
    <PageHeader title="Library" leading={<span data-mark>M</span>} description="Local notes" />,
  );
  expect(html).toContain('data-meowui-part="page-header/leading"');
  expect(html).toContain('data-meowui-part="page-header/heading"');
  expect(html).toContain("data-mark");
  expect(html.indexOf('data-meowui-part="page-header/leading"')).toBeLessThan(
    html.indexOf('data-meowui-part="page-header/title"'),
  );
  expect(html.indexOf('data-meowui-part="page-header/title"')).toBeLessThan(
    html.indexOf('data-meowui-part="page-header/description"'),
  );
});

test("list rows open their editor only when expanded", () => {
  const closed = renderToHtml(
    <ListGroup>
      <ListRow title="Codex" description="model-a">
        <p>Editor</p>
      </ListRow>
    </ListGroup>,
  );
  expect(closed).toContain('role="list"');
  expect(closed).toContain('role="listitem"');
  expect(closed).not.toContain("Editor");
  const open = renderToHtml(
    <ListRow expanded title="Codex">
      <p>Editor</p>
    </ListRow>,
  );
  expect(open).toContain("Editor");
  expect(open).toContain('data-expanded="true"');
});

test("resource cards mark a muted capability and keep identity separate", () => {
  const html = renderToHtml(
    <ResourceCard tone="muted" title="Kimi Provider" identity="cell:kimi@1" status="Disabled" />,
  );
  expect(html.startsWith("<article")).toBe(true);
  expect(html).toContain('data-tone="muted"');
  expect(html).toContain("cell:kimi@1");
});

test("a drawer is a labelled native dialog around its panel", () => {
  const html = renderToHtml(
    <Drawer label="Main navigation" open={false} onOpenChange={() => {}}>
      <nav>Navigation</nav>
    </Drawer>,
  );
  expect(html.startsWith("<dialog")).toBe(true);
  expect(html).toContain('aria-label="Main navigation"');
  expect(html).not.toContain(" open");
  expect(html).toContain("Navigation");
});
