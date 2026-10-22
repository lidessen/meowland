import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Badge, Button, Card, Inline, Prose, Section, Stack, Text } from "meowtail";
import { Measure, Specimen, Specimens } from "./specimen";

export const TextRolesStory = defineStory({
  id: "text-roles",
  title: "Text · Roles between components",
  component: "Text",
  group: "Navigation and layout",
  groupOrder: 40,
  variant: "Body, secondary, caption and eyebrow",
  description:
    "Four roles cover the copy a host places between components. Headings stay with Section and PageHeader, field labels with Field, and code with the code components.",
  covers: ["Text", "body", "secondary", "caption", "eyebrow", "as"],
  render: () => (
    <Specimens>
      <Specimen label="Roles" width="content">
        <Stack gap="compact">
          <Text variant="eyebrow">Eyebrow · labels a group</Text>
          <Text>Body · the default reading copy for a sentence or two.</Text>
          <Text variant="secondary">
            Secondary · supporting copy that explains the line above it.
          </Text>
          <Text variant="caption">Caption · receipts, counts and fine print.</Text>
        </Stack>
      </Specimen>
      <Specimen
        label="One header unit"
        note="Eyebrow, title, description, then content: one start edge, tight inside, a section step apart."
        width="content"
      >
        <Card>
          <Stack gap="normal">
            <Stack gap="compact">
              <Text variant="eyebrow">Workspace · Delivery</Text>
              <Inline gap="compact" align="center">
                <Text as="span">
                  <strong>Weekly digest</strong>
                </Text>
                <Badge size="small" tone="success">
                  On
                </Badge>
              </Inline>
              <Text variant="secondary">
                A summary of progress, decisions and upcoming milestones, sent every Monday.
              </Text>
            </Stack>
            <Inline gap="compact">
              <Button size="small">Edit schedule</Button>
              <Button size="small" variant="quiet">
                Preview
              </Button>
            </Inline>
            <Text variant="caption">Last sent on Monday at 09:00.</Text>
          </Stack>
        </Card>
      </Specimen>
    </Specimens>
  ),
});

export const ProseStory = defineStory({
  id: "prose",
  title: "Prose · Long-form reading",
  component: "Prose",
  group: "Navigation and layout",
  groupOrder: 40,
  variant: "Reading measure and rhythm",
  description:
    'Native headings, paragraphs, lists, quotes, code, rules and tables take the reading rhythm chat messages use. The reading measure caps the line length; `measure="fill"` takes the parent\'s width.',
  covers: ["Prose", "measure", "h2-h4", "lists", "blockquote", "pre", "table", "hr"],
  render: () => (
    <Measure width="wide">
      <Section
        title="Release notes"
        description="Prose carries the reading content; Section owns the title and description."
      >
        <Prose as="article">
          <p>
            This release groups the theme tokens by role. A component picks one material, one text
            role and one spacing step for each relationship, so screens built from them read as one
            system. See the <a href="#prose-upgrade">upgrade notes</a> before you adopt it.
          </p>
          <h2>What changed</h2>
          <ul>
            <li>
              Text roles: <code>body</code>, <code>secondary</code>, <code>caption</code> and{" "}
              <code>eyebrow</code>.
            </li>
            <li>
              Reading content takes the shared prose rhythm.
              <ul>
                <li>Chat messages and rendered markdown use the same rules.</li>
              </ul>
            </li>
            <li>Lines stop at the reading measure.</li>
          </ul>
          <blockquote>Arrange with Stack and Grid; read with Prose.</blockquote>
          <h3 id="prose-upgrade">Upgrade notes</h3>
          <p>Replace hand-styled paragraphs with Text, and long-form content with Prose.</p>
          <pre tabIndex={0} aria-label="Example">
            {"<Prose>\n  <h2>Overview</h2>\n  <p>Reading content…</p>\n</Prose>"}
          </pre>
          <hr />
          <table>
            <thead>
              <tr>
                <th>Role</th>
                <th>Use</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Text</td>
                <td>A line or two between components</td>
              </tr>
              <tr>
                <td>Prose</td>
                <td>Articles, notes and rendered markdown</td>
              </tr>
            </tbody>
          </table>
        </Prose>
      </Section>
    </Measure>
  ),
});
