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
          { label: "项目", href: "/projects" },
          { label: "当前", href: "/current" },
        ]}
      />,
    ),
  ).toContain('<span aria-current="page">当前</span>');
  expect(web.renderToHtml(<Alert tone="danger">稍后处理</Alert>)).toContain('role="status"');
  expect(web.renderToHtml(<Alert role="alert">需要立即关注</Alert>)).toContain('role="alert"');
  expect(web.renderToHtml(<Skeleton />)).toContain('aria-hidden="true"');
  const spinner = web.renderToHtml(<Spinner label="正在读取" />);
  expect(spinner).toContain('role="status"');
  expect(spinner).toContain("正在读取");
  expect(spinner).not.toContain("progressbar");
});
