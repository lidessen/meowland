import { h } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Button,
  ChoiceSelect,
  Icon,
  IconButton,
  Input,
  Link,
  Select,
  Stack,
  Toolbar,
} from "meowtail";
import { Specimen, Note } from "./specimen";

export const IconButtonStory = defineStory({
  id: "icon-button",
  title: "Icon button · Compact actions",
  group: "Basic controls",
  groupOrder: 10,
  component: "IconButton",
  variant: "Actions and accessible names",
  description:
    "Icon buttons keep an explicit accessible name; by default they carry one compact action and do not stuff text into an icon.",
  covers: ["IconButton", "label", "small / default", "disabled"],
  render: () => (
    <Stack gap="relaxed" className="workshop-constrained">
      <Toolbar label="Attachment and view actions">
        <IconButton size="small" label="Add attachment">
          <Icon name="paperclip" />
        </IconButton>
        <IconButton size="small" label="Search">
          <Icon name="search" />
        </IconButton>
        <IconButton label="Open details">
          <Icon name="arrow-up-right" />
        </IconButton>
        <IconButton label="Unavailable action" disabled>
          <Icon name="wrench" />
        </IconButton>
      </Toolbar>
      <Note>
        Pointer users see an icon; screen reader and keyboard users get an explicit action name.
      </Note>
    </Stack>
  ),
});

export const ToolbarStory = defineStory({
  id: "toolbar",
  title: "Toolbar · Related actions",
  group: "Navigation and layout",
  groupOrder: 40,
  component: "Toolbar",
  variant: "Horizontal, vertical and mixed controls",
  description:
    "Actions move with the arrow keys; inputs and selects keep their own keyboard rules, and the toolbar wraps naturally when space runs out.",
  covers: ["Toolbar", "role=toolbar", "horizontal", "vertical", "mixed controls", "roving actions"],
  render: () => (
    <Stack gap="relaxed" className="workshop-constrained">
      <Specimen label="Preview actions" align="start">
        <Toolbar label="Preview actions">
          <Button size="small">Desktop</Button>
          <Button variant="quiet" size="small">
            Mobile
          </Button>
          <IconButton size="small" label="Reset preview">
            <Icon name="refresh-cw" />
          </IconButton>
        </Toolbar>
      </Specimen>
      <Specimen label="Filter and preview" align="start">
        <Toolbar label="Filter and preview">
          <Button size="small">Update preview</Button>
          <Input
            aria-label="Filter preview"
            placeholder="Enter filter text"
            style={{ width: "18ch" }}
          />
          <Select aria-label="Preview annotations" style={{ width: "auto" }}>
            <option value="off" selected>
              Annotations off
            </option>
            <option value="controls">Control sizes</option>
            <option value="spacing">Spacing layout</option>
          </Select>
          <ChoiceSelect
            id="toolbar-appearance"
            aria-label="Preview appearance"
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
            defaultValue="light"
          />
          <Button variant="quiet" size="small">
            Restore default preview
          </Button>
          <Link href="#toolbar-help">View toolbar notes</Link>
        </Toolbar>
        <Note id="toolbar-help">
          Actions share one Tab stop; editing controls remain independently reachable.
        </Note>
      </Specimen>
      <Specimen label="Standalone action group" align="start">
        <Toolbar label="Editing and canvas">
          <Button size="small">Save layout</Button>
          <Button size="small" tabIndex={-1}>
            Programmatic entry point
          </Button>
          <Toolbar label="Canvas zoom">
            <IconButton size="small" label="Zoom out preview">
              <Icon name="minus" />
            </IconButton>
            <IconButton size="small" label="Zoom in preview">
              <Icon name="plus" />
            </IconButton>
          </Toolbar>
          <Button size="small">Cancel editing</Button>
        </Toolbar>
      </Specimen>
      <Specimen label="Vertical toolbar" align="start">
        <Toolbar label="Canvas actions" orientation="vertical">
          <IconButton size="small" label="Zoom out canvas">
            <Icon name="minus" />
          </IconButton>
          <IconButton size="small" label="Zoom in canvas">
            <Icon name="plus" />
          </IconButton>
        </Toolbar>
      </Specimen>
    </Stack>
  ),
});
