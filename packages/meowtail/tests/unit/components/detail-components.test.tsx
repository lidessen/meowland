import { expect, test } from "bun:test";
import { h } from "meowjsx";
import { renderToHtml } from "meowjsx/web";
import { DetailSection } from "../../../src/components/detail-section";
import { Drawer } from "../../../src/components/drawer";
import { ListGroup, ListRow } from "../../../src/components/list-group";
import { PageHeader } from "../../../src/components/page-header";
import { ResourceCard } from "../../../src/components/resource-card";
import { ResourceLink } from "../../../src/components/resource-link";
import { Timeline, TimelineItem } from "../../../src/components/timeline";
import { installMeowUI } from "../../../src/registry";

installMeowUI();

test("detail sections keep a heading, an optional aside and their body", () => {
  const html = renderToHtml(
    <DetailSection title="委托执行" aside="2 次">
      <p>内容</p>
    </DetailSection>,
  );
  expect(html).toContain("<h3");
  expect(html).toContain("委托执行");
  expect(html).toContain("2 次");
  expect(html).toContain("<p>内容</p>");
  expect(renderToHtml(<DetailSection title="目标" />)).not.toContain("detail-section/aside");
});

test("timeline items are list entries whose marker carries one state", () => {
  const html = renderToHtml(
    <Timeline>
      <TimelineItem
        state="processing"
        title="校对记录格式"
        stateLabel="处理中"
        description="开始于 09:46"
        actions={<button type="button">查看成果</button>}
      />
      <TimelineItem state="returned" title="起草记录正文" stateLabel="已返回" />
    </Timeline>,
  );
  expect(html.startsWith("<ol")).toBe(true);
  expect(html.match(/<li/g)?.length).toBe(2);
  expect(html).toContain('data-option-status-dot-state="processing"');
  expect(html).toContain('data-option-status-dot-state="returned"');
  expect(html).toContain("查看成果");
});

test("a resource link is an anchor for a destination and a button for an action", () => {
  expect(renderToHtml(<ResourceLink href="/records/a" title="记录" />).startsWith("<a")).toBe(true);
  const action = renderToHtml(<ResourceLink title="材料" detail="选定材料" />);
  expect(action.startsWith("<button")).toBe(true);
  expect(action).toContain('type="button"');
  expect(action).toContain("选定材料");
});

test("page headers name the page and carry page-level actions", () => {
  const html = renderToHtml(
    <PageHeader title="扩展" titleId="t" description="说明" actions={<button>刷新</button>} />,
  );
  expect(html).toContain('<h1 id="t"');
  expect(html).toContain("说明");
  expect(html).toContain("刷新");
});

test("list rows open their editor only when expanded", () => {
  const closed = renderToHtml(
    <ListGroup>
      <ListRow title="Codex" description="model-a">
        <p>编辑器</p>
      </ListRow>
    </ListGroup>,
  );
  expect(closed).toContain('role="list"');
  expect(closed).toContain('role="listitem"');
  expect(closed).not.toContain("编辑器");
  const open = renderToHtml(
    <ListRow expanded title="Codex">
      <p>编辑器</p>
    </ListRow>,
  );
  expect(open).toContain("编辑器");
  expect(open).toContain('data-expanded="true"');
});

test("resource cards mark a muted capability and keep identity separate", () => {
  const html = renderToHtml(
    <ResourceCard tone="muted" title="Kimi Provider" identity="cell:kimi@1" status="已停用" />,
  );
  expect(html.startsWith("<article")).toBe(true);
  expect(html).toContain('data-tone="muted"');
  expect(html).toContain("cell:kimi@1");
});

test("a drawer is a labelled native dialog around its panel", () => {
  const html = renderToHtml(
    <Drawer label="主导航" open={false} onOpenChange={() => {}}>
      <nav>导航</nav>
    </Drawer>,
  );
  expect(html.startsWith("<dialog")).toBe(true);
  expect(html).toContain('aria-label="主导航"');
  expect(html).not.toContain(" open");
  expect(html).toContain("导航");
});
