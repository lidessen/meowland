import { h } from "meowjsx/runtime";
import { signal } from "meowjsx/signal";
import { uiTokens } from "meowtail/theme";
import {
  ActionRow,
  Badge,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogHeader,
  DialogPanel,
  EmptyState,
  Field,
  Grid,
  Icon,
  IconButton,
  Inline,
  Input,
  LayoutItem,
  Section,
  Select,
  Stack,
  Textarea,
} from "meowtail";
import { Measure, Note, Specimen, Specimens } from "./specimen";
import { defineStory } from "meowbook";

export const ButtonsStory = defineStory({
  id: "buttons",
  title: "Button · Action hierarchy",
  group: "Basic controls",
  groupOrder: 10,
  component: "Button",
  variant: "Action hierarchy",
  description:
    "Four real button variants plus the disabled state. Use Tab to see focus; disabled buttons cannot trigger actions.",
  covers: ["Button", "primary / quiet / outline / danger", "disabled", "keyboard focus"],
  render: () => (
    <Measure width="narrow">
      <Stack data-button-composition>
        <Stack as="header" gap="compact">
          <h2 style={{ margin: 0, fontSize: uiTokens.type.title, fontWeight: 600 }}>
            Ready to deliver this change
          </h2>
          <span style={{ color: uiTokens.ink.secondary }}>
            The primary action is clear and supporting actions step back. Every action is demoed
            locally only.
          </span>
        </Stack>
        <ActionRow>
          <Button data-action="Saved the local sample.">Save changes</Button>
          <Button variant="outline" data-action="Diff sample selected.">
            View diff
          </Button>
          <Button variant="quiet" data-action="Continue editing.">
            Continue editing
          </Button>
        </ActionRow>
        <Stack as="section" gap="compact" aria-label="Actions not yet available">
          <span style={{ color: uiTokens.ink.secondary, fontSize: uiTokens.type.caption }}>
            No submission target selected yet
          </span>
          <ActionRow>
            <Button disabled>Submit changes</Button>
            <Button variant="outline" disabled>
              Preview submission
            </Button>
            <Button variant="quiet" disabled>
              Undo
            </Button>
            <Button variant="danger" disabled>
              Delete
            </Button>
          </ActionRow>
        </Stack>
        <span
          style={{ color: uiTokens.ink.secondary, fontSize: uiTokens.type.caption }}
          role="status"
          data-feedback
        >
          Choose an action to see immediate feedback.
        </span>
        <Inline as="section" gap="normal" aria-label="Discard draft demo">
          <LayoutItem grow>
            <Stack gap="compact">
              <h2 style={{ margin: 0, fontSize: uiTokens.type.body, fontWeight: 600 }}>
                Start over
              </h2>
              <span style={{ color: uiTokens.ink.secondary, fontSize: uiTokens.type.caption }}>
                Only demonstrates discarding; no real file is deleted.
              </span>
            </Stack>
          </LayoutItem>
          <LayoutItem shrink={false}>
            <Button
              variant="danger"
              data-action="Discarded the draft demo; no real file was deleted."
            >
              Discard local draft
            </Button>
          </LayoutItem>
        </Inline>
      </Stack>
    </Measure>
  ),
  setup({ root, report, onCleanup }) {
    const clicked = (event: Event) => {
      const button = (event.target as Element).closest<HTMLButtonElement>("[data-action]");
      if (button) {
        const message = button.dataset.action ?? "";
        root.querySelector("[data-feedback]")!.textContent = message;
        report(message);
      }
    };
    root.addEventListener("click", clicked);
    onCleanup(() => root.removeEventListener("click", clicked));
  },
});

export const ButtonSizesStory = defineStory({
  id: "button-sizes",
  title: "Button · Sizes and long text",
  group: "Basic controls",
  groupOrder: 10,
  component: "Button",
  variant: "Sizes and long text",
  description:
    "Small, default, and large sizes plus a longer action name to observe wrapping and hit areas on a narrow canvas.",
  covers: ["Button", "IconButton", "small / default / large", "long label"],
  render: () => (
    <div className="workshop-stack workshop-constrained">
      {(["small", "default", "large"] as const).map((size, index) => (
        <Specimen
          label={["Compact toolbar", "Regular actions", "Primary entry"][index]}
          align="start"
        >
          <div className="workshop-row">
            <Button size={size}>Save changes</Button>
            <Button size={size} variant="outline">
              View work outcomes
            </Button>
            <IconButton size={size} label={`${size} search`}>
              <Icon name="search" />
            </IconButton>
            <IconButton size={size} label={`${size} close`} disabled>
              <Icon name="x" />
            </IconButton>
          </div>
        </Specimen>
      ))}
      <Button size="large" variant="quiet">
        View all work outcomes awaiting review in the current project
      </Button>
    </div>
  ),
});

