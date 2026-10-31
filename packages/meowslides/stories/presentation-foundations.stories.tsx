import { h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { Stack } from "meowtail";
import {
  Presentation,
  PresentationImage,
  PresentationLayout,
  PresentationList,
  type SlideDefinition,
  type SlidePosition,
} from "meowslides";
import panda from "../../../examples/protecting-pandas/assets/panda-adult.jpg";

const diagram = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600"><rect width="1200" height="600" fill="#f4f6ee"/><g fill="#244d40" font-family="sans-serif" text-anchor="middle"><text x="600" y="85" font-size="42">From observation to explanation</text><g fill="#fffdf5" stroke="#748e78" stroke-width="4"><rect x="40" y="180" width="320" height="230" rx="22"/><rect x="440" y="180" width="320" height="230" rx="22"/><rect x="840" y="180" width="320" height="230" rx="22"/></g><g font-size="40"><text x="200" y="285">Observe</text><text x="600" y="285">Compare</text><text x="1000" y="285">Explain</text></g><g font-size="26"><text x="200" y="340">Keep the source</text><text x="600" y="340">Use the same criteria</text><text x="1000" y="340">State the conditions</text></g><g font-size="46"><text x="400" y="310">→</text><text x="800" y="310">→</text></g><text x="600" y="535" font-size="28">All three regions and this final line must remain visible.</text></g></svg>',
)}`;

const slides: readonly SlideDefinition[] = [
  {
    id: "two-columns",
    title: "Two columns · List and photo",
    render: () => (
      <PresentationLayout
        columns={2}
        header={<h2>Each column has its own task; the photo appears with an explicit crop</h2>}
        footer={
          <small>
            The two columns belong to the logical canvas; narrow windows still scale as a whole and
            do not automatically reflow top-bottom.
          </small>
        }
      >
        <Stack>
          <h3>Say clearly what to observe first</h3>
          <PresentationList
            items={[
              "Describe the posture and environment you see.",
              "Keep observation separate from your own inference.",
              "Use contain when the complete edges are needed.",
            ]}
          />
        </Stack>
        <PresentationImage
          src={panda}
          alt="Gao Gao rests on a raised structure with branches and plants visible around"
          ratio="fill"
          fit="cover"
          position="center"
          caption="Gao Gao · Mike Richey · CC BY-SA 3.0. Reuses the credited local photo from Protecting pandas; this page may crop the surrounding environment."
        />
      </PresentationLayout>
    ),
  },
  {
    id: "three-columns",
    title: "Three columns · Native lists",
    render: () => (
      <PresentationLayout
        columns={3}
        header={<h2>Equal column widths organize three reading areas</h2>}
        footer={
          <small>
            The example is authored arrangement and does not represent classroom steps or scoring;
            the third column keeps native reversed numbering.
          </small>
        }
      >
        <Stack>
          <h3>Observe</h3>
          <PresentationList
            items={[
              "Keep the original description.",
              "Point out the specific location.",
              "Record what is still uncertain.",
            ]}
          />
        </Stack>
        <Stack>
          <h3>Check</h3>
          <PresentationList
            as="ol"
            items={[
              "Compare under the same conditions.",
              "Separate facts from inference.",
              "Check the source and applicable scope.",
            ]}
          />
        </Stack>
        <Stack>
          <h3>Converge</h3>
          <PresentationList
            as="ol"
            start={3}
            reversed
            items={[
              "Keep the most important question.",
              "Choose an explainable conclusion.",
              "State the next step.",
            ]}
          />
        </Stack>
      </PresentationLayout>
    ),
  },
  {
    id: "text-image",
    title: "Text diagram · Complete display",
    render: () => (
      <PresentationLayout
        columns="wide-end"
        header={<h2>When the image contains text, keep the complete content first</h2>}
        footer={
          <small>
            Original static diagram; the information relationships also have a real text
            explanation, and the image is not the only readable material.
          </small>
        }
      >
        <Stack>
          <h3>Observe → Compare → Explain</h3>
          <PresentationList
            items={[
              "contain is the default and keeps the edges.",
              "Blank space comes from the ratio difference between the image and the region.",
              "The caption takes natural height and the picture uses the remainder.",
            ]}
          />
        </Stack>
        <PresentationImage
          src={diagram}
          alt="From observation to explanation: keep the sources, compare by the same criteria and state the conditions of the conclusion; the bottom line of explanation must also be fully visible"
          ratio="fill"
          caption="Fully shows the three regions, both end edges and the bottom explanation. contain does not promise to also fill all available area."
        />
      </PresentationLayout>
    ),
  },
];

export const PresentationFoundationsStory = defineStory({
  id: "presentation-foundations",
  title: "Presentation foundations · Columns, lists and images",
  group: "Presentation and media",
  component: "PresentationLayout",
  variant: "Two columns, three columns, native lists and image fitting",
  description:
    "Observe logical column counts, body lists, photo cover and text-diagram contain in the same real presentation, plus the height budget of a natural caption.",
  covers: ["numeric columns", "PresentationList", "PresentationImage", "fill", "cover", "contain"],
  render: () => (
    <div style={{ height: "min(900px, calc(100dvh - 32px))" }}>
      <Presentation
        title="Presentation foundations composition"
        slides={slides}
        position={signal<SlidePosition>({ slideId: "two-columns", step: 0 })}
        active={false}
      />
    </div>
  ),
  async ready({ root }) {
    await root.ownerDocument.fonts.ready;
    await Promise.all(Array.from(root.querySelectorAll("img"), (image) => image.decode()));
  },
});
