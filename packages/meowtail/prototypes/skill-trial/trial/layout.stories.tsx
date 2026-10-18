import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Badge, Button, Container, Grid, Inline, LayoutItem, Stack } from "meowtail";

export const LayoutCompositionStory = defineStory({
  id: "layout-composition",
  title: "Layout composition · Text baseline and fixed actions",
  group: "Navigation and layout",
  groupOrder: 40,
  component: "LayoutItem",
  variant: "Long content and actions",
  description:
    "Related text sits close along the baseline; the body can shrink while actions keep their natural width; wrap line spacing is independent of group spacing.",
  covers: ["LayoutItem grow/shrink", "Inline baseline", "rowGap", "columnGap", "long content"],
  render: () => (
    <Container width="content">
      <Stack gap="relaxed">
        <Inline as="header" gap="compact" align="baseline" data-layout-summary>
          <small>Default connection</small>
          <Inline gap="compact" align="baseline">
            <strong>Codex</strong>
            <small>gpt-6-luna</small>
          </Inline>
        </Inline>
        <Inline wrap={false} align="center" data-layout-fixed>
          <LayoutItem grow>
            <Stack gap="compact">
              <strong>Default model connection shared by the team</strong>
              <span style={{ overflowWrap: "anywhere" }}>
                organization/research-model-with-a-very-long-unbroken-identifier-2026
              </span>
            </Stack>
          </LayoutItem>
          <LayoutItem shrink={false}>
            <Button variant="outline">Edit connection</Button>
          </LayoutItem>
        </Inline>
        <Inline as="footer" gap="compact" rowGap="normal" data-layout-actions>
          <Button>Save current configuration</Button>
          <Button variant="outline">Restore default configuration</Button>
          <Button variant="quiet">Check connection availability</Button>
        </Inline>
        <Grid columns={2} gap="relaxed" rowGap="compact" data-layout-grid-gaps>
          <Stack gap="compact">
            <span>Connection name</span>
            <strong>Codex</strong>
          </Stack>
          <Stack gap="compact">
            <span>Current model</span>
            <span>gpt-6-luna</span>
          </Stack>
        </Grid>
      </Stack>
    </Container>
  ),
});

export const StackStory = defineStory({
  id: "layout-stack",
  title: "Vertical layout · Reading and actions",
  group: "Navigation and layout",
  groupOrder: 40,
  component: "Stack",
  variant: "Reading and actions",
  description:
    "The title, description, and actions of one piece of work stay close; the next block of work uses a wider rhythm.",
  covers: ["Stack", "semantic gap", "Inline wrap"],
  render: () => (
    <Container width="content">
      <Stack gap="relaxed">
        <Stack gap="compact">
          <strong>Check the update order of search results</strong>
          <span>
            Keep the current input and check whether older requests overwrite newer results. Long
            descriptions wrap naturally and the order stays continuous.
          </span>
        </Stack>
        <Inline gap="compact">
          <Badge tone="success">Check completed</Badge>
          <span>2 changes awaiting review</span>
        </Inline>
        <Inline>
          <Button>Review changes</Button>
          <Button variant="quiet">Handle later</Button>
        </Inline>
      </Stack>
    </Container>
  ),
});

export const InlineStory = defineStory({
  id: "layout-inline",
  title: "Horizontal layout · Wrapping and alignment",
  group: "Navigation and layout",
  groupOrder: 40,
  component: "Inline",
  variant: "Wrapping and alignment",
  description:
    "Status and actions share one line; when space runs out they wrap as whole units without compressing button text.",
  covers: ["Inline", "wrap", "align", "justify"],
  render: () => (
    <Container width="content">
      <Stack gap="relaxed">
        <Inline gap="compact" align="baseline">
          <strong>Work awaiting review</strong>
          <small>3 items · last updated at 10:24</small>
        </Inline>
        <Inline align="start">
          <Badge tone="warning">Needs confirmation</Badge>
          <Stack gap="compact">
            <strong>Check the change scope</strong>
            <span>Confirm that no files outside the current task are included.</span>
          </Stack>
        </Inline>
        <Inline gap="compact" rowGap="normal">
          <Button>Review all changes</Button>
          <Button variant="outline">View the full verification record</Button>
          <Button variant="quiet">Keep the current results for now</Button>
        </Inline>
      </Stack>
    </Container>
  ),
});

export const GridStory = defineStory({
  id: "layout-grid",
  title: "Grid layout · Parallel work",
  group: "Navigation and layout",
  groupOrder: 40,
  component: "Grid",
  variant: "Adaptive columns",
  description:
    "Parallel items arrange by available width; narrow containers fall back to a single column without hiding long titles.",
  covers: ["Grid", "auto columns", "Container", "long content"],
  render: () => (
    <Container width="wide">
      <Grid gap="relaxed">
        <Stack gap="compact" align="start">
          <Badge tone="success">Completed</Badge>
          <strong>Search result order and stale request handling</strong>
          <span>Keep newer results and ignore older ones that arrive late.</span>
          <Button variant="outline">View changes</Button>
        </Stack>
        <Stack gap="compact" align="start">
          <Badge tone="warning">Needs confirmation</Badge>
          <strong>Code reading and source checks in narrow-screen conversations</strong>
          <span>Code scrolls locally while the body stays readable.</span>
          <Button variant="outline">View record</Button>
        </Stack>
      </Grid>
    </Container>
  ),
});

export const ContainerStory = defineStory({
  id: "layout-container",
  title: "Content width · Keeping reading focused",
  group: "Navigation and layout",
  groupOrder: 40,
  component: "Container",
  variant: "Reading width",
  description:
    "Content width comes from the theme; the same structure can fit compact tools and reading scenarios.",
  covers: ["Container narrow/content/wide/full"],
  render: () => (
    <Stack gap="relaxed">
      {(["narrow", "content", "wide", "full"] as const).map((width) => (
        <Container width={width}>
          <Stack gap="compact">
            <strong>
              {
                {
                  narrow: "Short form",
                  content: "Primary reading",
                  wide: "Wide workspace",
                  full: "Fills the available space",
                }[width]
              }
            </strong>
            <span>
              Content wraps naturally within the current container and keeps a clear reading start;
              width does not change the order of information.
            </span>
          </Stack>
        </Container>
      ))}
    </Stack>
  ),
});
