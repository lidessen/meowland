import { h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogPanel,
  Field,
  Icon,
  IconButton,
  Input,
  Stack,
  Inline,
  PageFrame,
  PageHeader,
  SegmentedControl,
} from "meowtail";
import { Specimen } from "./specimen";

export const DialogLayoutStory = defineStory({
  id: "dialog-layout",
  title: "Dialog Panel · Fixed header and body scrolling",
  group: "Overlays and disclosure",
  groupOrder: 50,
  component: "DialogPanel",
  variant: "Natural height and host constraints",
  description:
    "Short forms keep their natural height; long bodies and host-constrained windows share the same page shell. Forms still use native submit and cancel.",
  covers: ["fixed header", "layout scroll owner", "intrinsic height", "host height", "native form"],
  render() {
    return (
      <Specimen
        label="Open a dialog"
        note="Each dialog keeps its title and close action fixed while the body scrolls."
      >
        <Inline gap="compact">
          {(["short", "long", "limited", "workspace"] as const).map((kind) => {
            let dialog: HTMLDialogElement | undefined;
            const name = {
              short: "Short form",
              long: "Long body",
              limited: "Limited height",
              workspace: "Full workspace",
            }[kind];
            return (
              <div>
                <Button
                  variant="outline"
                  size={kind === "limited" ? "small" : "default"}
                  onClick={() => {
                    dialog?.showModal();
                  }}
                >
                  Open {name}
                </Button>
                <Dialog
                  labelledBy={`${kind}-title`}
                  style={
                    kind === "limited"
                      ? { maxHeight: "40svh" }
                      : kind === "workspace"
                        ? { height: "100dvh", maxHeight: "none" }
                        : undefined
                  }
                  ref={(element: HTMLDialogElement) => {
                    dialog = element;
                  }}
                >
                  <DialogPanel
                    as="form"
                    method="dialog"
                    header={
                      <DialogHeader
                        title={`${name} · Current item and close action`}
                        titleId={`${kind}-title`}
                        actions={
                          <IconButton
                            label={`Close ${name}`}
                            onClick={() => {
                              dialog?.close("cancel");
                            }}
                          >
                            <Icon name="x" />
                          </IconButton>
                        }
                      />
                    }
                  >
                    <Stack gap="compact">
                      <Field label={`${name} draft`} htmlFor={`${kind}-draft`}>
                        <Input
                          id={`${kind}-draft`}
                          name="draft"
                          value="Keep the current input"
                          required
                        />
                      </Field>
                      {kind !== "short" ? (
                        Array.from({ length: 24 }, (_, i) => (
                          <p>
                            Body {i + 1}: Reading content, editing the draft, and closing the window
                            stay independent; the title and close entry always belong to the same
                            top region.
                          </p>
                        ))
                      ) : (
                        <p>A short form uses only the height its content needs.</p>
                      )}
                    </Stack>
                    <Button
                      type="submit"
                      value="save"
                      size={kind === "limited" ? "small" : "default"}
                    >
                      Save {name}
                    </Button>
                  </DialogPanel>
                </Dialog>
              </div>
            );
          })}
        </Inline>
      </Specimen>
    );
  },
});

export const CatalogFrameStory = defineStory({
  id: "page-frame-catalog",
  title: "Page Frame · Wrapping title and catalog filtering",
  group: "Pages and layout",
  groupOrder: 10,
  component: "PageFrame",
  variant: "Natural header and remaining body",
  description:
    "The title, description, refresh action, and categories share their natural height; the body claims the remaining space on its own, and header controls are not clipped by percentages.",
  render() {
    const selected = signal("all");
    return (
      <div style={{ height: "calc(100dvh - 32px)", minHeight: 0 }}>
        <PageFrame
          scrollOwner="layout"
          header={
            <Stack gap="compact">
              <PageHeader
                title="Extension catalog"
                description="Browse authorized capabilities and pages; categories do not change the identity of the content."
                actions={<Button variant="outline">Refresh catalog</Button>}
              />
              <SegmentedControl
                id="catalog-kind"
                label="Catalog categories"
                value={selected}
                onValueChange={(value) => {
                  selected.value = value;
                }}
                options={[
                  { value: "all", label: "All" },
                  { value: "local", label: "Local" },
                  { value: "enabled", label: "Enabled" },
                ]}
              />
            </Stack>
          }
        >
          <Stack>
            {Array.from({ length: 20 }, (_, index) => (
              <p>Catalog content {index + 1}: The main region keeps its own scroll range.</p>
            ))}
          </Stack>
        </PageFrame>
      </div>
    );
  },
});
