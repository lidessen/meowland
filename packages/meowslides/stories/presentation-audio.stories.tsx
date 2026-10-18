import { h, mapSignal, signal } from "meowjsx";
import { Button, Inline, LayoutItem, Stack } from "meowtail";
import { defineStory } from "meowbook";
import { Presentation, PresentationAudio, PresentationLayout } from "meowslides";
import tone from "./assets/quiet-tone.wav";

export const PresentationAudioStory = defineStory({
  id: "presentation-audio",
  title: "Presentation soundtrack across slides",
  group: "Presentation and media",
  component: "PresentationAudio",
  description:
    "One manually started soundtrack keeps its element across pages and pauses with activity permission.",
  covers: ["root soundtrack", "cross-page identity", "manual playback", "activity permission"],
  render: () => {
    const active = signal(false);
    return (
      <Stack style={{ height: "min(820px, 100dvh)", minHeight: 0 }}>
        <Inline>
          <Button
            aria-pressed={mapSignal(active, String)}
            onClick={() => (active.value = !active.value)}
          >
            Allow media playback
          </Button>
          <small>Review starts stopped. Allow playback, then choose Play.</small>
        </Inline>
        <LayoutItem grow basis={0}>
          <Presentation
            title="One soundtrack across slides"
            active={active}
            soundtrack={<PresentationAudio src={tone} label="Original quiet tone" />}
            slides={[
              {
                id: "music-first",
                title: "Music is optional.",
                render: () => (
                  <PresentationLayout
                    header={<h1>Music is optional.</h1>}
                    footer={
                      <small>Original six-second 220 Hz test tone. Keep your volume low.</small>
                    }
                  >
                    <Stack>
                      <p>Start the soundtrack with Play, then move to the next page.</p>
                      <p>Pausing the presentation or removing host permission pauses the sound.</p>
                    </Stack>
                  </PresentationLayout>
                ),
              },
              {
                id: "music-second",
                title: "One track. Two pages.",
                render: () => (
                  <PresentationLayout header={<h2>One track. Two pages.</h2>}>
                    <Stack>
                      <p>The same soundtrack stays mounted while the page changes.</p>
                      <p>Restoring permission does not start playback. Choose Play to continue.</p>
                    </Stack>
                  </PresentationLayout>
                ),
              },
            ]}
          />
        </LayoutItem>
      </Stack>
    );
  },
});
