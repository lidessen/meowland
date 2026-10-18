import { h } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Button,
  Container,
  DescriptionItem,
  DescriptionList,
  Inline,
  Input,
  LayoutItem,
  Stack,
} from "meowtail";

const copy = {
  purpose:
    "Labels and values in one group share a natural column; when local space is tight they stack vertically, and values can still combine reading and actions.",
  version: "Version",
  versionValue: "2026.10.15",
  identity: "Full working directory reference identity",
  identityValue: "workspace:development-documentation-service-with-a-long-unbroken-identity",
  action: "Check reference",
  draft: "Note draft",
  narrow: "Narrow region in the same viewport",
};

export const DescriptionListStory = defineStory({
  id: "description-list-composition",
  title: "Information layout · Natural label column and local composition",
  group: "Navigation and layout",
  groupOrder: 40,
  component: "DescriptionList",
  description:
    "Shows only the public information layout; labels, long identity and actions are fixed examples and read no business data.",
  covers: [
    "native description list",
    "shared label column",
    "local container width",
    "long value",
    "nested layout",
    "draft continuity",
  ],
  render: () => (
    <Container width="content">
      <Stack gap="relaxed">
        <span>{copy.purpose}</span>
        <DescriptionList aria-label="Work information" data-description-wide>
          <DescriptionItem term={copy.version}>{copy.versionValue}</DescriptionItem>
          <DescriptionItem term={copy.identity}>
            <Inline wrap={false} gap="compact" align="start">
              <LayoutItem grow>
                <code>{copy.identityValue}</code>
              </LayoutItem>
              <LayoutItem shrink={false}>
                <Button variant="outline" size="small">
                  {copy.action}
                </Button>
              </LayoutItem>
            </Inline>
          </DescriptionItem>
          <DescriptionItem term={<label htmlFor="description-draft">{copy.draft}</label>}>
            <Input id="description-draft" placeholder="Type to adjust the local width" />
          </DescriptionItem>
        </DescriptionList>
        <div style={{ width: "100%", maxWidth: "20rem" }} data-description-narrow>
          <Stack gap="compact">
            <strong>{copy.narrow}</strong>
            <DescriptionList aria-label="Narrow region information">
              <DescriptionItem term={copy.version}>{copy.versionValue}</DescriptionItem>
              <DescriptionItem term={copy.identity}>
                <code>{copy.identityValue}</code>
              </DescriptionItem>
            </DescriptionList>
          </Stack>
        </div>
      </Stack>
    </Container>
  ),
});
