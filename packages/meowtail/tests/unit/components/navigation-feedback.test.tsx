import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { Breadcrumb, Alert, Skeleton, Spinner } from "../../../src/components";

test("feedback and breadcrumb keep their semantic contracts without theme", () => {
  const web = createWebRenderer(createRuntime());
  expect(
    web.renderToHtml(
      <Breadcrumb
        items={[
          { label: "Project", href: "/projects" },
          { label: "Current", href: "/current" },
        ]}
      />,
    ),
  ).toContain('<span aria-current="page">Current</span>');
  expect(web.renderToHtml(<Alert tone="danger">Handle later</Alert>)).toContain('role="status"');
  expect(web.renderToHtml(<Alert role="alert">Needs immediate attention</Alert>)).toContain(
    'role="alert"',
  );
  expect(web.renderToHtml(<Skeleton />)).toContain('aria-hidden="true"');
  const spinner = web.renderToHtml(<Spinner label="Reading" />);
  expect(spinner).toContain('role="status"');
  expect(spinner).toContain("Reading");
  expect(spinner).not.toContain("progressbar");
});
