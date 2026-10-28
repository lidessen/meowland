import { h } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Container,
  Entry,
  EntryList,
  Field,
  Inline,
  Input,
  MetaRow,
  Page,
  Prose,
  Section,
  Stack,
  Tag,
} from "meowtail";

const byline = [
  { icon: <Avatar name="Mira Okafor" size="small" />, label: "Mira Okafor" },
  { label: "Oct 26, 2026" },
  { label: "7 min read" },
];

export const BlogArticleStory = defineStory({
  id: "blog-article",
  title: "Blog · Article page",
  group: "Composition examples",
  groupOrder: 45,
  component: "Prose",
  variant: "Long-form reading composition",
  description:
    "One blog post from existing components: the page identity, a byline, long-form Prose and a subscribe card. Switch the gallery Theme to Journal to read the same markup in the blog theme.",
  covers: ["page header", "meta row", "prose", "blockquote", "code", "card", "field"],
  render: () => (
    <Container width="content">
      <Page
        eyebrow="Essays · Interfaces"
        title="Write the meaning once, paint it many ways"
        description="Why a component library should keep what a screen says apart from how it looks."
      >
        <Stack gap="relaxed">
          <MetaRow items={byline} />
          <Prose>
            <p>
              Every interface carries two messages at once. One is what the screen means: this is a
              title, this is a choice, this action is the one that matters. The other is how it
              looks: a face, a weight, a color, a little air around each block.
            </p>
            <p>
              When those two are written in the same place, changing the look means rewriting the
              meaning. A team that wants a reading theme for its blog ends up forking the components
              it already trusts.
            </p>
            <h2>Meaning lives in the tree</h2>
            <p>
              A section knows its depth, so its heading picks its own level. A{" "}
              <a href="#field">field knows its control</a>, so the label finds it without an id
              written by hand. None of that depends on a color or a typeface.
            </p>
            <blockquote>
              The best theme is the one that changes everything you see and nothing you wrote.
            </blockquote>
            <h3>What a theme is allowed to change</h3>
            <ul>
              <li>The surfaces, inks and the single accent.</li>
              <li>The faces for titles and for reading, and the reading size.</li>
              <li>Spacing, radii and the depth of floating layers.</li>
            </ul>
            <p>The component rules stay the same, so a theme is a set of values for named roles:</p>
            <pre>
              <code>{`mountStyles(document, journalTheme.cssText);
applyTheme(document.documentElement, journalTheme);`}</code>
            </pre>
            <hr />
            <p>
              Swap one stylesheet and the same article reads as a journal. Nothing in this page
              knows which one it got.
            </p>
          </Prose>
          <Inline gap="compact">
            <Tag>Design systems</Tag>
            <Tag>Theming</Tag>
            <Tag>Accessibility</Tag>
          </Inline>
          <Card>
            <CardHeader>
              <CardTitle>Get the next essay</CardTitle>
              <CardDescription>
                One letter a month. No tracking, unsubscribe any time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Inline gap="compact" align="end">
                <Field label="Email">
                  <Input type="email" placeholder="you@example.com" />
                </Field>
                <Button>Subscribe</Button>
              </Inline>
            </CardContent>
          </Card>
        </Stack>
      </Page>
    </Container>
  ),
});

const posts = [
  {
    title: "Write the meaning once, paint it many ways",
    description: "Why a component library should keep what a screen says apart from how it looks.",
    date: "Oct 26, 2026",
    readingTime: "7 min read",
  },
  {
    title: "The heading that counts its own depth",
    description: "Document outlines never shipped in browsers; a section can still know its level.",
    date: "Oct 12, 2026",
    readingTime: "5 min read",
  },
  {
    title: "A reading size is not a body size",
    description: "Controls and essays want different type, and one token cannot serve both.",
    date: "Sep 28, 2026",
    readingTime: "4 min read",
  },
  {
    title: "Hairlines, not boxes",
    description: "A run of posts reads as one column when rules separate it instead of cards.",
    date: "Sep 14, 2026",
    readingTime: "6 min read",
  },
];

const author = { icon: <Avatar name="Mira Okafor" size="small" />, label: "Mira Okafor" };

export const BlogIndexStory = defineStory({
  id: "blog-index",
  title: "Blog · Post index",
  group: "Composition examples",
  groupOrder: 46,
  component: "EntryList",
  variant: "Post listing composition",
  description:
    "A blog's front page from existing components: the publication identity, a lead Entry and the archive as an EntryList. Switch the gallery Theme to Journal to compare.",
  covers: ["page header", "entry", "entry list", "meta row"],
  render: () => (
    <Container width="content">
      <Page
        eyebrow="Field notes"
        title="Notes on interfaces"
        description="Essays on components, type and the space between them."
        actions={<Button variant="outline">Subscribe</Button>}
      >
        <Entry
          size="feature"
          eyebrow={posts[0]!.date}
          title={posts[0]!.title}
          href="#latest"
          description={posts[0]!.description}
          meta={<MetaRow items={[author, { label: posts[0]!.readingTime }]} />}
        />
        <Section title="Archive">
          <EntryList>
            {posts.slice(1).map((post) => (
              <Entry
                eyebrow={post.date}
                title={post.title}
                href="#post"
                description={post.description}
                meta={<MetaRow items={[author, { label: post.readingTime }]} />}
              />
            ))}
          </EntryList>
        </Section>
      </Page>
    </Container>
  ),
});
