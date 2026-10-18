import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Stack } from "meowtail";
import {
  Presentation,
  PresentationLayout,
  PresentationList,
  type PresentationLayoutProps,
  type SlideDefinition,
} from "meowtail/presentation";

const variants: readonly NonNullable<PresentationLayoutProps["columns"]>[] = [
  1,
  2,
  3,
  "single",
  "equal",
  "wide-start",
  "wide-end",
];
const slides: readonly SlideDefinition[] = variants.map((columns) => {
  const count = typeof columns === "number" ? columns : columns === "single" ? 1 : 2;
  return {
    id: String(columns),
    title: `${columns} columns`,
    render: () => (
      <PresentationLayout
        columns={columns}
        header={<h2>Native lists and shared column allocations</h2>}
        footer={<small>Header and footer keep their own natural height.</small>}
      >
        {Array.from({ length: count }, (_, index) => (
          <Stack data-foundation-column={index}>
            <h3>Column {index + 1}</h3>
            <PresentationList
              aria-label={`Evidence ${index + 1}`}
              items={[
                "Visible evidence supports a concise claim.",
                index === 2
                  ? "UnbrokenReadingToken".repeat(4)
                  : "Each column receives its share of the remaining canvas.",
              ]}
            />
          </Stack>
        ))}
      </PresentationLayout>
    ),
  };
});

export const PresentationFoundations = defineStory({
  id: "presentation-foundations-contract",
  title: "Presentation columns and native lists",
  render: () => (
    <div style={{ height: "calc(100dvh - 90px)" }}>
      <Presentation
        title="Presentation foundations"
        active={false}
        slides={[
          ...slides,
          {
            id: "nested",
            title: "Nested native lists",
            render: () => (
              <PresentationLayout
                header={<h2>Evidence and next steps</h2>}
                footer={<small>Lists retain native semantics, markers and reading order.</small>}
              >
                <PresentationList
                  aria-label="Evidence summary"
                  items={[
                    <div>
                      Connect the claim to evidence.
                      <PresentationList
                        as="ol"
                        start={4}
                        reversed
                        aria-label="Evidence sources"
                        items={["Read the source sentence.", "Explain the connection."]}
                      />
                    </div>,
                    "Allow another reasonable interpretation.",
                  ]}
                />
              </PresentationLayout>
            ),
          },
        ]}
      />
    </div>
  ),
});
