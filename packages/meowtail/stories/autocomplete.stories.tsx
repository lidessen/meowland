import { h } from "meowjsx";
import { mapSignal, signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { Autocomplete, Field, type AutocompleteSuggestion } from "meowtail";
import { Measure, Note, Specimen, Specimens } from "./specimen";

const paths: readonly AutocompleteSuggestion[] = [
  { value: "src/components/", description: "Directory" },
  { value: "src/components/button.tsx", description: "TypeScript" },
  { value: "src/components/autocomplete.tsx", description: "TypeScript" },
  { value: "src/theme/tokens.ts", description: "TypeScript" },
  { value: "stories/specimen.tsx", description: "TypeScript" },
  { value: "README.md", description: "Markdown" },
];

const variables = ["API_URL", "API_TOKEN", "LOG_LEVEL", "PORT", "WORKSPACE_ROOT"];

export const AutocompleteStory = defineStory({
  id: "autocomplete",
  title: "Autocomplete · Suggestions for free text",
  group: "Forms and selection",
  groupOrder: 40,
  component: "Autocomplete",
  description:
    "A text field that offers host suggestions without constraining the text: arrow keys move through them, Enter accepts one, and any other text stays valid. The host filters and loads suggestions.",
  covers: ["Autocomplete suggestions", "Autocomplete loading", "Autocomplete empty", "free text"],
  render: () => {
    const path = signal("");
    const accepted = signal("");
    const pathSuggestions = mapSignal(path, (text) =>
      text.trim() === ""
        ? []
        : paths.filter((item) => item.value.toLowerCase().includes(text.trim().toLowerCase())),
    );

    const variable = signal("");
    const loading = signal(false);
    const found = signal<readonly AutocompleteSuggestion[]>([]);
    let timer: ReturnType<typeof setTimeout> | undefined;

    return (
      <Specimens>
        <Specimen label="Host-filtered suggestions" note="Type “src” or “ts”.">
          <Measure width="narrow">
            <Field label="Path" description="Any path is valid; suggestions are a shortcut.">
              <Autocomplete
                name="path"
                placeholder="src/…"
                value={path}
                onValueChange={(next) => {
                  path.value = next;
                }}
                suggestions={pathSuggestions}
                onAccept={(item) => {
                  accepted.value = item.value;
                }}
              />
            </Field>
            <Note role="status">
              {mapSignal(accepted, (value) => (value ? `Accepted ${value}.` : "Nothing accepted."))}
            </Note>
          </Measure>
        </Specimen>
        <Specimen label="Loaded suggestions" note="The host looks names up after a short delay.">
          <Measure width="narrow">
            <Field label="Environment variable">
              <Autocomplete
                value={variable}
                onValueChange={(next) => {
                  variable.value = next;
                  loading.value = true;
                  clearTimeout(timer);
                  timer = setTimeout(() => {
                    const query = next.trim().toUpperCase();
                    found.value = query
                      ? variables
                          .filter((name) => name.includes(query))
                          .map((name) => ({ value: name }))
                      : [];
                    loading.value = false;
                  }, 400);
                }}
                suggestions={found}
                loading={loading}
                emptyMessage="No matching variables"
              />
            </Field>
          </Measure>
        </Specimen>
        <Specimen label="Disabled">
          <Measure width="narrow">
            <Field label="Locked path">
              <Autocomplete defaultValue="src/" suggestions={[]} disabled />
            </Field>
          </Measure>
        </Specimen>
      </Specimens>
    );
  },
});
