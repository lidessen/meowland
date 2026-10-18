import { h } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Container,
  Field,
  Inline,
  Input,
  Stack,
} from "meowtail";

export const CardResponsiveHeaderStory = defineStory({
  id: "card-responsive-header",
  title: "Card · Title, actions, and real container width",
  group: "Basic controls",
  groupOrder: 10,
  component: "CardHeader",
  description:
    "A wide card and a narrow sidebar in the same window share the title layout; nested cards, intrinsic button cards, and optional descriptions keep their native structure.",
  covers: ["narrow card", "sidebar", "intrinsic card", "action first", "optional description"],
  render: () => (
    <Container width="wide">
      <Stack gap="relaxed">
        <Card data-card-responsive="wide">
          <CardHeader>
            <CardTitle>
              Workspace settings and access rules to verify — A long workspace configuration title
            </CardTitle>
            <CardDescription>
              Changes keep existing content; save after the review is complete.
            </CardDescription>
            <CardAction>
              <Button>View full configuration</Button>
              <Button variant="quiet">Copy configuration link</Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Card data-card-responsive="nested">
              <CardHeader>
                <CardTitle>Default nested check item</CardTitle>
                <CardDescription>
                  Embedded relationships still share the parent surface.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Field label="Kept draft" htmlFor="card-responsive-draft">
                  <Input id="card-responsive-draft" />
                </Field>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
        <div style={{ width: "300px", maxWidth: "100%" }}>
          <Card data-card-responsive="sidebar">
            <CardHeader>
              <CardAction>
                <Button>View details</Button>
                <Button variant="quiet">Copy link</Button>
              </CardAction>
              <CardTitle>A long sidebar card title with meaningful information</CardTitle>
              <CardDescription>
                A narrow region in the same wide window; actions precede the title in the DOM.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        <Inline align="start">
          <Card as="button" data-card-responsive="button">
            <CardHeader>
              <CardTitle>Header-only button card</CardTitle>
              <CardDescription>Content decides the natural width.</CardDescription>
            </CardHeader>
          </Card>
          <Card data-card-responsive="intrinsic">
            <CardHeader>
              <CardTitle>Intrinsic inline card</CardTitle>
              <CardDescription>No hand-written width.</CardDescription>
            </CardHeader>
          </Card>
        </Inline>
        <Card data-card-responsive="title-only">
          <CardHeader>
            <CardTitle>No empty description row when there is only a title</CardTitle>
            <CardAction>
              <Button>Check results</Button>
            </CardAction>
          </CardHeader>
        </Card>
      </Stack>
    </Container>
  ),
});
