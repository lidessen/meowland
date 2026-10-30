import { uiTokens } from "meowtail/theme";
import { h } from "meowjsx";
import { defineStory } from "meowbook";
import {
  FieldGroup,
  Field,
  Input,
  Select,
  AspectRatio,
  Separator,
  Text,
  Tooltip,
  Button,
  Stack,
  Inline,
} from "meowtail";
import { Measure, Specimen, Specimens } from "./specimen";

export const FieldGroups = defineStory({
  id: "field-group",
  title: "Field Group · Legend and whole-group disabled",
  group: "Forms and selection",
  groupOrder: 40,
  component: "FieldGroup",
  variant: "Field relationships",
  description:
    "Uses native fieldset/legend for fields in one group; when the group is unavailable, inputs and selects follow form semantics together.",
  covers: ["FieldGroup", "Field", "fieldset", "disabled"],
  render: () => (
    <Measure width="narrow">
      <form>
        <Stack gap="relaxed">
          <FieldGroup
            legend="Project notifications"
            description="Choose how to receive alerts when work completes."
            descriptionId="notification-help"
          >
            <Field label="Delivery address" htmlFor="notification-email">
              <Input id="notification-email" type="email" placeholder="you@example.com" />
            </Field>
            <Field label="Alert frequency" htmlFor="notification-frequency">
              <Select id="notification-frequency">
                <option>Only when attention is needed</option>
                <option>Every time work completes</option>
              </Select>
            </Field>
          </FieldGroup>
          <Separator />
          <FieldGroup
            legend="Organization-managed settings"
            description="The organization manages this group; it cannot be changed now."
            disabled
          >
            <Field label="Organization name" htmlFor="managed-name">
              <Input id="managed-name" value="Meowland" />
            </Field>
            <Field label="Visibility" htmlFor="managed-visibility">
              <Select id="managed-visibility">
                <option>Project members only</option>
              </Select>
            </Field>
          </FieldGroup>
        </Stack>
      </form>
    </Measure>
  ),
});
export const MediaRatio = defineStory({
  id: "aspect-ratio",
  title: "Aspect Ratio · Landscape and square",
  group: "Pages and layout",
  groupOrder: 10,
  component: "AspectRatio",
  variant: "Fit to container",
  description:
    "The ratio controls the media placeholder and images choose their own cropping; the width follows the parent container.",
  render: () => (
    <Measure>
      <Stack gap="relaxed">
        {[16 / 9, 1].map((ratio) => (
          <AspectRatio ratio={ratio} style={{ maxWidth: ratio === 1 ? "240px" : "100%" }}>
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "grid",
                placeItems: "center",
                background: `${uiTokens.surface.fill}`,
                borderRadius: `${uiTokens.radius.lg}`,
                color: `${uiTokens.ink.secondary}`,
              }}
            >
              {ratio === 1 ? "1 : 1 · Project cover" : "16 : 9 · Demo preview"}
            </div>
          </AspectRatio>
        ))}
      </Stack>
    </Measure>
  ),
});
export const Separators = defineStory({
  id: "separator",
  title: "Separator · Content and tool groups",
  group: "Pages and layout",
  groupOrder: 10,
  component: "Separator",
  variant: "Horizontal and vertical",
  description: "A separator expresses a content boundary and adds no focusable action by default.",
  render: () => (
    <Specimens>
      <Specimen label="Between content groups" width="narrow">
        <Stack gap="compact">
          <Text>
            <strong>Work record</strong>
          </Text>
          <Text variant="secondary">Changes and follow-up actions are grouped separately.</Text>
        </Stack>
        <Separator />
        <Text variant="secondary">Follow-up actions start below the rule.</Text>
      </Specimen>
      <Specimen label="Between tools" align="start">
        <Inline gap="compact" align="center" wrap={false}>
          <Button variant="quiet">View changes</Button>
          <Separator orientation="vertical" style={{ height: "20px" }} />
          <Button variant="quiet">Copy link</Button>
        </Inline>
      </Specimen>
    </Specimens>
  ),
});
export const Tooltips = defineStory({
  id: "tooltip",
  title: "Tooltip · Hover and keyboard focus",
  group: "Overlays and disclosure",
  groupOrder: 50,
  component: "Tooltip",
  variant: "Description and dismissal",
  description:
    "Hovering briefly adds a description and keyboard focus shows it immediately; Escape closes it and keeps focus. Necessary information always stays on the page.",
  render: () => (
    <Measure width="narrow">
      <Stack gap="relaxed" align="start">
        <p>The standalone preview keeps the current work page.</p>
        <Tooltip
          id="preview-help"
          content="View the current component in a standalone window to compare different sizes."
          trigger={(props) => (
            <Button {...props} variant="outline">
              Standalone preview
            </Button>
          )}
        />
        <Input aria-label="Next item" placeholder="Tabbing here closes the tooltip" />
      </Stack>
    </Measure>
  ),
});
