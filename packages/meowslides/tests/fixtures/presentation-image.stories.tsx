import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { LayoutItem, Stack } from "meowtail";
import {
  Presentation,
  PresentationImage,
  PresentationLayout,
  type SlideDefinition,
} from "meowslides";

// Synthetic geometry and corner labels are test material, not classroom evidence.
const specimen = (width: number, height: number) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#e6eddf"/><rect width="70" height="70" fill="#ac392f"/><rect x="${width - 70}" width="70" height="70" fill="#2b5ea3"/><rect y="${height - 70}" width="70" height="70" fill="#c58d18"/><rect x="${width - 70}" y="${height - 70}" width="70" height="70" fill="#387b4b"/><g font-family="sans-serif" font-size="18" fill="white"><text x="8" y="25">TL text</text><text x="${width - 65}" y="25">TR text</text><text x="8" y="${height - 15}">BL text</text><text x="${width - 65}" y="${height - 15}">BR text</text></g><text x="50%" y="50%" text-anchor="middle" font-family="sans-serif" font-size="24">${width} × ${height}</text></svg>`)}`;
const portrait = specimen(300, 600);
const landscape = specimen(600, 300);
const square = specimen(400, 400);
const slides: readonly SlideDefinition[] = [
  {
    id: "ratio-grid",
    title: "Natural ratios in a grid",
    render: () => (
      <PresentationLayout columns={3} header={<h2>Only fill receives the remaining height</h2>}>
        {[portrait, landscape, square].map((src, index) => (
          <PresentationImage
            src={src}
            alt={`Numeric ratio document ${index + 1}`}
            caption="A numeric frame keeps its preferred ratio instead of stretching with the grid."
          />
        ))}
      </PresentationLayout>
    ),
  },
  {
    id: "contain",
    title: "Complete documents",
    render: () => (
      <PresentationLayout
        columns={3}
        header={<h2>Contain preserves every corner</h2>}
        footer={<small>Synthetic corner labels; captions remain outside the image frame.</small>}
      >
        {[
          ["Portrait document", portrait],
          ["Landscape document", landscape],
          ["Square document", square],
        ].map(([alt, src]) => (
          <PresentationImage
            src={src!}
            alt={alt!}
            ratio="fill"
            caption={`${alt}: all four corner labels must remain visible.`}
          />
        ))}
      </PresentationLayout>
    ),
  },
  {
    id: "cover",
    title: "Explicit crops",
    render: () => (
      <PresentationLayout columns={2} header={<h2>Authors choose the crop and position</h2>}>
        <PresentationImage
          src={portrait}
          alt="Portrait crop anchored at the top left"
          ratio="fill"
          fit="cover"
          position="top left"
          caption="Cover at top left: the bottom corners are deliberately outside the crop."
        />
        <PresentationImage
          src={landscape}
          alt="Landscape crop anchored at the bottom right"
          ratio="fill"
          fit="cover"
          position="bottom right"
          caption="Cover at bottom right: the left edge is deliberately outside the crop."
        />
      </PresentationLayout>
    ),
  },
  {
    id: "feedback",
    title: "Stable feedback and captions",
    render: () => (
      <PresentationLayout
        columns={2}
        header={<h2>Image state does not replace the layout</h2>}
        footer={<small>The page keeps a separate footer below both image figures.</small>}
      >
        <Stack>
          <p>Read this task before the image.</p>
          <LayoutItem grow basis={0}>
            <PresentationImage
              src={square}
              alt="Delayed square document"
              ratio="fill"
              caption="A longer source note can wrap over several lines while the frame receives the remaining space."
            />
          </LayoutItem>
        </Stack>
        <PresentationImage
          src="/presentation-image-unavailable.svg"
          alt="Unavailable document"
          ratio="fill"
          failedLabel="The image is unavailable. Use the written description and keep the source note in view."
          caption="A source note remains readable when its image fails; no separate state machine is used."
        />
      </PresentationLayout>
    ),
  },
];

export const PresentationImages = defineStory({
  id: "presentation-images",
  title: "Presentation image boundary fixture",
  render: () => (
    <div style={{ height: "calc(100dvh - 90px)" }}>
      <Presentation title="Presentation images" slides={slides} active={false} />
    </div>
  ),
});

export const NaturalPresentationImage = defineStory({
  id: "presentation-image-natural",
  title: "Presentation image in natural flow",
  render: () => (
    <div style={{ width: "min(100%, 420px)" }}>
      <PresentationImage
        src={landscape}
        alt="Natural-flow document"
        ratio={3 / 2}
        caption="The numeric ratio sizes only the image frame; this caption follows it."
      />
    </div>
  ),
});
