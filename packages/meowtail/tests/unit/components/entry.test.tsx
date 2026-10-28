import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { Entry, EntryList, Page, Section } from "../../../src/components";
import { installMeowUI, meowUIComponents } from "../../../src/registry";

function html(node: Parameters<ReturnType<typeof createWebRenderer>["renderToHtml"]>[0]) {
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
  return createWebRenderer(runtime).renderToHtml(node);
}

test("an entry is a list item in an EntryList and an article on its own", () => {
  const listed = html(
    <EntryList>
      <Entry title="First" />
      <Entry title="Second" />
    </EntryList>,
  );
  expect(listed).toMatch(/^<ul[^>]*data-meowui-part="entry-list\/root"/);
  expect(listed.match(/<li[^>]*data-meowui-part="entry\/root"/g)).toHaveLength(2);
  expect(listed).not.toContain("<article");

  const alone = html(<Entry title="Lead" />);
  expect(alone).toMatch(/^<article[^>]*data-meowui-part="entry\/root"/);
});

test("an entry heading follows the surrounding region and links only when given href", () => {
  const page = html(
    <Page title="Notes">
      <Entry title="Lead" href="/lead" eyebrow="Oct 26" description="Why it matters." />
      <Section title="Archive">
        <EntryList>
          <Entry title="Older" />
        </EntryList>
      </Section>
    </Page>,
  );
  expect(page).toMatch(
    /<h2[^>]*entry\/title[^>]*><a href="\/lead"[^>]*entry\/link[^>]*>Lead<\/a><\/h2>/,
  );
  expect(page).toMatch(/<h3[^>]*entry\/title[^>]*>Older<\/h3>/);
  expect(page).toContain("Oct 26");
  expect(page).toContain("Why it matters.");
  expect(page).not.toMatch(/entry\/link[^>]*>Older/);
  // Empty slots render nothing.
  expect(html(<Entry title="Bare" />)).not.toContain("entry/description");
});
