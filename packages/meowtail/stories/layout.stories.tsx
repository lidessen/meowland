import { h } from "meowjsx";
import { mapSignal, signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import {
  Badge,
  Button,
  Container,
  Field,
  Grid,
  Inline,
  Input,
  LayoutItem,
  PageHeader,
  Stack,
  Status,
} from "meowtail";
import { Measure } from "./specimen";

export const LayoutCompositionStory = defineStory({
  id: "layout-composition",
  title: "Layout Item · Text baseline and fixed actions",
  group: "Pages and layout",
  groupOrder: 10,
  component: "LayoutItem",
  variant: "Long content and actions",
  description:
    "Related text sits close along the baseline; the body can shrink while actions keep their natural width; wrap line spacing is independent of group spacing.",
  covers: ["LayoutItem grow/shrink", "Inline baseline", "rowGap", "columnGap", "long content"],
  render: () => (
    <Measure width="content">
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
          <span>Connection name</span>
          <span>Current model</span>
          <strong>Codex</strong>
          <span>gpt-6-luna</span>
        </Grid>
      </Stack>
    </Measure>
  ),
});

export const StackStory = defineStory({
  id: "layout-stack",
  title: "Stack · Reading and actions",
  group: "Pages and layout",
  groupOrder: 10,
  component: "Stack",
  variant: "Reading and actions",
  description:
    "The title, description, and actions of one piece of work stay close; the next block of work uses a wider rhythm.",
  covers: ["Stack", "semantic gap", "Inline wrap"],
  render: () => (
    <Measure width="content">
      <Stack gap="relaxed">
        <Stack gap="compact">
          <strong>Check the update order of search results</strong>
          <span>
            Keep the current input and check whether older requests overwrite newer results. Long
            descriptions wrap naturally and the order stays continuous.
          </span>
        </Stack>
        <Inline gap="compact">
          <Status state="success" label="Checked" />
          <span>2 changes awaiting review</span>
        </Inline>
        <Inline>
          <Button>Review changes</Button>
          <Button variant="quiet">Handle later</Button>
        </Inline>
      </Stack>
    </Measure>
  ),
});

export const InlineStory = defineStory({
  id: "layout-inline",
  title: "Inline · Wrapping and alignment",
  group: "Pages and layout",
  groupOrder: 10,
  component: "Inline",
  variant: "Wrapping and alignment",
  description:
    "Status and actions share one line; when space runs out they wrap as whole units without compressing button text.",
  covers: ["Inline", "wrap", "align", "justify"],
  render: () => (
    <Measure width="content">
      <Stack gap="relaxed">
        <Inline justify="between" align="baseline">
          <strong>Work awaiting review</strong>
          <small>3 items · last updated at 10:24</small>
        </Inline>
        <Inline gap="compact">
          <Button>Review all changes</Button>
          <Button variant="outline">View the full verification record</Button>
          <Button variant="quiet">Keep the current results for now</Button>
        </Inline>
        <Inline align="start">
          <Status state="warning" label="Needs review" />
          <Stack gap="compact">
            <strong>Check the change scope</strong>
            <span>Confirm that no files outside the current task are included.</span>
          </Stack>
        </Inline>
      </Stack>
    </Measure>
  ),
});

export const GridStory = defineStory({
  id: "layout-grid",
  title: "Grid · Parallel work",
  group: "Pages and layout",
  groupOrder: 10,
  component: "Grid",
  variant: "Adaptive columns",
  description:
    "Parallel items arrange by available width; narrow containers fall back to a single column without hiding long titles.",
  covers: ["Grid", "auto columns", "Container", "long content"],
  render: () => (
    <Measure width="wide">
      <Grid gap="relaxed">
        <Stack gap="compact" align="start">
          <Status state="success" label="Completed" />
          <strong>Search result order and stale request handling</strong>
          <span>Keep newer results and ignore older ones that arrive late.</span>
          <Button variant="outline">View changes</Button>
        </Stack>
        <Stack gap="compact" align="start">
          <Status state="warning" label="Needs review" />
          <strong>Code reading and source checks in narrow-screen conversations</strong>
          <span>Code scrolls locally while the body stays readable.</span>
          <Button variant="outline">View record</Button>
        </Stack>
      </Grid>
    </Measure>
  ),
});

export const ContainerStory = defineStory({
  id: "layout-container",
  title: "Container · Keeping reading focused",
  group: "Pages and layout",
  groupOrder: 10,
  component: "Container",
  variant: "Reading width",
  description:
    "Content width comes from the theme; the same structure can fit compact tools and reading scenarios.",
  covers: ["Container narrow/content/wide/page/full"],
  render: () => (
    <Stack gap="relaxed">
      {(["narrow", "content", "wide", "page", "full"] as const).map((width) => (
        <Container width={width}>
          <Stack gap="compact">
            <strong>
              {
                {
                  narrow: "Short form",
                  content: "Primary reading",
                  wide: "Wide workspace",
                  page: "Page body (margins on both sides, 16px on narrow screens)",
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

export const NaturalPageContainerStory = defineStory({
  id: "layout-container-page",
  title: "Container · Semantic whitespace and continuous reading",
  group: "Pages and layout",
  groupOrder: 10,
  component: "Container",
  variant: "Page whitespace and natural document flow",
  description:
    "The page keeps its edges along the existing semantic tokens, and long content uses natural page scrolling; width changes do not remount the draft or the trailing actions.",
  covers: ["Container page", "page inset tokens", "natural document scroll", "draft continuity"],
  container: (children) => <div data-container-page-scope>{children}</div>,
  render: () => (
    <Container as="main" width="page" data-container-page>
      <Stack>
        <PageHeader
          title="Check page whitespace and reading order"
          description="This is an isolated natural page composition; it reads no data and saves no settings."
        />
        <Field label="Page draft" htmlFor="container-page-draft">
          <Input
            id="container-page-draft"
            placeholder="Keep the current input and continue checking the page"
          />
        </Field>
        <Stack gap="compact">
          {Array.from({ length: 24 }, (_, index) => (
            <p>
              Reading paragraph {index + 1}: The title, input, and trailing actions line up in the
              same natural content column; long descriptions wrap fully, and after the window
              changes you can continue checking from the current content.
            </p>
          ))}
        </Stack>
        <Inline as="footer">
          <Button variant="outline">Check trailing actions</Button>
          <span>
            Trailing actions keep their natural position and never cover the body as a fixed
            overlay.
          </span>
        </Inline>
      </Stack>
    </Container>
  ),
});

export const NestedLayoutScrollStory = defineStory({
  id: "layout-nested-scroll",
  title: "Layout Item · Fixed header and footer with local scrolling",
  group: "Pages and layout",
  groupOrder: 10,
  component: "LayoutItem",
  variant: "Vertical remaining space and dynamic long content",
  description:
    "The layout allocates the limited height and the reading area scrolls independently; fixed actions, the draft, and natural content flow keep their identity.",
  covers: ["nested min-size", "fixed header/footer", "dynamic content", "numeric basis"],
  render: () => {
    const count = signal(24);
    return (
      <Measure width="wide">
        <Stack
          gap="compact"
          style={{ height: "clamp(240px, calc(100dvh - 170px), 540px)" }}
          data-nested-layout
        >
          <LayoutItem shrink={false} data-nested-fixed="header">
            <Inline gap="compact" justify="between">
              <strong>Check dynamic content and available space</strong>
              <Button size="small" variant="outline" onClick={() => (count.value += 12)}>
                Append content
              </Button>
            </Inline>
          </LayoutItem>
          <LayoutItem grow basis={0} style={{ display: "flex" }} data-nested-body>
            <Inline wrap={false} align="stretch" gap="compact" style={{ flex: 1 }}>
              <LayoutItem basis={120} shrink={false} style="color:inherit" data-numeric-basis>
                <Stack gap="compact">
                  <strong>Current scope</strong>
                  <span>Layout basis</span>
                  <Badge>Local check</Badge>
                </Stack>
              </LayoutItem>
              <LayoutItem grow basis="0%" style={{ display: "flex" }} data-percent-basis>
                <Stack gap="compact" style={{ flex: 1 }}>
                  <LayoutItem shrink={false}>
                    <Field label="Review draft" htmlFor="nested-layout-draft">
                      <Input
                        id="nested-layout-draft"
                        placeholder="Keep editing after the window changes"
                      />
                    </Field>
                  </LayoutItem>
                  <LayoutItem grow basis={0} style={{ display: "flex" }}>
                    <Grid columns={1} gap="none" style={{ flex: 1 }}>
                      <Stack
                        gap="compact"
                        role="region"
                        aria-label="Nested layout reading area"
                        tabIndex={0}
                        style={{ overflow: "auto", overscrollBehavior: "contain" }}
                        data-nested-scroll
                      >
                        {mapSignal(count, (value) =>
                          Array.from({ length: value }, (_, index) => (
                            <p style={{ margin: 0, overflowWrap: "anywhere" }}>
                              Record {index + 1}: Long content flows continuously inside the reading
                              area while the input and bottom actions stay reachable.
                              organization/research-model-with-a-very-long-unbroken-identifier-2026
                            </p>
                          )),
                        )}
                      </Stack>
                    </Grid>
                  </LayoutItem>
                </Stack>
              </LayoutItem>
            </Inline>
          </LayoutItem>
          <LayoutItem shrink={false} data-nested-fixed="footer">
            <Inline gap="compact">
              <Button>Finish check</Button>
              <span>Fixed actions do not scroll with the reading area.</span>
            </Inline>
          </LayoutItem>
        </Stack>
      </Measure>
    );
  },
});
