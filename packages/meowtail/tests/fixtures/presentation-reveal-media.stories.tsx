import { h, signal } from "meowjsx";
import { defineStory } from "meowbook";
import { Button, Stack } from "meowtail";
import { Presentation, PresentationAudio, Reveal } from "meowtail/presentation";
import tone from "../../../../examples/presentation/assets/quiet-tone.wav";

export const ControlledRevealMediaFixture = defineStory({
  id: "presentation-reveal-media",
  title: "Controlled reveal media fixture",
  render: () => {
    const active = signal(false);
    const shown = signal(true);
    let mounts = 0;
    return (
      <div style={{ height: "min(780px, 100dvh)", minHeight: 0 }}>
        <Presentation
          title="Controlled reveal media"
          active={active}
          slides={[
            {
              id: "media",
              title: "Retained media",
              render: () => (
                <Stack gap="normal" align="start">
                  <Button onClick={() => (active.value = !active.value)}>
                    Toggle media permission
                  </Button>
                  <Button data-reveal-media-toggle onClick={() => (shown.value = !shown.value)}>
                    Toggle media region
                  </Button>
                  <Reveal when={shown}>
                    <PresentationAudio
                      src={tone}
                      label="Retained supporting audio"
                      ref={(element) => {
                        element.dataset.revealMediaMount = String(++mounts);
                      }}
                    />
                  </Reveal>
                </Stack>
              ),
            },
          ]}
        />
      </div>
    );
  },
});
