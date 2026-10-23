import { h, signal, mapSignal } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Button,
  Field,
  Input,
  Popover,
  ChoiceSelect,
  Dialog,
  DialogPanel,
  DialogHeader,
  Stack,
} from "meowtail";
import { Note } from "./specimen";

export const PopoverEscapeStory = defineStory({
  id: "popover-escape",
  title: "Popover · Child controls and modal closing",
  group: "Overlays and feedback",
  component: "Popover",
  covers: ["Popover", "child DOM Escape", "Dialog", "unmount"],
  render() {
    let dialog: HTMLDialogElement | undefined;
    const childOpen = signal(false);
    const mounted = signal(true);
    const parentKeys = signal(0);
    const childKeys = signal(0);
    let closeFromCallback = false;
    return (
      <Stack gap="normal">
        <div>
          <Button onClick={() => dialog?.showModal()}>Open popover dialog</Button>
        </div>
        <Dialog
          id="escape-dialog"
          labelledBy="escape-title"
          ref={(node: HTMLDialogElement) => {
            dialog = node;
          }}
        >
          <DialogPanel
            header={
              <DialogHeader
                title="Local editing and returning"
                titleId="escape-title"
                actions={
                  <Button variant="quiet" onClick={() => dialog?.close()}>
                    Close dialog
                  </Button>
                }
              />
            }
          >
            <Stack gap="normal">
              <p>
                Input controls handle their own Escape first; if it is unhandled, the current
                popover closes.
              </p>
              <Popover
                id="escape-parent"
                onKeyDown={(event) => {
                  if (event.key === "Escape") parentKeys.value++;
                }}
                trigger={(bindings) => <Button {...bindings}>Open parent popover</Button>}
              >
                <Stack gap="normal">
                  <Field label="Local draft">
                    <Input aria-label="Local draft" />
                  </Field>
                  {mapSignal(mounted, (shown) =>
                    shown ? (
                      <Popover
                        id="escape-child"
                        open={childOpen}
                        onOpenChange={(next) => {
                          childOpen.value = next;
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Escape") {
                            childKeys.value++;
                            if (closeFromCallback) childOpen.value = false;
                          }
                        }}
                        trigger={(bindings) => <Button {...bindings}>Open child popover</Button>}
                      >
                        <Stack gap="normal">
                          <Input aria-label="Child popover draft" />
                          <Button
                            onClick={() => {
                              closeFromCallback = true;
                            }}
                          >
                            Close child popover via callback
                          </Button>
                          <Button
                            onClick={() => {
                              childOpen.value = false;
                            }}
                          >
                            Close child popover
                          </Button>
                          <Button
                            onClick={() => {
                              mounted.value = false;
                            }}
                          >
                            Remove child popover
                          </Button>
                        </Stack>
                      </Popover>
                    ) : (
                      <Button
                        onClick={() => {
                          childOpen.value = false;
                          mounted.value = true;
                        }}
                      >
                        Restore child popover
                      </Button>
                    ),
                  )}
                </Stack>
              </Popover>
              <output id="escape-callbacks">
                Parent {parentKeys} · Child {childKeys}
              </output>
            </Stack>
          </DialogPanel>
        </Dialog>
      </Stack>
    );
  },
});

export const PopoverStory = defineStory({
  id: "popover",
  title: "Popover · In-place editing and returning",
  group: "Overlays and feedback",
  groupOrder: 30,
  component: "Popover",
  variant: "In-place editing and nesting",
  description:
    "Expands content next to the current action; it can nest, open and close under control, and Escape returns to the previous layer.",
  covers: ["Popover", "controlled", "nested", "edge positioning", "focus return"],
  render() {
    const controlled = signal(false);
    const retained = signal(false);
    const redirected = signal(false);
    let external: HTMLElement | undefined;
    const paneTitle = signal("Choose settings");
    let inPane = false;
    return (
      <div className="workshop-stack workshop-constrained">
        <header className="workshop-composition-header">
          <h2>Settings kept at hand</h2>
          <p>Change how things are displayed, then return to what you were reading.</p>
        </header>
        <div className="workshop-actions">
          <Popover
            id="display-popover"
            role="dialog"
            labelledBy="display-title"
            trigger={(bindings) => (
              <Button variant="outline" {...bindings}>
                Display settings
              </Button>
            )}
          >
            <div className="workshop-section">
              <header className="workshop-composition-header">
                <h2 id="display-title">Display settings</h2>
                <p>Affects only the current preview.</p>
              </header>
              <Field label="Display name" htmlFor="popover-name">
                <Input id="popover-name" value="Work view" />
              </Field>
              <Popover
                id="nested-popover"
                role="dialog"
                labelledBy="nested-title"
                align="end"
                trigger={(bindings) => (
                  <Button variant="quiet" {...bindings}>
                    More settings
                  </Button>
                )}
              >
                <div className="workshop-section">
                  <h3 id="nested-title" className="workshop-section-title">
                    Reading width
                  </h3>
                  <Note>Keep space for the body and let supporting actions step aside.</Note>
                  <Input aria-label="Width note" placeholder="Write down your preference…" />
                </div>
              </Popover>
            </div>
          </Popover>
          <Popover
            id="controlled-popover"
            open={controlled}
            onOpenChange={(next) => {
              controlled.value = next;
            }}
            role="dialog"
            labelledBy="controlled-title"
            trigger={(bindings) => (
              <Button variant="quiet" {...bindings}>
                Open controlled panel
              </Button>
            )}
          >
            <div className="workshop-section">
              <h3 id="controlled-title" className="workshop-section-title">
                Open and close managed by the host
              </h3>
              <Note>Focus returns to the trigger after closing.</Note>
              <Button
                onClick={() => {
                  controlled.value = false;
                }}
              >
                Close controlled panel
              </Button>
            </div>
          </Popover>
          <Button
            variant="quiet"
            ref={(element: HTMLElement) => {
              external = element;
            }}
          >
            External action
          </Button>
          <Popover
            id="retained-popover"
            open={retained}
            onOpenChange={(next) => {
              if (next) retained.value = true;
            }}
            role="dialog"
            labelledBy="retained-title"
            trigger={(bindings) => (
              <Button variant="quiet" {...bindings}>
                Keep controlled panel
              </Button>
            )}
          >
            <h3 id="retained-title">Host keeps the current panel</h3>
            <Input aria-label="Retained panel draft" value="Waiting for the host" />
          </Popover>
          <Popover
            id="redirected-popover"
            open={redirected}
            onOpenChange={(next) => {
              redirected.value = next;
              if (!next) external?.focus();
            }}
            role="dialog"
            labelledBy="redirected-title"
            trigger={(bindings) => (
              <Button variant="quiet" {...bindings}>
                Continue external action after closing
              </Button>
            )}
          >
            <h3 id="redirected-title">Host chooses the next focus</h3>
            <p>Continue to the external action after closing.</p>
          </Popover>
          <Popover
            id="pane-popover"
            role="dialog"
            labelledBy="pane-title"
            onKeyDown={(event) => {
              if (event.key === "Escape" && inPane) {
                event.preventDefault();
                inPane = false;
                paneTitle.value = "Choose settings";
              }
            }}
            onOpenChange={() => {
              inPane = false;
              paneTitle.value = "Choose settings";
            }}
            trigger={(bindings) => (
              <Button variant="quiet" {...bindings}>
                Layered settings
              </Button>
            )}
          >
            <div className="workshop-section">
              <h3 id="pane-title">{paneTitle}</h3>
              <Button
                onClick={() => {
                  inPane = true;
                  paneTitle.value = "Settings details";
                }}
              >
                Open details
              </Button>
            </div>
          </Popover>
        </div>
      </div>
    );
  },
});

