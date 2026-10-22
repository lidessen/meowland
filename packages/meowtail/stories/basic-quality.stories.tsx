import { h, signal } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Button,
  ChatComposer,
  Checkbox,
  ChoiceSelect,
  Icon,
  IconButton,
  Inline,
  Input,
  NumberInput,
  SearchInput,
  SegmentedControl,
  Select,
  Switch,
} from "meowtail";

/**
 * Canonical control scene for the basic-quality audit: one-line text, icon/text
 * centers, symmetric block padding and the inline composer, in one place.
 * Stories are galleries; this is not a product page.
 */
export const BasicQualityControlsStory = defineStory({
  id: "basic-quality-controls",
  title: "Basic quality · Control centers and symmetry",
  group: "Composition examples",
  groupOrder: 90,
  component: "Input",
  variant: "Single-line controls and actions",
  description:
    "Checks the vertical center and top/bottom symmetry of single-line inputs, selects, button icons/text, and the inline composer on one screen; shared by visual review and geometry regressions.",
  covers: [
    "single-line field padding symmetry",
    "button text/icon center",
    "IconButton center",
    "ChoiceSelect trigger center",
    "inline composer center",
    "mixed single-line row height",
  ],
  render() {
    const choice = signal("current");
    const rowChoice = signal("current");
    const view = signal("list");
    return (
      <div className="workshop-stack" data-basic-quality-scene>
        <section className="workshop-stack">
          <h2 className="workshop-section-title">Single-line inputs and selects</h2>
          <Input aria-label="Project name" value="Workspace" data-batch1="input" />
          <Input
            aria-label="Project name placeholder"
            placeholder="Project name"
            data-batch1="input-placeholder"
          />
          <Select aria-label="Current workspace" value="current" data-batch1="select">
            <option value="current">Current workspace</option>
            <option value="new">New workspace</option>
          </Select>
          <ChoiceSelect
            id="basic-quality-choice"
            aria-label="Select model"
            value={choice}
            onValueChange={(value) => {
              choice.value = value;
            }}
            data-batch1="choice-select"
            options={[
              { value: "current", label: "DeepSeek-V4-Pro" },
              { value: "fast", label: "DeepSeek-V4-Fast" },
            ]}
          />
        </section>

        <section className="workshop-stack">
          <h2 className="workshop-section-title">One row of every single-line control</h2>
          {/* Top-aligned on purpose: the row only lines up if every height agrees. */}
          <Inline gap="compact" align="start" data-mixed-row>
            <Input aria-label="Filter name" placeholder="Name" />
            <SearchInput label="Search files" placeholder="Search" />
            <Select aria-label="Status">
              <option>Any status</option>
            </Select>
            <ChoiceSelect
              id="basic-quality-row-choice"
              aria-label="Owner"
              value={rowChoice}
              onValueChange={(value) => {
                rowChoice.value = value;
              }}
              options={[
                { value: "current", label: "Anyone" },
                { value: "me", label: "Me" },
              ]}
            />
            <NumberInput defaultValue={10} aria-label="Limit" />
            <SegmentedControl
              id="basic-quality-row-view"
              label="View"
              value={view}
              onValueChange={(value) => {
                view.value = value;
              }}
              options={[
                { value: "list", label: "List" },
                { value: "grid", label: "Grid" },
              ]}
            />
            <Button variant="outline">Reset</Button>
            <Button>Apply</Button>
            <IconButton label="Refresh">
              <Icon name="refresh-cw" />
            </IconButton>
          </Inline>
        </section>

        <section className="workshop-stack">
          <h2 className="workshop-section-title">Actions</h2>
          <div className="workshop-row">
            <Button data-batch1="button-text">Save changes</Button>
            <Button data-batch1="button-icon-text">
              <Icon name="search" />
              Search
            </Button>
            <IconButton label="Search" data-batch1="icon-button">
              <Icon name="search" />
            </IconButton>
          </div>
        </section>

        <section className="workshop-stack">
          <h2 className="workshop-section-title">Switches and checkboxes</h2>
          <div className="workshop-row">
            <Checkbox label="Keep draft" defaultChecked data-batch1="checkbox" />
            <Switch label="Notify when complete" data-batch1="switch" />
          </div>
        </section>

        <section className="workshop-stack">
          <h2 className="workshop-section-title">Inline input</h2>
          <div style={{ width: "100%" }}>
            <ChatComposer
              layout="inline"
              placeholder="Write a message…"
              inputLabel="Message"
              submitLabel="Send"
              onSubmit={(event) => event.preventDefault()}
              data-batch1="composer"
            />
          </div>
        </section>
      </div>
    );
  },
});
