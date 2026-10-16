import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  installMeowUI,
} from "meowui";

test("composed cards retain heading hierarchy, host semantics and actions without a runtime visual plugin", () => {
  const runtime = createRuntime();
  installMeowUI(runtime);
  const web = createWebRenderer(runtime);
  const view = (
    <Card as="article" aria-labelledby="project-title" className="host">
      <CardHeader>
        <CardTitle id="project-title">项目记录</CardTitle>
        <CardDescription>待确认的修改</CardDescription>
        <CardAction>
          <Button aria-label="更多记录">更多</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Card as="section" variant="embedded" aria-labelledby="task-title">
          <CardHeader>
            <CardTitle as="h3" id="task-title">
              内嵌任务
            </CardTitle>
          </CardHeader>
          <CardContent>任务详情</CardContent>
        </Card>
      </CardContent>
      <CardFooter>
        <Button type="submit">保存</Button>
      </CardFooter>
    </Card>
  );
  const html = web.renderToHtml(view);
  expect(html).toContain('<article aria-labelledby="project-title"');
  expect(html).toContain('<h2 id="project-title"');
  expect(html).toContain('<h3 id="task-title"');
  expect(html).toContain('data-option-card-variant="embedded"');
  expect(html).toContain('type="submit"');
  for (const part of ["header", "title", "description", "action", "content", "footer"])
    expect(html).toContain(`data-meowui-part="card-${part}/root"`);
  expect(html).toContain('class="host"');
});

test("Card children keep their structure without requiring composition slots", () => {
  const runtime = createRuntime();
  installMeowUI(runtime);
  const web = createWebRenderer(runtime);
  const plain = web.renderToHtml(
    <Card>
      <p>原有内容</p>
    </Card>,
  );
  expect(plain).toContain('data-option-card-variant="auto"');
  expect(plain).toContain("<p>原有内容</p>");
  expect(plain).not.toContain('data-meowui-part="card-content/root"');
});

test("Card depth follows ancestor context across wrappers and leaves siblings and explicit surfaces independent", () => {
  const runtime = createRuntime();
  installMeowUI(runtime);
  const web = createWebRenderer(runtime);
  const Wrapped = () => (
    <div>
      <Card>
        <CardContent>
          <Card variant="surface">独立表面</Card>
        </CardContent>
      </Card>
    </div>
  );
  const html = web.renderToHtml([
    <Card>
      <CardContent>
        <Wrapped />
        <Card>同级内嵌</Card>
      </CardContent>
    </Card>,
    <Card>另一张顶层卡</Card>,
    <Card variant="embedded">显式内嵌</Card>,
  ]);
  expect([...html.matchAll(/data-card-depth="(\d+)"/g)].map((match) => match[1])).toEqual([
    "0",
    "1",
    "2",
    "1",
    "0",
    "0",
  ]);
  expect(html.match(/data-option-card-variant="auto"/g)).toHaveLength(4);
  expect(html).toContain('data-option-card-variant="embedded"');
  expect(html).toMatch(/data-card-depth="2"[^>]*data-option-card-variant="surface"/);
  expect(web.renderToHtml(<Card>独立渲染</Card>)).toContain('data-card-depth="0"');
});