export const ChoiceSelectStory = defineStory({
  id: "choice-select",
  title: "Select · Custom popup and keyboard",
  group: "Form inputs",
  groupOrder: 20,
  component: "ChoiceSelect",
  variant: "Keyboard and forms",
  description:
    "A popover carries single selection; arrow keys, character navigation, and native form validation stay continuous.",
  covers: ["ChoiceSelect", "Popover", "keyboard", "required", "form reset"],
  render() {
    const feedback = signal("Configuration is only demoed locally; no content is published.");
    const controlled = signal("draft");
    return (
      <form
        className="workshop-stack workshop-constrained"
        onSubmit={(event: SubmitEvent) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget as HTMLFormElement);
          feedback.value = `Submitted: ${data.get("delivery")} · ${data.get("environment")}`;
        }}
      >
        <header className="workshop-composition-header">
          <h2>Prepare delivery</h2>
          <p>Options expand in place, and long names remain fully readable.</p>
        </header>
        <Field
          label="Delivery target"
          htmlFor="custom-delivery"
          description="Arrow keys move, Enter confirms, Escape returns."
        >
          <ChoiceSelect
            id="custom-delivery"
            name="delivery"
            defaultValue="review"
            options={[
              { value: "draft", label: "Keep as a local draft", group: "Current project" },
              {
                value: "review",
                label:
                  "Hand to the project owner to review all changes and the verification record",
                group: "Current project",
              },
              {
                value: "remote",
                label: "Remote project · not connected",
                group: "Other locations",
                disabled: true,
              },
              {
                value: "archived",
                label: "File into the project archive",
                group: "Other locations",
              },
            ]}
          />
        </Field>
        <Field
          label="Release environment"
          htmlFor="custom-environment"
          description="Required; native form validation applies on submit."
        >
          <ChoiceSelect
            id="custom-environment"
            name="environment"
            required
            placeholder="Select an environment…"
            options={[
              { value: "local", label: "Local preview only" },
              { value: "staging", label: "Staging environment" },
            ]}
          />
        </Field>
        <Field label="Searchable model" htmlFor="searchable-model">
          <ChoiceSelect
            id="searchable-model"
            searchable
            searchPlaceholder="Search by model name or ID"
            defaultValue=""
            options={[
              { value: "", label: "Follow the runner default" },
              { value: "gpt-6-astra", label: "GPT-6-Astra · gpt-6-astra" },
              { value: "gpt-6-sol", label: "GPT-6-Sol · gpt-6-sol" },
              { value: "gpt-6-luna", label: "GPT-6-Luna · gpt-6-luna" },
            ]}
          />
        </Field>
        <Field
          label="Controlled select"
          htmlFor="custom-controlled"
          description="A form reset keeps the caller's current selection."
        >
          <ChoiceSelect
            id="custom-controlled"
            name="controlled"
            value={controlled}
            onValueChange={(next) => {
              controlled.value = next;
            }}
            options={[
              { value: "draft", label: "Keep draft" },
              { value: "review", label: "Submit for review" },
            ]}
          />
        </Field>
        <div className="workshop-actions">
          <Button type="submit">Submit configuration</Button>
          <Button variant="quiet" type="reset">
            Restore defaults
          </Button>
        </div>
        <Note role="status">{feedback}</Note>
      </form>
    );
  },
});