export const FieldsStory = defineStory({
  id: "fields",
  title: "Input · Normal and long labels",
  group: "Form inputs",
  groupOrder: 20,
  component: "Input",
  variant: "Labels and descriptions",
  description:
    "Native input behavior and Field label association; long labels, helper descriptions, and multi-line content are shown together.",
  covers: ["Field", "Input", "Textarea", "Select", "label association", "long text"],
  render: () => {
    const delivery = signal("review");
    return (
      <form className="workshop-stack workshop-constrained" data-project-form novalidate>
        <Field
          label="Project name"
          htmlFor="workshop-project"
          description="Local demo only; nothing is saved to a service."
        >
          <Input id="workshop-project" name="project" value="Meowland" required />
        </Field>
        <Field
          label="Delivery method"
          htmlFor="workshop-delivery"
          description="Review the diff first, then decide whether to submit."
        >
          <Select
            id="workshop-delivery"
            name="delivery"
            aria-describedby="workshop-delivery-description"
            value={delivery}
            required
            onChange={(event) => {
              delivery.value = (event.currentTarget as HTMLSelectElement).value;
            }}
          >
            <option value="draft">Keep draft</option>
            <option value="review">Review the diff first</option>
            <option value="export">Export results</option>
          </Select>
          <div className="workshop-foundation-field-action">
            <span>Not sure which to pick?</span>
            <Button
              variant="quiet"
              size="small"
              onClick={() => {
                delivery.value = "review";
              }}
            >
              Use recommended settings
            </Button>
          </div>
        </Field>
        <Field
          label="Add constraints this work must follow and how you want the results checked when done"
          htmlFor="workshop-notes"
        >
          <Textarea
            id="workshop-notes"
            rows={4}
            placeholder="Write down constraints, or paste longer content…"
          />
        </Field>
        <div className="workshop-row">
          <Button type="submit">Save project</Button>
          <Button type="reset" variant="quiet">
            Restore initial values
          </Button>
        </div>
        <Note id="project-feedback" role="status">
          Change the name and save; leave it empty to see validation feedback.
        </Note>
      </form>
    );
  },
  setup({ root, report, onCleanup }) {
    const form = root.querySelector<HTMLFormElement>("[data-project-form]")!;
    const input = root.querySelector<HTMLInputElement>("#workshop-project")!;
    // This fixture opts into native form reset; value is otherwise a live property.
    input.defaultValue = input.value;
    for (const option of root.querySelectorAll<HTMLOptionElement>("#workshop-delivery option"))
      option.defaultSelected = option.selected;
    const feedback = root.querySelector<HTMLElement>("#project-feedback")!;
    const submit = (event: Event) => {
      event.preventDefault();
      const valid = !!input.value.trim();
      input.setAttribute("aria-invalid", String(!valid));
      input.setCustomValidity(valid ? "" : "Enter a project name");
      input.setAttribute("aria-describedby", "workshop-project-description project-feedback");
      feedback.textContent = valid
        ? `Saved "${input.value.trim()}" (local sample only).`
        : "Enter a project name; spaces alone are not enough.";
      if (!valid) input.focus();
      report(feedback.textContent);
    };
    const reset = () => {
      input.removeAttribute("aria-invalid");
      input.setCustomValidity("");
      feedback.textContent = "Restored the initial values.";
    };
    form.addEventListener("submit", submit);
    form.addEventListener("reset", reset);
    onCleanup(() => {
      form.removeEventListener("submit", submit);
      form.removeEventListener("reset", reset);
    });
  },
});

