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
  meowUIComponents,
} from "meowtail";

test("composed cards retain heading hierarchy, host semantics and actions without a runtime visual plugin", () => {
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
  const web = createWebRenderer(runtime);
  const view = (
    <Card as="article" aria-labelledby="project-title" className="host">
      <CardHeader>
        <CardTitle id="project-title">Project record</CardTitle>
        <CardDescription>Changes to confirm</CardDescription>
        <CardAction>
          <Button aria-label="More records">More</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Card as="section" variant="embedded" aria-labelledby="task-title">
          <CardHeader>
            <CardTitle as="h3" id="task-title">
              Embedded task
            </CardTitle>
          </CardHeader>
          <CardContent>Task details</CardContent>
        </Card>
      </CardContent>
      <CardFooter>
        <Button type="submit">Save</Button>
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
  installMeowUI({ components: meowUIComponents }, runtime);
  const web = createWebRenderer(runtime);
  const plain = web.renderToHtml(
    <Card>
      <p>Existing content</p>
    </Card>,
  );
  expect(plain).toContain('data-option-card-variant="auto"');
  expect(plain).toContain("<p>Existing content</p>");
  expect(plain).not.toContain('data-meowui-part="card-content/root"');
});

test("Card depth follows ancestor context across wrappers and leaves siblings and explicit surfaces independent", () => {
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
  const web = createWebRenderer(runtime);
  const Wrapped = () => (
    <div>
      <Card>
        <CardContent>
          <Card variant="surface">Standalone surface</Card>
        </CardContent>
      </Card>
    </div>
  );
  const html = web.renderToHtml([
    <Card>
      <CardContent>
        <Wrapped />
        <Card>Sibling embedded</Card>
      </CardContent>
    </Card>,
    <Card>Another top-level card</Card>,
    <Card variant="embedded">Explicitly embedded</Card>,
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
  expect(web.renderToHtml(<Card>Standalone render</Card>)).toContain('data-card-depth="0"');
});
