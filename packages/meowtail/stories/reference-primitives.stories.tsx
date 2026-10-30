import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Button, Inline, Stack } from "meowtail";
import { ShortcutKeys } from "../src/components/shortcut-keys";
import { PathLabel } from "../src/components/path-label";
import { StateDot } from "../src/components/state-dot";
import { HoverCard } from "../src/components/hover-card";
import { Specimen, Specimens } from "./specimen";

/** A path or URL breaks after a separator, never inside a name such as hover-card. */
function breakAfterSlashes(text: string) {
  return text.split("/").flatMap((segment, index) => {
    const name = <span style={{ whiteSpace: "nowrap" }}>{segment}</span>;
    if (!index) return [name];
    // "//" in a URL stays together.
    return segment ? ["/", <wbr />, name] : ["/"];
  });
}

export const ReferencePrimitivesStory = defineStory({
  id: "reference-primitives",
  title: "Path Label · Narrow slots",
  group: "Content and inspection",
  groupOrder: 70,
  component: "PathLabel",
  description:
    "A path only shows text; a narrow slot elides the start of the directory and keeps the file name.",
  render: () => (
    <Specimens>
      <Specimen
        label="Path label"
        note="Each slot keeps the file name and extension; the directory gives way from its start."
        align="start"
      >
        <Stack gap="compact">
          {["100%", "220px", "100px"].map((width) => (
            <div style={{ width, maxWidth: "100%" }}>
              <PathLabel path="packages/meowtail/src/components/shortcut-keys.tsx" />
            </div>
          ))}
        </Stack>
      </Specimen>
    </Specimens>
  ),
});
export const ShortcutKeysStory = defineStory({
  id: "shortcut-keys",
  title: "Shortcut Keys · Platform labels",
  group: "Content and inspection",
  groupOrder: 70,
  component: "ShortcutKeys",
  description: "Key labels come from the host; the tooltip variant sits on an inverse surface.",
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
    </Specimens>
  ),
});
export const StateDotStory = defineStory({
  id: "state-dot",
  title: "State Dot · States and steps",
  group: "Feedback and labels",
  groupOrder: 80,
  component: "StateDot",
  description: "A small mark for a run or step state; the label beside it carries the meaning.",
  render: () => (
    <Specimens>
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
    </Specimens>
  ),
});
export const HoverCardStory = defineStory({
  id: "hover-card",
  title: "Hover Card · Previews and copy",
  group: "Overlays and disclosure",
  groupOrder: 50,
  component: "HoverCard",
  description: "The host provides preview content, readable on hover, keyboard focus or a tap.",
  render: () => (
    <Specimens>
      <Specimen
        label="Hover previews"
        note="Hover, focus or tap a trigger to read its preview; tap again to close it. Activating the wide preview copies its path."
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
              <strong>Release notes</strong>
              <p>
                The host supplies this preview. Its text stays selectable, and on touch a tap opens
                it and a second tap, an outside tap or Escape closes it.
              </p>
              <a href="https://example.com" target="_blank" rel="noreferrer">
                External link example
              </a>
            </Stack>
          }
        />
        <HoverCard
          id="failing-copy-preview"
          copyText="https://example.com/releases/2.4.0"
          onCopy={async () => {
            throw new Error("The clipboard is not available in this example.");
          }}
          trigger={(bindings) => (
            <Button variant="outline" {...bindings}>
              Copy that fails
            </Button>
          )}
          content={
            <p style={{ margin: 0 }}>{breakAfterSlashes("https://example.com/releases/2.4.0")}</p>
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
            content={
              <p style={{ margin: 0 }}>
                {breakAfterSlashes("packages/meowtail/src/components/hover-card.tsx")}
              </p>
            }
          />
        </section>
      </Specimen>
    </Specimens>
  ),
});