export const FieldErrorsStory = defineStory({
  id: "field-errors",
  title: "Input · Error and disabled",
  group: "Form inputs",
  groupOrder: 20,
  component: "Input",
  variant: "Error and disabled",
  description:
    "The error description is associated with the control by a real Field; a disabled input stays readable. This sample uses a fixed error state.",
  covers: ["Field error", "aria-invalid", "aria-describedby", "Input disabled", "Textarea error"],
  render: () => (
    <div className="workshop-stack workshop-constrained">
      <Field
        label="Project name"
        htmlFor="workshop-invalid"
        error="Enter a project name; spaces alone are not enough."
      >
        <Input id="workshop-invalid" value="" />
      </Field>
      <Field
        label="Working directory"
        htmlFor="workshop-disabled"
        description="The directory cannot be changed while running."
      >
        <Input id="workshop-disabled" value="/workspace/meowland" disabled />
      </Field>
      <Field
        label="Runtime environment"
        htmlFor="workshop-disabled-select"
        description="Cannot be switched while work is in progress."
      >
        <Select id="workshop-disabled-select" disabled>
          <option>Local workspace</option>
        </Select>
      </Field>
      <Field
        label="Additional notes"
        htmlFor="workshop-invalid-notes"
        error="The description exceeds the length allowed by this sample; shorten it and continue."
      >
        <Textarea id="workshop-invalid-notes" rows={3}>
          A longer description that needs to be added.
        </Textarea>
      </Field>
    </div>
  ),
});

export const BadgesStory = defineStory({
  id: "badges",
  title: "Badge · Category labels and long names",
  group: "Basic controls",
  groupOrder: 10,
  component: "Badge",
  variant: "Category labels and long names",
  description:
    "Shows how Badge actually renders. A badge is a dot-less category label; a state uses Status, the dot-led state badge.",
  covers: [
    "Badge",
    "neutral / accent / success / warning / danger",
    "small / default",
    "long label",
  ],
  render: () => (
    <Specimens>
      <Specimen
        label="Regular badges"
        note="Words name a category, never a state; tone only groups them."
      >
        <Inline gap="compact">
          <Badge tone="neutral">Docs</Badge>
          <Badge tone="accent">New</Badge>
          <Badge tone="success">Stable</Badge>
          <Badge tone="warning">Beta</Badge>
          <Badge tone="danger">Deprecated</Badge>
          <Badge>A longer category name to check on a narrow screen</Badge>
        </Inline>
      </Specimen>
      <Specimen label="Compact badges">
        <Inline gap="compact">
          <Badge size="small">Docs</Badge>
          <Badge size="small" tone="accent">
            New
          </Badge>
          <Badge size="small" tone="success">
            Stable
          </Badge>
          <Badge size="small" tone="warning">
            Beta
          </Badge>
          <Badge size="small" tone="danger">
            Deprecated
          </Badge>
        </Inline>
      </Specimen>
    </Specimens>
  ),
});

export const EmptyStateStory = defineStory({
  id: "empty-state",
  title: "Empty state · Description and next step",
  group: "Overlays and feedback",
  groupOrder: 30,
  component: "EmptyState",
  variant: "Description and next step",
  description:
    "The real empty-state component and its action entry. The button only records the action locally; no real work is created.",
  covers: ["EmptyState", "title / copy / action", "illustration"],
  render: () => (
    <div className="workshop-foundation-empty-grid">
      <section className="workshop-foundation-empty-sample">
        <h2 className="workshop-section-title">No content yet · Offer a next step</h2>
        <EmptyState
          title="No work outcomes yet"
          copy="Tell Assistant what you want to move forward; completed outcomes appear here."
          action={<Button data-empty-start>Start a conversation</Button>}
        />
        <Note data-feedback role="status" />
      </section>
      <section className="workshop-foundation-empty-sample">
        <h2 className="workshop-section-title">All handled · No action needed</h2>
        <EmptyState title="No changes are awaiting review" />
      </section>
      <section className="workshop-foundation-empty-sample">
        <h2 className="workshop-section-title">Custom mark · Caller artwork</h2>
        <EmptyState
          title="Nothing in this folder"
          copy="Choose another place, or add the first file."
          illustration={
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M4 8h6l2 2h8v8H4z"
                fill="none"
                stroke="currentColor"
                stroke-linejoin="round"
              />
            </svg>
          }
        />
      </section>
    </div>
  ),
  setup({ root, report, onCleanup }) {
    const button = root.querySelector<HTMLButtonElement>("[data-empty-start]");
    const click = () => {
      const message =
        "Selected starting a conversation. This component sample does not create a real conversation.";
      root.querySelector("[data-feedback]")!.textContent = message;
      report(message);
    };
    button?.addEventListener("click", click);
    onCleanup(() => button?.removeEventListener("click", click));
  },
});

