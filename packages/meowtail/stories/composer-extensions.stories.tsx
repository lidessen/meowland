import { h } from "meowjsx";
import { derived, signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import {
  Badge,
  ChoiceSelect,
  ComposerPanel,
  IconButton,
  Icon,
  MenuButton,
  Stack,
  StatusDot,
  type ComposerSuggestion,
  type ComposerTrigger,
} from "meowtail";
import { Measure } from "./specimen";

const tasks = [
  { id: "t-101", label: "Redesign the task workbench", state: "processing" as const },
  { id: "t-104", label: "Daemon restarts lose the binding", state: "warning" as const },
  { id: "t-105", label: "Paginate the task list", state: "success" as const },
  { id: "t-106", label: "Add reconnect backoff", state: "idle" as const },
];
const files = ["src/", "src/chat/", "src/chat/composer.tsx", "src/components/", "README.md"];
const models = [
  { value: "fast", label: "Fast", description: "Short answers, lowest latency" },
  { value: "balanced", label: "Balanced", description: "The default for most work" },
  { value: "deep", label: "Deep", description: "Long reasoning, slower" },
];
const projects = ["Global", "meowland", "workcells", "rossovia"].map((name) => ({
  value: name,
  label: name,
}));

export const ComposerExtensionsStory = defineStory({
  id: "composer-extensions",
  title: "Chat Composer · Mentions, commands and choices",
  group: "Agent and conversation",
  groupOrder: 90,
  component: "ChatComposer",
  variant: "Triggers, keyboard submit and draft choices",
  description:
    "Triggers turn @, / and # into host suggestions with one keyboard order; choices the whole draft is sent with sit beside Send. The host keeps the text, the references and every value.",
  covers: [
    "ChatComposer triggers",
    "ChatComposer submitOn",
    "ChoiceSelect description",
    "ChoiceSelect live disabled",
  ],
  render: () => {
    const draft = signal("");
    const refs = signal<readonly string[]>([]);
    const model = signal("balanced");
    const project = signal("meowland");
    const pending = signal(false);
    const log = signal("Nothing sent yet.");
    const mention: ComposerTrigger = {
      char: "@",
      label: "Tasks",
      emptyMessage: "No matching task",
      suggest: (query) =>
        tasks
          .filter((task) => !refs.value.includes(task.id))
          .filter((task) => `${task.id} ${task.label}`.toLowerCase().includes(query.toLowerCase()))
          .map((task) => ({
            id: task.id,
            label: task.label,
            meta: task.id,
            leading: <StatusDot state={task.state} />,
          })),
      onAccept: (suggestion) => {
        refs.value = [...refs.value, suggestion.id];
      },
    };
    const commands: ComposerTrigger = {
      char: "/",
      position: "start",
      label: "Commands",
      disabled: pending,
      suggest: (query) =>
        [
          {
            id: "clear",
            label: "Clear the draft",
            description: "Remove text and references",
            insert: "",
          },
          {
            id: "deep",
            label: "Use the deep model",
            description: "Applies to this draft",
            insert: "",
          },
          {
            id: "plan",
            label: "Plan first",
            description: "Inserts a planning request",
            insert: "Plan first:",
          },
        ].filter((command) => command.id.startsWith(query.toLowerCase())),
      onAccept: (suggestion) => {
        if (suggestion.id === "clear") {
          draft.value = "";
          refs.value = [];
        }
        if (suggestion.id === "deep") model.value = "deep";
      },
    };
    const paths: ComposerTrigger = {
      char: "#",
      label: "Files",
      emptyMessage: "No matching file",
      // An asynchronous lookup: late answers for an older query are dropped.
      suggest: (query, { signal: aborted }) =>
        new Promise<readonly ComposerSuggestion[]>((resolve) => {
          const timer = setTimeout(
            () =>
              resolve(
                files
                  .filter((file) => file.startsWith(query))
                  .map((file) => ({
                    id: file,
                    label: file,
                    insert: `#${file}`,
                    trailingSpace: !file.endsWith("/"),
                  })),
              ),
            250,
          );
          aborted.addEventListener("abort", () => clearTimeout(timer));
        }),
    };
    // References whose token left the text are dropped, so chips follow the draft.
    const visibleRefs = derived(() => refs.value.filter((id) => draft.value.includes(`@${id}`)));
    return (
      <Measure width="content">
        <Stack gap="relaxed">
          <ComposerPanel
            value={draft}
            onValueChange={(text: string) => {
              draft.value = text;
            }}
            inputLabel="Task draft"
            placeholder="Describe the work. @ a task, / a command, # a file."
            hint="Enter to send · Shift+Enter for a new line"
            hintId="composer-extensions-hint"
            submitLabel="Send draft"
            submitOn="enter"
            submitDisabled={derived(() => pending.value || !draft.value.trim())}
            suggestionPlacement="bottom"
            triggers={[mention, commands, paths]}
            attachments={derived(() =>
              visibleRefs.value.length ? (
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {visibleRefs.value.map((id) => (
                    <Badge>@{id}</Badge>
                  ))}
                </div>
              ) : null,
            )}
            trailing={[
              <ChoiceSelect
                aria-label="Project"
                options={projects}
                value={project}
                onValueChange={(value: string) => {
                  project.value = value;
                }}
                searchable
                disabled={pending}
                placement="bottom"
                matchTriggerWidth={false}
              />,
              <ChoiceSelect
                aria-label="Model"
                options={models}
                value={model}
                onValueChange={(value: string) => {
                  model.value = value;
                }}
                disabled={pending}
                placement="bottom"
                matchTriggerWidth={false}
              />,
              <MenuButton
                variant="quiet"
                size="small"
                align="end"
                aria-label="More send options"
                items={[
                  {
                    id: "draft",
                    label: "Save as draft",
                    onSelect: () => (log.value = "Saved as draft."),
                  },
                ]}
              >
                {""}
              </MenuButton>,
            ]}
            onSubmit={(event: SubmitEvent) => {
              event.preventDefault();
              pending.value = true;
              log.value = `Sent to ${project.value} with ${model.value}: ${draft.value.trim()} (references: ${visibleRefs.value.join(", ") || "none"})`;
              setTimeout(() => {
                draft.value = "";
                refs.value = [];
                pending.value = false;
              }, 400);
            }}
          >
            <IconButton label="Attach">
              <Icon name="paperclip" />
            </IconButton>
          </ComposerPanel>
          <p id="composer-extensions-log" role="status">
            {log}
          </p>
        </Stack>
      </Measure>
    );
  },
});
