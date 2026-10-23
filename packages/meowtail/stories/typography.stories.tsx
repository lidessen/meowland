import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Button, Card, Inline, Prose, Section, Stack, Status, Text } from "meowtail";
import { uiTokens } from "meowtail/theme";
import { Measure, Specimen, Specimens } from "./specimen";

export const TextRolesStory = defineStory({
  id: "text-roles",
  title: "Text · Roles between components",
  component: "Text",
  group: "Navigation and layout",
  groupOrder: 40,
  variant: "Body, secondary, label, caption and eyebrow",
  description:
    "Five roles cover the copy a host places between components. Headings stay with Section and PageHeader, field labels with Field, and code with the code components.",
  covers: ["Text", "body", "secondary", "label", "caption", "eyebrow", "as"],
  render: () => (
    <Specimens>
      <Specimen label="Roles" width="content">
        <Stack gap="compact">
          <Text variant="eyebrow">Eyebrow · labels a group</Text>
          <Text>Body · the default reading copy for a sentence or two.</Text>
          <Text variant="secondary">
            Secondary · supporting copy that explains the line above it.
          </Text>
          <Text variant="label">Label · a name in a compact surface.</Text>
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
                <Status state="success" label="On" />
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

const t = uiTokens.type;

/** Each style of the ramp, drawn in itself, with its size, line box and weight. */
const ramp = [
  {
    name: "hero",
    size: t.hero,
    line: t.line.hero,
    weight: t.weight.semibold,
    spec: "40 / 48 / 600",
    sample: "Build with Meowland",
    tight: true,
  },
  {
    name: "pageTitle",
    size: t.pageTitle,
    line: t.line.pageTitle,
    weight: t.weight.semibold,
    spec: "24 / 32 / 600",
    sample: "Project settings",
    tight: true,
  },
  {
    name: "heading",
    size: t.heading,
    line: t.line.heading,
    weight: t.weight.semibold,
    spec: "20 / 28 / 600",
    sample: "What changed",
    tight: true,
  },
  {
    name: "title",
    size: t.title,
    line: t.line.title,
    weight: t.weight.semibold,
    spec: "16 / 24 / 600",
    sample: "Weekly digest",
    tight: true,
  },
  {
    name: "reading",
    size: t.body,
    line: t.line.reading,
    weight: t.weight.regular,
    spec: "14 / 24 / 400",
    sample: "Long-form copy breathes on a taller line.",
  },
  {
    name: "body",
    size: t.body,
    line: t.line.body,
    weight: t.weight.regular,
    spec: "14 / 22 / 400",
    sample: "Interface copy and controls.",
  },
  {
    name: "label",
    size: t.label,
    line: t.line.label,
    weight: t.weight.medium,
    spec: "13 / 20 / 500",
    sample: "Display name",
  },
  {
    name: "caption",
    size: t.caption,
    line: t.line.caption,
    weight: t.weight.regular,
    spec: "12 / 18 / 400",
    sample: "Last sent on Monday at 09:00.",
  },
  {
    name: "code",
    size: t.code,
    line: t.line.code,
    weight: t.weight.regular,
    spec: "12 / 18, mono",
    sample: "bun add meowtail",
    mono: true,
  },
  {
    name: "eyebrow",
    size: t.micro,
    line: t.line.micro,
    weight: t.weight.medium,
    spec: "11 / 16 / 500, caps",
    sample: "Group label",
    caps: true,
  },
] as const;

export const TypeRampStory = defineStory({
  id: "type-ramp",
  title: "Text · The type ramp",
  component: "Text",
  group: "Navigation and layout",
  groupOrder: 40,
  variant: "Every style, size, line and weight",
  description:
    "Every piece of text is one of these styles. Each binds a size to its line box, weight and tracking; titles close up slightly, and all of it is set in the UI face.",
  covers: ["type ramp", "text()", "uiTokens.type.line", "uiTokens.type.weight"],
  render: () => (
    <Specimens>
      <Specimen label="Styles" width="content">
        <Stack gap="normal">
          {ramp.map((style) => (
            <Stack gap="compact">
              <span
                style={{
                  color: "var(--ui-ink-primary)",
                  font: `${style.weight} ${style.size} / ${style.line} ${"mono" in style ? t.mono : t.sans}`,
                  letterSpacing:
                    "tight" in style
                      ? `${t.trackingTight}`
                      : "caps" in style
                        ? `${t.trackingCaps}`
                        : undefined,
                  textTransform: "caps" in style ? "uppercase" : undefined,
                }}
              >
                {style.sample}
              </span>
              <Text variant="caption">
                <code>{style.name}</code> · {style.spec}
              </Text>
            </Stack>
          ))}
        </Stack>
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