export const CompactEmptyStateStory = defineStory({
  id: "empty-state-compact",
  title: "Empty state · Local reading and editing area",
  group: "Overlays and feedback",
  groupOrder: 30,
  component: "EmptyState",
  variant: "Local empty state and adjacent controls",
  description:
    "Page-level and local empty states share one structure; local descriptions keep a reading scale, and actions sit next to the corresponding empty area.",
  render: () => (
    <Stack>
      <Field label="Directory filter" htmlFor="compact-empty-filter">
        <Input id="compact-empty-filter" placeholder="Enter a file name" />
      </Field>
      <Grid minColumnWidth="normal">
        <Card>
          <EmptyState
            size="compact"
            title="Select a file"
            copy="Select from the file list on the left to view full content and a local editing draft here."
          />
        </Card>
        <Card>
          <EmptyState
            size="compact"
            title="No file changes"
            copy="There are no displayable changes in the working directory or the staging area. You can still view history; long paths do not change the reading scope of the empty state."
            action={<Button variant="outline">View history</Button>}
          />
        </Card>
      </Grid>
      <EmptyState
        title="The workspace is still empty"
        copy="Open an existing directory or create the first file."
        action={<Button>Create file</Button>}
      />
    </Stack>
  ),
});

export const DialogStory = defineStory({
  id: "dialog",
  title: "Dialog · Keyboard and focus return",
  group: "Overlays and feedback",
  groupOrder: 30,
  component: "Dialog",
  variant: "Confirmation and return",
  description:
    "Uses a real dialog.showModal. Focus moves into the dialog when it opens, Escape or cancel closes it, and focus returns to the open button.",
  covers: ["Dialog", "DialogPanel / Header / Actions", "showModal", "Escape", "focus return"],
  render: () => (
    <div className="workshop-stack workshop-constrained">
      <Section
        title="One confirmation before finishing"
        description="Use Escape or cancel to return; the dangerous action keeps explicit text."
      />
      <Button data-open-dialog>Open confirmation dialog</Button>
      <Note data-feedback role="status">
        The current work is still in progress.
      </Note>
      <Dialog labelledBy="workshop-dialog-title" describedBy="workshop-dialog-description">
        <DialogPanel
          header={
            <DialogHeader
              title="End the current work?"
              titleId="workshop-dialog-title"
              description="This is a local demo and does not affect real tasks. You can cancel and keep reviewing components."
              descriptionId="workshop-dialog-description"
            />
          }
        >
          <DialogActions>
            <Button variant="quiet" data-close-dialog="cancel" autofocus>
              Cancel
            </Button>
            <Button variant="danger" data-close-dialog="confirm">
              End work
            </Button>
          </DialogActions>
        </DialogPanel>
      </Dialog>
    </div>
  ),
  setup({ root, report, onCleanup }) {
    const trigger = root.querySelector<HTMLButtonElement>("[data-open-dialog]");
    const dialog = root.querySelector<HTMLDialogElement>("dialog");
    if (!trigger || !dialog) return;
    const open = () => {
      dialog.returnValue = "";
      dialog.showModal();
      report("Dialog opened");
    };
    const click = (event: Event) => {
      const target = (event.target as Element).closest<HTMLElement>("[data-close-dialog]");
      if (target) dialog.close(target.dataset.closeDialog);
    };
    const close = () => {
      trigger.focus();
      const message =
        dialog.returnValue === "confirm"
          ? "The local sample ended. Reset the sample to start again."
          : "Returned; the current work continues.";
      root.querySelector("[data-feedback]")!.textContent = message;
      report(message);
    };
    trigger.addEventListener("click", open);
    dialog.addEventListener("click", click);
    dialog.addEventListener("close", close);
    onCleanup(() => {
      trigger.removeEventListener("click", open);
      dialog.removeEventListener("click", click);
      dialog.removeEventListener("close", close);
      if (dialog.open) dialog.close();
    });
  },
});
