import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Inline, Stack } from "meowtail";
import {
  Presentation,
  Reveal,
  type PresentationTransitionEffect,
  type SlideDefinition,
} from "meowslides";

function transitionExample(effect: PresentationTransitionEffect) {
  const slides: SlideDefinition[] = [
    {
      id: "opening",
      title: "New-page entrance",
      render: () => (
        <Stack gap="normal" justify="center" style={{ height: "100%" }}>
          <small>Presentation · {effect}</small>
          <h1>Keep the narrative moving.</h1>
          <p>Next enters a new page. Previous reverses the slide movement.</p>
          <small>Old pages stop and unmount immediately.</small>
        </Stack>
      ),
    },
    {
      id: "steps",
      title: "Step-by-step appearance",
      steps: 3,
      render: () => (
        <Stack gap="normal" justify="center" style={{ height: "100%" }}>
          <h2>Three beats, one page.</h2>
          <Inline gap="normal">
            <Reveal at={1} transition="fade">
              <p>Fade into view.</p>
            </Reveal>
            <Reveal at={2} transition={{ effect: "slide", direction: "up" }}>
              <p>Slide up gently.</p>
            </Reveal>
            <Reveal at={3} transition="zoom">
              <p>Zoom to the point.</p>
            </Reveal>
          </Inline>
          <small>Previous conceals immediately. A direct jump shows its final state.</small>
        </Stack>
      ),
    },
    {
      id: "closing",
      title: "Interrupt and navigate",
      render: () => (
        <Stack gap="normal" justify="center" style={{ height: "100%" }}>
          <h2>The controls stay yours.</h2>
          <p>Try rapid Previous / Next or jump in Contents during an entrance.</p>
          <small>Pause effects and reduced motion show the final state without replay.</small>
        </Stack>
      ),
    },
  ];
  return (
    <div style={{ height: "min(780px, 100dvh)", minHeight: 0 }}>
      <Presentation
        title={`Presentation transitions · ${effect}`}
        slides={slides}
        transition={effect}
      />
    </div>
  );
}

export const FadeTransitionsStory = defineStory({
  id: "presentation-transition-fade",
  title: "Presentation entrance · fade",
  group: "Presentation",
  component: "Presentation",
  variant: "fade",
  description:
    "New pages fade in and in-page steps appear; pause and reduced motion show the final state directly.",
  covers: ["new-page entrance", "step appearance", "interruption", "reduced motion"],
  render: () => transitionExample("fade"),
});

export const SlideTransitionsStory = defineStory({
  id: "presentation-transition-slide",
  title: "Presentation entrance · slide",
  group: "Presentation",
  component: "Presentation",
  variant: "slide",
  description:
    "New pages slide in and in-page steps appear; forward moves left, backward moves right.",
  covers: ["new-page entrance", "step appearance", "interruption", "reduced motion"],
  render: () => transitionExample("slide"),
});

export const ZoomTransitionsStory = defineStory({
  id: "presentation-transition-zoom",
  title: "Presentation entrance · zoom",
  group: "Presentation",
  component: "Presentation",
  variant: "zoom",
  description: "New pages zoom in and in-page steps appear; the canvas scaling contract is kept.",
  covers: ["new-page entrance", "step appearance", "interruption", "reduced motion"],
  render: () => transitionExample("zoom"),
});
