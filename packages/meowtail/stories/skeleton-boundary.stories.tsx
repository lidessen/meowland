import { h, mapSignal, signal } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Field,
  Icon,
  Inline,
  Input,
  SkeletonBoundary,
  Stack,
} from "meowtail";
import { SchemePair } from "./scheme-pair";

const copy = {
  loading: "Updating project data",
  name: "Project name",
  project: "Meowland workspace",
  note: "Content sizes and arrangement are preserved while data updates. Continue editing the current draft once loading finishes.",
  start: "Start loading",
  finish: "Loading finished",
  append: "Add content",
  extra: "New data appears according to the current loading state.",
};
const image =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="72" viewBox="0 0 96 72"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#dbeafe"/><stop offset="0.55" stop-color="#e0e7ff"/><stop offset="1" stop-color="#fce7f3"/></linearGradient><radialGradient id="s" cx="0.28" cy="0.3" r="0.6"><stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs><rect width="96" height="72" rx="10" fill="url(#g)"/><rect width="96" height="72" rx="10" fill="url(#s)"/><path d="M0 56c18-10 34-12 52-4s30 8 44-2v12a10 10 0 0 1-10 10H10A10 10 0 0 1 0 62Z" fill="#6366f1" fill-opacity="0.18"/><path d="M0 63c20-7 38-7 56-1s28 5 40-1v1a10 10 0 0 1-10 10H10A10 10 0 0 1 0 62Z" fill="#6366f1" fill-opacity="0.24"/></svg>',
  );

export const SkeletonBoundaryStory = defineStory({
  id: "skeleton-boundary",
  title: "Loading boundary · Preserve existing content",
  component: "SkeletonBoundary",
  variant: "Existing content and dynamic loading",
  group: "Overlays and feedback",
  groupOrder: 30,
  description:
    "Light defaults to editable and dark to loading; input nodes and drafts stay unchanged across the switch. Actions sit outside the boundary.",
  covers: [
    "SkeletonBoundary",
    "Signal loading",
    "preserved input",
    "image and icon",
    "light and dark",
  ],
  render: () => (
    <SchemePair>
      {(scheme) => {
        const active = signal(scheme === "dark");
        const appended = signal(false);
        const id = scheme === "light" ? "skeleton-boundary-demo" : "skeleton-boundary-other";
        return (
          <Stack gap="normal">
            <SkeletonBoundary id={id} active={active} label={copy.loading}>
              <Card>
                <CardHeader>
                  <CardTitle>{copy.project}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Stack gap="normal">
                    <Inline align="center">
                      <img
                        src={image}
                        width={96}
                        height={72}
                        alt="Project cover"
                        style={{ borderRadius: "10px" }}
                      />
                      <Stack gap="compact">
                        <Inline align="center" gap="compact">
                          <Icon name="folder" />
                          <span>Design resources</span>
                        </Inline>
                        <span>{copy.note}</span>
                      </Stack>
                    </Inline>
                    <Field label={copy.name} htmlFor={`${id}-name`}>
                      <Input id={`${id}-name`} value={copy.project} />
                    </Field>
                    {mapSignal(appended, (value) =>
                      value ? <p data-testid={`${id}-extra`}>{copy.extra}</p> : null,
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </SkeletonBoundary>
            <Inline>
              <Button
                data-testid={`${id}-start`}
                variant="outline"
                onClick={() => {
                  active.value = true;
                }}
              >
                {copy.start}
              </Button>
              <Button
                data-testid={`${id}-finish`}
                variant="outline"
                onClick={() => {
                  active.value = false;
                }}
              >
                {copy.finish}
              </Button>
              <Button
                data-testid={`${id}-append`}
                variant="quiet"
                onClick={() => {
                  appended.value = true;
                }}
              >
                {copy.append}
              </Button>
            </Inline>
          </Stack>
        );
      }}
    </SchemePair>
  ),
});
