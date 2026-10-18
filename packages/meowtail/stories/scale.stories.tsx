import { h } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  ChatQuestion,
  ChoiceGroup,
  ChoiceSelect,
  Container,
  Field,
  Inline,
  Input,
  Select,
  Stack,
} from "meowtail";

export const ScaleStory = defineStory({
  id: "scale-reference",
  title: "Default scale · Controls and composition",
  group: "Composition examples",
  component: "Stack",
  description:
    "Check the proportions of text, controls, options, and containers on one screen. Default styles come straight from the component theme; nothing is enlarged or shrunk just for the demo.",
  covers: [
    "body and controls",
    "group/section/panel spacing",
    "nested composition",
    "long option",
    "narrow layout",
  ],
  render: () => (
    <Container width="content">
      <Stack gap="relaxed">
        <Stack gap="compact">
          <strong>Start with the basic controls, then check the composed scale</strong>
          <span>
            Related content stays close while separate regions get space. Text wraps when long and
            buttons stay recognizable.
          </span>
          <Inline gap="compact">
            <Input aria-label="Project name" placeholder="Project name" />
            <Button>Save</Button>
            <Button variant="quiet">Cancel</Button>
          </Inline>
          <Inline gap="compact">
            <Select aria-label="Native select" value="current">
              <option value="current">Current workspace</option>
              <option value="new">New workspace</option>
            </Select>
            <ChoiceSelect
              id="scale-select"
              aria-label="Custom select"
              defaultValue="current"
              options={[
                { value: "current", label: "Current workspace" },
                { value: "new", label: "New workspace" },
              ]}
            />
          </Inline>
        </Stack>
        <Card>
          <CardHeader>
            <CardTitle>Workspace settings</CardTitle>
            <CardDescription>
              Inside a separate container, fields and actions keep the same control scale.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Field label="Display name" htmlFor="scale-name">
              <Input id="scale-name" value="My workspace" />
            </Field>
          </CardContent>
          <CardFooter>
            <Button>Save settings</Button>
            <Button variant="quiet">Restore defaults</Button>
          </CardFooter>
        </Card>
        <ChatQuestion
          question="How should this question be handled next?"
          questionId="scale-question"
          actions={[
            <Button>Submit answer</Button>,
            <Button variant="quiet">Answer in text</Button>,
            <Button variant="quiet">Cancel question</Button>,
          ]}
        >
          <ChoiceGroup
            id="scale-choice"
            label="How to proceed"
            hideLabel
            options={[
              { value: "continue", label: "Keep investigating and preserve the existing work" },
              {
                value: "review",
                label:
                  "Review the existing results first, then decide whether to continue with the unfinished parts",
              },
            ]}
          />
        </ChatQuestion>
      </Stack>
    </Container>
  ),
});
