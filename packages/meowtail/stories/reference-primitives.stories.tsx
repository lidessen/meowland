import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Button, Inline, Stack } from "meowtail";
import { ShortcutKeys } from "../src/components/shortcut-keys";
import { PathLabel } from "../src/components/path-label";
import { StateDot } from "../src/components/state-dot";
import { HoverCard } from "../src/components/hover-card";
export const ReferencePrimitivesStory = defineStory({
  id: "reference-primitives",
  title: "Details · Paths, status and preview",
  component: "PathLabel",
  group: "Basic controls",
  groupOrder: 10,
  description:
    "A path only shows text; the host provides preview content, readable on hover or via keyboard focus.",
  render: () => (
    <Stack align="start">
      <Inline>
        Save <ShortcutKeys keys={["⌘", "S"]} />
        <ShortcutKeys keys={["Ctrl", "+", "S"]} variant="tooltip" />
      </Inline>
      <div style={{ width: "260px", maxWidth: "100%" }}>
        <PathLabel path="packages/meowtail/src/components/shortcut-keys.tsx" />
      </div>
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
    </Stack>
  ),
});
