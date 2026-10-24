import { h } from "meowjsx";
import { signal, mapSignal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { Skeleton, Button, Stack } from "meowtail";
import { Measure } from "./specimen";
export const Skeletons = defineStory({
  id: "skeleton",
  title: "Loading placeholder · Preserve content structure",
  component: "Skeleton",
  variant: "Loading and result",
  group: "Overlays and feedback",
  groupOrder: 30,
  description:
    "The placeholder itself is not announced. The container expresses the loading state and keeps a text description; the button simulates the local load finishing.",
  covers: ["Skeleton", "loading", "aria-busy"],
  render: () => {
    const loading = signal(true);
    return (
      <Measure width="content">
        <Stack>
          <section aria-label="Project summary" aria-busy={loading}>
            {mapSignal(loading, (value) =>
              value ? (
                <Stack>
                  <p>Reading the project summary…</p>
                  <Skeleton shape="circle" />
                  <Skeleton style={{ width: "70%" }} />
                  <Skeleton />
                  <Skeleton shape="block" />
                </Stack>
              ) : (
                <div>
                  <h3>Website redesign</h3>
                  <p>The design drafts are organized; next, check the narrow-screen layout.</p>
                </div>
              ),
            )}
          </section>
          <div>
            <Button
              variant="outline"
              onClick={() => {
                loading.value = !loading.value;
              }}
            >
              {mapSignal(loading, (value) =>
                value ? "Simulate load completion" : "Replay loading",
              )}
            </Button>
          </div>
        </Stack>
      </Measure>
    );
  },
});
