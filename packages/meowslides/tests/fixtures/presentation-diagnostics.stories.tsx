import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Presentation, PresentationLayout, Reveal, type SlideDefinition } from "meowslides";
import { Button, Popover, Stack } from "meowtail";

const slides: readonly SlideDefinition[] = [
  {
    id: "regions",
    title: "Finite regions",
    steps: 1,
    render: () => (
      <PresentationLayout
        header={<h2>A long heading reserves its natural height before the body receives space</h2>}
        footer={<small>Footer remains in its own allocated region.</small>}
      >
        <Stack data-diagnostic-content>
          <p>Visible content fits until a later reveal or dynamic update exceeds this region.</p>
          <Reveal at={1}>
            <p data-diagnostic-reveal style={{ height: "800px" }}>
              A revealed region exceeds its allocation.
            </p>
          </Reveal>
        </Stack>
      </PresentationLayout>
    ),
  },
  {
    id: "scroll",
    title: "Explicit scroll ownership",
    render: () => (
      <PresentationLayout
        header={<h2>Nested scroll owners</h2>}
        footer={<small>Always reachable footer</small>}
      >
        <div style={{ overflow: "auto" }} data-diagnostic-scroll>
          <Stack>
            <p style={{ height: "1200px" }}>
              Long reading content belongs to this scroll viewport.
            </p>
            <textarea
              aria-label="Long draft"
              style={{ height: "80px" }}
              value={"A long draft. ".repeat(100)}
            />
          </Stack>
        </div>
      </PresentationLayout>
    ),
  },
  {
    id: "nested",
    title: "Nested regions",
    render: () => (
      <PresentationLayout header={<h2>Outer title</h2>} footer={<small>Outer source</small>}>
        <PresentationLayout header={<h3>Inner heading</h3>} footer={<small>Inner source</small>}>
          <Stack>
            <p data-diagnostic-content>Inner body receives only its own remaining space.</p>
            <Popover
              id="diagnostic-popover"
              trigger={(bindings) => <Button {...bindings}>Open teaching tools</Button>}
            >
              <p style={{ width: "600px", height: "300px" }}>
                This native top-layer tool may extend beyond the slide.
              </p>
            </Popover>
          </Stack>
        </PresentationLayout>
      </PresentationLayout>
    ),
  },
];

export const PresentationDiagnostics = defineStory({
  id: "presentation-diagnostics",
  title: "Presentation allocated region diagnostics",
  render: () => (
    <div style={{ height: "calc(100dvh - 90px)" }}>
      <Presentation
        title="Shared presentation boundaries"
        slides={slides}
        className="diagnostic-player"
        slideClassName="diagnostic-lesson"
        active={false}
      />
    </div>
  ),
});
