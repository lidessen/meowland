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
  Tooltip,
  Button,
  Stack,
  Inline,
  Container,
} from "meowtail";

export const FieldGroups = defineStory({
  id: "field-group",
  title: "Field group · Legend and whole-group disabled",
  component: "FieldGroup",
  variant: "Field relationships",
  group: "Form inputs",
  groupOrder: 20,
  description:
    "Uses native fieldset/legend for fields in one group; when the group is unavailable, inputs and selects follow form semantics together.",
  covers: ["FieldGroup", "Field", "fieldset", "disabled"],
  render: () => (
    <Container width="narrow">
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
    </Container>
  ),
});
export const MediaRatio = defineStory({
  id: "aspect-ratio",
  title: "Media ratio · Landscape and square",
  component: "AspectRatio",
  variant: "Fit to container",
  group: "Navigation and layout",
  groupOrder: 40,
  description:
    "The ratio controls the media placeholder and images choose their own cropping; the width follows the parent container.",
  render: () => (
    <Container>
      <Stack gap="relaxed">
        {[16 / 9, 1].map((ratio) => (
          <AspectRatio ratio={ratio} style={{ maxWidth: ratio === 1 ? "240px" : "100%" }}>
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "grid",
                placeItems: "center",
                background: `${uiTokens.surfaceMuted}`,
                borderRadius: `${uiTokens.controlRadius}`,
                color: `${uiTokens.mutedForeground}`,
              }}
            >
              {ratio === 1 ? "1 : 1 · Project cover" : "16 : 9 · Demo preview"}
            </div>
          </AspectRatio>
        ))}
      </Stack>
    </Container>
  ),
});
export const Separators = defineStory({
  id: "separator",
  title: "Separator · Content and tool groups",
  component: "Separator",
  variant: "Horizontal and vertical",
  group: "Navigation and layout",
  groupOrder: 40,
  description: "A separator expresses a content boundary and adds no focusable action by default.",
  render: () => (
    <Container width="narrow">
      <Stack gap="relaxed">
        <strong>Work record</strong>
        <p>Changes and follow-up actions are grouped separately.</p>
        <Separator />
        <Inline>
          <Button variant="quiet">View changes</Button>
          <Separator orientation="vertical" style={{ height: "20px" }} />
          <Button variant="quiet">Copy link</Button>
        </Inline>
      </Stack>
    </Container>
  ),
});
export const Tooltips = defineStory({
  id: "tooltip",
  title: "Tooltip · Hover and keyboard focus",
  component: "Tooltip",
  variant: "Description and dismissal",
  group: "Overlays and feedback",
  groupOrder: 30,
  description:
    "Hovering briefly adds a description and keyboard focus shows it immediately; Escape closes it and keeps focus. Necessary information always stays on the page.",
  render: () => (
    <Container width="narrow">
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
    </Container>
  ),
});
