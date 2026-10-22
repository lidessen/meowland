import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { installMeowUI } from "../../../src/registry";
import { Button, Card, Page, Section } from "../../../src/components";
import { standardTheme, uiTokens } from "../../../src/theme";

function web() {
  const runtime = createRuntime();
  installMeowUI(runtime);
  return createWebRenderer(runtime);
}

test("Section renders title, description, actions, content and footer as named parts", () => {
  const html = web().renderToHtml(
    <Section
      title="Notifications"
      description="Choose how the project reaches you."
      actions={
        <Button size="small" variant="quiet">
          Reset
        </Button>
      }
      footer="Saved automatically when you leave the field."
    >
      <p>Email digests are sent once a day.</p>
    </Section>,
  );
  expect(html).toContain('<section data-variant="plain" data-meowui-part="section/root">');
  for (const part of ["root", "header", "title", "description", "actions", "content", "footer"])
    expect(html).toContain(`data-meowui-part="section/${part}"`);
  expect(html).toContain('<h2 data-meowui-part="section/title">Notifications</h2>');
  expect(html).toContain(
    '<p data-meowui-part="section/description">Choose how the project reaches you.</p>',
  );
  expect(html).toContain('<footer data-meowui-part="section/footer">');
  expect(html.indexOf('data-meowui-part="section/header"')).toBeLessThan(
    html.indexOf('data-meowui-part="section/content"'),
  );
});

test("Section derives its heading level from the surrounding region", () => {
  const standalone = web().renderToHtml(<Section title="Standalone">Body</Section>);
  expect(standalone).toContain('<h2 data-meowui-part="section/title">Standalone</h2>');

  const nested = web().renderToHtml(
    <Page title="Page title">
      <Section title="Direct section">
        <Section title="Nested section">
          <Section title="Third level">Body</Section>
        </Section>
      </Section>
    </Page>,
  );
  expect(nested).toContain('<h2 data-meowui-part="section/title">Direct section</h2>');
  expect(nested).toContain('<h3 data-meowui-part="section/title">Nested section</h3>');
  expect(nested).toContain('<h4 data-meowui-part="section/title">Third level</h4>');
});

test("Section heading depth stops at h6 instead of producing invalid heading tags", () => {
  const html = web().renderToHtml(
    <Page title="Page title">
      <Section title="Two">
        <Section title="Three">
          <Section title="Four">
            <Section title="Five">
              <Section title="Six">
                <Section title="Seven">Body</Section>
              </Section>
            </Section>
          </Section>
        </Section>
      </Section>
    </Page>,
  );
  expect(html).not.toMatch(/<h7/);
  expect(html).toContain('<h6 data-meowui-part="section/title">Six</h6>');
  expect(html).toContain('<h6 data-meowui-part="section/title">Seven</h6>');
});

test("A title-less grouping wrapper passes the heading level through", () => {
  const grouped = web().renderToHtml(
    <Page title="Page title">
      <Section>
        <Section title="Grouped child">Body</Section>
      </Section>
      <Section description="A grouping wrapper whose description is not a heading.">
        <Section title="Described grouped child">Body</Section>
      </Section>
    </Page>,
  );
  // Page h1 is followed by the grouped h2, not a skipped h3.
  expect(grouped).toContain('<h2 data-meowui-part="section/title">Grouped child</h2>');
  expect(grouped).toContain('<h2 data-meowui-part="section/title">Described grouped child</h2>');
  expect(grouped.match(/data-meowui-part="section\/title"/g)).toHaveLength(2);
  expect(grouped).not.toMatch(/<h3[\s>]/);

  const doubleGrouped = web().renderToHtml(
    <Page title="Page title">
      <Section>
        <Section>
          <Section title="Deep grouped child">Body</Section>
        </Section>
      </Section>
    </Page>,
  );
  expect(doubleGrouped).toContain('<h2 data-meowui-part="section/title">Deep grouped child</h2>');
  expect(doubleGrouped).not.toMatch(/<h3[\s>]/);

  const standalone = web().renderToHtml(
    <Section>
      <Section title="Standalone grouped child">Body</Section>
    </Section>,
  );
  expect(standalone).toContain(
    '<h2 data-meowui-part="section/title">Standalone grouped child</h2>',
  );
});

test("Section without identity slots is a grouping wrapper with content only", () => {
  const html = web().renderToHtml(
    <Section>
      <p>Only the content.</p>
    </Section>,
  );
  expect(html).toContain('data-meowui-part="section/root"');
  expect(html).toContain('data-meowui-part="section/content"');
  expect(html).toContain("<p>Only the content.</p>");
  expect(html).not.toContain('data-meowui-part="section/header"');
  expect(html).not.toContain('data-meowui-part="section/title"');
  expect(html).not.toMatch(/<h[1-6][\s>]/);
});

test("the card variant wraps the plain section in the existing Card surface", () => {
  const html = web().renderToHtml(
    <Section title="Notification channels" variant="card" footer="Only one channel can be default.">
      <p>Choose where the project reaches you.</p>
    </Section>,
  );
  expect(html.match(/data-meowui-part="card\/root"/g)).toHaveLength(1);
  expect(html).toContain('data-option-card-variant="surface"');
  expect(html).toContain('data-variant="card"');
  // The Card is the outer surface; the section keeps its own parts inside it.
  expect(html.indexOf('data-meowui-part="card/root"')).toBeLessThan(
    html.indexOf('data-meowui-part="section/root"'),
  );
  expect(html).toContain('data-meowui-part="section/content"');
  expect(html).toContain('data-meowui-part="section/footer"');
});

test("Section can keep its plain variant inside an existing Card without a second surface", () => {
  const html = web().renderToHtml(
    <Card>
      <Section title="Nested region" description="A section inside an existing card surface.">
        <p>Content.</p>
      </Section>
    </Card>,
  );
  expect(html.match(/data-meowui-part="card\/root"/g)).toHaveLength(1);
  expect(html).toContain('<section data-variant="plain" data-meowui-part="section/root">');
  expect(html).toContain('<h2 data-meowui-part="section/title">Nested region</h2>');
});

test("the standard theme paints every section part with the shared spacing step", () => {
  for (const part of ["root", "header", "title", "description", "actions", "content", "footer"])
    expect(standardTheme.cssText).toContain(`data-meowui-part="section/${part}"`);
  expect(standardTheme.cssText).toContain(uiTokens.space.group.name);
});
