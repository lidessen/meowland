import { h, mapSignal, signal } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  Grid,
  Input,
  Stack,
} from "meowtail";
import {
  Presentation,
  PresentationLayout,
  Reveal,
  usePresentationActivity,
  type SlideDefinition,
} from "meowtail/presentation";

function ActivityStatus({ name }: { name: string }) {
  const activity = usePresentationActivity();
  return (
    <small data-support-activity={name} data-active={mapSignal(activity, String)}>
      Activity: {mapSignal(activity, (value) => (value ? "allowed" : "stopped"))}
    </small>
  );
}

export const PresentationSupportStory = defineStory({
  id: "presentation-support",
  title: "演示显隐 · 可撤回的内容区域",
  group: "演示与媒体",
  component: "Reveal",
  variant: "受控显隐与步骤组合",
  description: "when 与 at 使用相同生命周期；隐藏保留布局和草稿，嵌套内容遵守祖先活动许可。",
  covers: [
    "controlled visibility",
    "retained geometry",
    "input identity",
    "nested activity",
    "focus fallback",
    "step composition",
  ],
  render: () => {
    const shown = signal(false);
    const nested = signal(true);
    const active = signal(false);
    const draft = signal("");
    let mounts = 0;
    const slides: readonly SlideDefinition[] = [
      {
        id: "support",
        title: "Optional detail",
        steps: 1,
        render: () => (
          <PresentationLayout
            header={<h2>Keep the reading surface steady.</h2>}
            footer={<small>Visibility, navigation and host activity remain separate inputs.</small>}
          >
            <Grid columns={2} align="start" data-support-grid>
              <Stack align="start" gap="normal">
                <p>Show supporting detail, edit a draft, then hide and restore the same region.</p>
                <Button
                  data-support-toggle
                  aria-expanded={mapSignal(shown, String)}
                  aria-controls="presentation-support-detail"
                  onClick={() => (shown.value = !shown.value)}
                >
                  Toggle supporting detail
                </Button>
                <Button
                  data-support-nested-toggle
                  aria-pressed={mapSignal(nested, String)}
                  onClick={() => (nested.value = !nested.value)}
                >
                  Toggle nested detail
                </Button>
                <Button
                  data-support-host-toggle
                  aria-pressed={mapSignal(active, String)}
                  onClick={() => (active.value = !active.value)}
                >
                  Toggle host activity
                </Button>
                <Reveal when={true} transition="fade" data-support-initial>
                  <small>Visible on first render, without an entrance replay.</small>
                </Reveal>
                <p data-support-anchor>The neighboring reading column keeps its position.</p>
              </Stack>
              <Reveal
                id="presentation-support-detail"
                when={shown}
                transition={{ effect: "zoom", speed: "slow" }}
                data-support-controlled
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Optional supporting detail</CardTitle>
                    <CardDescription>{"WORKSPACEIDENTIFIER".repeat(8)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Field label="Supporting draft" htmlFor="presentation-support-draft">
                      <Input
                        id="presentation-support-draft"
                        value={draft}
                        onInput={(event: Event) => {
                          draft.value = (event.currentTarget as HTMLInputElement).value;
                        }}
                        ref={(element: HTMLInputElement) => {
                          element.dataset.supportMount = String(++mounts);
                        }}
                      />
                    </Field>
                    <ActivityStatus name="controlled" />
                    <Reveal when={nested} transition="fade" data-support-nested>
                      <Stack gap="compact" align="start">
                        <Button>Nested detail action</Button>
                        <ActivityStatus name="nested" />
                        <Reveal at={0} data-support-step-zero>
                          <small>Step zero still respects the outer condition.</small>
                        </Reveal>
                      </Stack>
                    </Reveal>
                    <Reveal at={1} transition="fade" data-support-step>
                      <p>A step-controlled detail shares the same retained region.</p>
                    </Reveal>
                  </CardContent>
                </Card>
              </Reveal>
            </Grid>
          </PresentationLayout>
        ),
      },
    ];
    return (
      <div style={{ height: "min(820px, 100dvh)", minHeight: 0 }}>
        <Presentation title="Controlled supporting detail" slides={slides} active={active} />
      </div>
    );
  },
});
