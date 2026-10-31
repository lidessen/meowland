import { h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { Grid, LayoutItem, Stack } from "meowtail";
import {
  Presentation,
  PresentationLayout,
  Reveal,
  type SlideDefinition,
  type SlidePosition,
} from "meowslides";
import { presentationTokens } from "meowslides/theme";
import coast from "../../../examples/presentation/assets/coast-delivery.jpg";

const layouts: readonly SlideDefinition[] = [
  {
    id: "title",
    title: "Title and claim",
    render: () => (
      <PresentationLayout
        footer={<small>Composition example · Content provided by the author</small>}
      >
        <Stack justify="center" gap="relaxed">
          <small>Clarify one thing first</small>
          <h1>
            Organize the presentation by region relationships, giving the title, evidence and
            conclusion each a place
          </h1>
          <p>A long title wraps naturally; a short subtitle adds the purpose.</p>
        </Stack>
      </PresentationLayout>
    ),
  },
  {
    id: "media",
    title: "Text-image split · 1:2",
    render: () => (
      <PresentationLayout
        columns="wide-end"
        header={<h2>Decide the image ratio first, then place real assets</h2>}
        footer={
          <small>
            The original example image comes from the image-waiting presentation and is only for
            observing layout.
          </small>
        }
      >
        <Stack justify="center">
          <p>
            The text keeps the main point; the image illustrates the phenomenon; check the actual
            crop after replacing the asset.
          </p>
          <small>
            1:2 is the logical column ratio of the content area and does not depend on the host
            window width.
          </small>
        </Stack>
        <Stack style={{ height: "100%" }}>
          <LayoutItem grow basis="0%">
            <img
              src={coast}
              alt="Original coast example illustration"
              aria-describedby="layout-media-caption"
              style={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }}
            />
          </LayoutItem>
          <LayoutItem shrink={false}>
            <small id="layout-media-caption">Real image · contain keeps complete edges</small>
          </LayoutItem>
        </Stack>
      </PresentationLayout>
    ),
  },
  {
    id: "comparison",
    title: "Side-by-side comparison · 1:1",
    render: () => (
      <PresentationLayout
        columns="equal"
        header={<h2>The same comparison axis makes differences easier to check</h2>}
      >
        <Stack>
          <h3>Option A</h3>
          <p>Short conclusion.</p>
          <p>Suits a presentation whose content is relatively fixed.</p>
        </Stack>
        <Stack>
          <h3>Option B</h3>
          <p>
            A longer explanation covers conditions and costs while keeping the reading relationship
            with the same heading hierarchy.
          </p>
          <p>Suits interactions where the audience needs to change input.</p>
        </Stack>
      </PresentationLayout>
    ),
  },
  {
    id: "metric",
    title: "Key number · 2:1",
    render: () => (
      <PresentationLayout
        columns="wide-start"
        header={<h2>Numbers state units and conditions first</h2>}
        footer={
          <small>
            Illustrative value; it does not represent a measurement or a product promise.
          </small>
        }
      >
        <Stack justify="center">
          <strong
            style={{ fontSize: `calc(${presentationTokens.fontTitle} * 2)`, lineHeight: "1.1" }}
          >
            3 items
          </strong>
          <p>Keep only a few explainable key observations per page.</p>
        </Stack>
        <Stack justify="center">
          <h3>How to read</h3>
          <p>Read the number first, then the unit, conditions and source.</p>
        </Stack>
      </PresentationLayout>
    ),
  },
  {
    id: "process",
    title: "Process and timeline",
    render: () => (
      <PresentationLayout
        header={<h2>Divide the regions first, then present the process step by step</h2>}
        footer={
          <small>
            The order comes from the native ordered list; step visibility can further compose
            Reveal.
          </small>
        }
      >
        <Grid as="ol" columns={3} gap="relaxed">
          <li>
            <Stack>
              <h3>Observe</h3>
              <p>Record reproducible phenomena.</p>
            </Stack>
          </li>
          <li>
            <Stack>
              <h3>Compare</h3>
              <p>Check differences under the same conditions.</p>
            </Stack>
          </li>
          <li>
            <Stack>
              <h3>Decide</h3>
              <p>State the conclusion and its applicable boundaries.</p>
            </Stack>
          </li>
        </Grid>
      </PresentationLayout>
    ),
  },
  {
    id: "summary",
    title: "Quote and summary",
    steps: 1,
    render: () => (
      <PresentationLayout
        header={<h2>The conclusion and the basis each keep their own role</h2>}
        footer={
          <small>Author example text; it does not pretend to be an external quotation.</small>
        }
      >
        <Stack justify="center" gap="relaxed">
          <blockquote>
            <p>"First make the point clear, then decide how visuals help it."</p>
          </blockquote>
          <Reveal at={1}>
            <Stack>
              <h3>What to do next</h3>
              <p>
                Keep the claim, conditions and next step so the final page can stand on its own.
              </p>
            </Stack>
          </Reveal>
        </Stack>
      </PresentationLayout>
    ),
  },
];

export const PresentationLayoutsStory = defineStory({
  id: "presentation-layouts",
  title: "Presentation compositions · Starting from regions",
  group: "Presentation and media",
  component: "PresentationLayout",
  variant: "Title, text-image, comparison, number, process and summary",
  description:
    "One content skeleton plus public layout components compose common presentation pages; the canvas scales as a whole and the inner composition keeps logical proportions.",
  covers: [
    "title",
    "media",
    "comparison",
    "metric",
    "process",
    "summary",
    "column proportions",
    "Reveal",
  ],
  render: () => (
    <div style={{ height: "min(900px, calc(100dvh - 32px))" }}>
      <Presentation
        title="Common presentation compositions"
        slides={layouts}
        position={signal<SlidePosition>({ slideId: "title", step: 0 })}
        active={false}
      />
    </div>
  ),
  async ready({ root }) {
    await root.ownerDocument.fonts.ready;
    await Promise.all(Array.from(root.querySelectorAll("img"), (image) => image.decode()));
  },
});
