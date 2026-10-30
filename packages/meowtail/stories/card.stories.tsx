import { h } from "meowjsx/runtime";
import { defineStory } from "meowbook";
import {
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Icon,
  IconButton,
  Stack,
  Status,
} from "meowtail";
import { Measure, Note } from "./specimen";

export const CardCompositionStory = defineStory({
  id: "card-composition",
  title: "Card · Project and embedded checks",
  group: "Records and surfaces",
  groupOrder: 60,
  component: "Card",
  variant: "Nesting and content regions",
  description:
    "One project record whose internal checks share a reading surface; standalone items can use their own surface. Actions only echo locally.",
  covers: [
    "Card surface/embedded",
    "CardHeader/Title/Description/Action",
    "CardContent/Footer",
    "nested card",
    "long title",
  ],
  render: () => (
    <Measure>
      <Stack gap="relaxed" data-card-example>
        <Card as="article" aria-labelledby="card-project-title">
          <CardHeader>
            <CardTitle id="card-project-title">Component checks before release</CardTitle>
            <CardDescription>
              Meowland · This check keeps two changes that need your confirmation.
            </CardDescription>
            <CardAction>
              <IconButton
                label="View project record"
                data-card-action="Selected this project record"
              >
                <Icon name="eye" />
              </IconButton>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Card as="section" aria-labelledby="card-reading-title">
              <CardHeader>
                <CardTitle as="h3" id="card-reading-title">
                  Message reading and long code previews
                </CardTitle>
                <CardDescription>
                  Body text wrapping and local code scrolling are handled separately.
                </CardDescription>
                <CardAction>
                  <Status state="warning" label="Pending" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <p>
                  Read a full reply on a narrow screen, then decide whether to adopt the new
                  paragraph spacing.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="quiet"
                  size="small"
                  data-card-action="Opened the reading check record"
                >
                  View check record
                </Button>
              </CardFooter>
            </Card>
            <Card as="section" aria-labelledby="card-recovery-title">
              <CardHeader>
                <CardTitle as="h3" id="card-recovery-title">
                  Draft recovery after continuous input and a failed submit
                </CardTitle>
                <CardDescription>
                  The submitted content and the latest draft are kept separately; editing can
                  continue after a failure.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  When reviewing, use long input and confirm the error message does not cover the
                  primary action.
                </p>
                <Card variant="surface">
                  <CardHeader>
                    <CardTitle as="h4">A separate verification environment</CardTitle>
                    <CardDescription>
                      This resource needs its own boundary, so the surface is explicit.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </CardContent>
            </Card>
          </CardContent>
          <CardFooter>
            <Button data-card-action="Saved the local check conclusion">
              Save check conclusion
            </Button>
            <Button variant="quiet" data-card-action="Kept the record to continue later">
              Continue later
            </Button>
          </CardFooter>
        </Card>
        <Card as="section" aria-labelledby="card-reference-title">
          <CardHeader>
            <CardTitle id="card-reference-title">Related references</CardTitle>
            <CardDescription>
              Standalone items keep their own boundary and are not merged into the project record
              above.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              The theme only changes visual expression; content structure and actions stay
              available.
            </p>
          </CardContent>
        </Card>
        <Note role="status" data-card-feedback>
          Actions only report back to the local example.
        </Note>
      </Stack>
    </Measure>
  ),
  setup({ root, onCleanup }) {
    const handleClick = (event: Event) => {
      const button = (event.target as Element).closest<HTMLElement>("[data-card-action]");
      if (button)
        root.querySelector("[data-card-feedback]")!.textContent = button.dataset.cardAction!;
    };
    root.addEventListener("click", handleClick);
    onCleanup(() => root.removeEventListener("click", handleClick));
  },
});
