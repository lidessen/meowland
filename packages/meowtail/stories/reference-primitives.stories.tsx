import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Button, Inline, Stack } from "meowtail";
import { ShortcutKeys } from "../src/components/shortcut-keys";
import { PathLabel } from "../src/components/path-label";
import { StateDot } from "../src/components/state-dot";
import { HoverCard } from "../src/components/hover-card";
import { Specimen, Specimens } from "./specimen";
export const ReferencePrimitivesStory = defineStory({
  id: "reference-primitives",
  title: "Details · Paths, status and preview",
  component: "PathLabel",
  group: "Basic controls",
  groupOrder: 10,
  description:
    "A path only shows text; the host provides preview content, readable on hover or via keyboard focus.",
  render: () => (
    <Specimens>
      <Specimen label="Shortcut keys" align="start">
        <Inline>
          Save <ShortcutKeys keys={["⌘", "S"]} />
          {/* The tooltip variant is drawn for an inverse surface, so it is shown on one. */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 8px",
              borderRadius: "8px",
              background: "var(--ui-inverse-surface)",
              color: "var(--ui-inverse-ink)",
            }}
          >
            Save <ShortcutKeys keys={["Ctrl", "+", "S"]} variant="tooltip" />
          </span>
        </Inline>
      </Specimen>
      <Specimen
        label="Path label"
        note="A narrow slot keeps the file name and extension."
        align="start"
      >
        <div style={{ width: "260px", maxWidth: "100%" }}>
          <PathLabel path="packages/meowtail/src/components/shortcut-keys.tsx" />
        </div>
      </Specimen>
      <Specimen label="State dots" align="start">
        <Inline>
          {(["done", "warning", "ongoing", "error", "idle"] as const).map((state) => (
            <Inline>
              <StateDot state={state} />
              <span>{state}</span>
            </Inline>
          ))}
        </Inline>
        <Inline>
          <StateDot state="done" appearance="step" />
          Done
          <StateDot state="idle" appearance="step" />
          Waiting
        </Inline>
      </Specimen>
      <Specimen
        label="Hover previews"
        note="Hover or focus a trigger to read its preview."
        align="start"
      >
        <HoverCard
          id="reference-preview"
          trigger={(bindings) => (
            <Button variant="outline" {...bindings}>
              Component notes
            </Button>
          )}
          content={
            <Stack>
              <strong>PathLabel</strong>
              <p>
                The file name keeps its extension; the full path is available through the native
                tooltip. This is built-in copy and does not read any file.
              </p>
              <a href="https://example.com" target="_blank" rel="noreferrer">
                External link example
              </a>
            </Stack>
          }
        />
        <section id="wide-preview-anchor" style={{ width: "min(680px, calc(100vw - 64px))" }}>
          <HoverCard
            id="wide-reference-preview"
            variant="preview"
            widthAnchor={() => document.getElementById("wide-preview-anchor")}
            copyText="packages/meowtail/src/components/hover-card.tsx"
            onCopy={async (text) => {
              document.getElementById("wide-preview-anchor")!.dataset.copied = text;
            }}
            trigger={(bindings) => (
              <Button variant="outline" {...bindings}>
                Wide preview and copy
              </Button>
            )}
            content={<p>packages/meowtail/src/components/hover-card.tsx</p>}
          />
        </section>
      </Specimen>
    </Specimens>
  ),
});
