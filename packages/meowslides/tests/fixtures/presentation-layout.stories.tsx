import { h } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Presentation,
  PresentationLayout,
  type PresentationLayoutProps,
  type SlideDefinition,
} from "meowslides";
import { AspectRatio, Stack } from "meowtail";

const combinations = [
  { id: "both", header: true, footer: true },
  { id: "header", header: true, footer: false },
  { id: "footer", header: false, footer: true },
  { id: "neither", header: false, footer: false },
] as const;
const columns: readonly PresentationLayoutProps["columns"][] = [
  "single",
  "equal",
  "wide-start",
  "wide-end",
];
const slides: readonly SlideDefinition[] = combinations.flatMap((combination) =>
  columns.map((column) => ({
    id: `${combination.id}-${column}`,
    title: `${combination.id}-${column}`,
    render: () => (
      <PresentationLayout
        columns={column}
        header={
          combination.header ? (
            <h2>
              A long title and a two-line explanation still take natural height, then the rest of
              the space is allocated to the content area
            </h2>
          ) : undefined
        }
        footer={
          combination.footer ? (
            <small>Sources, conditions and supplementary notes keep natural height.</small>
          ) : undefined
        }
      >
        <Stack justify="center" data-layout-first>
          <h3>Main content</h3>
          <p>The placeholder and short explanation establish the region first.</p>
          {combination.id === "neither" && column === "equal" ? (
            <AspectRatio
              ratio={4 / 3}
              style={{ border: "1px dashed currentColor", display: "grid", placeItems: "center" }}
            >
              <span>Image placeholder · 4:3</span>
            </AspectRatio>
          ) : null}
        </Stack>
        {column !== "single" ? (
          <Stack justify="center" data-layout-second>
            <h3>Supplementary content</h3>
            <p>
              The longer explanation stays in its own region, and the column ratio does not change
              with the host window.
            </p>
          </Stack>
        ) : null}
      </PresentationLayout>
    ),
  })),
);

export const PresentationLayoutBoundaries = defineStory({
  id: "presentation-layout-boundaries",
  title: "Presentation layout boundary fixture",
  render: () => (
    <div style={{ height: "calc(100dvh - 90px)" }}>
      <Presentation title="Layout boundaries" slides={slides} active={false} />
    </div>
  ),
});
