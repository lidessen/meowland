import { h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { Button, Inline, Input, Stack } from "meowtail";
import {
  Presentation,
  PresentationLayout,
  type SlideBackground,
  type SlideDefinition,
} from "meowslides";
import coast from "../../../examples/presentation/assets/coast-delivery.jpg";

export const PresentationBackgroundsStory = defineStory({
  id: "presentation-backgrounds",
  title: "Presentation backgrounds · Let the picture serve reading",
  group: "Presentation and media",
  component: "Presentation",
  variant: "Defaults, per-page overrides and dynamic backgrounds",
  description:
    "The same page content skeleton paired with gradients, cropped images and a readable overlay; background changes keep the draft and focus.",
  covers: [
    "deck background",
    "page override",
    "theme reset",
    "cover and contain",
    "foreground",
    "failed image fallback",
    "background signal identity",
  ],
  render: () => {
    const deckBackground = signal<SlideBackground>({
      fill: "linear-gradient(125deg, #e7eee6 0%, #f7f1df 55%, #dfebea 100%)",
      foreground: "dark",
    });
    const dynamicBackground = signal<SlideBackground | undefined>({
      fill: "#f0e8dc",
      image: { src: `${coast}?variant=light`, fit: "contain", position: "right" },
      overlay: "linear-gradient(90deg, #f0e8dc, rgba(240, 232, 220, .86))",
      foreground: "dark",
    });
    const draft = signal("");
    let dark = false;
    let dynamicMounts = 0;
    const slides: readonly SlideDefinition[] = [
      {
        id: "deck",
        title: "Shared gradient",
        render: () => (
          <PresentationLayout
            footer={
              <small>The gradient is the deck default; the next page can fully override it.</small>
            }
          >
            <Stack justify="center" gap="relaxed">
              <small>Leave reading space for the point</small>
              <h1>The background sets the mood; the content stays the lead</h1>
              <p>Decide the text light/dark and position first, then choose the background.</p>
            </Stack>
          </PresentationLayout>
        ),
      },
      {
        id: "cover",
        title: "Image and reading overlay",
        background: {
          fill: "#173d36",
          image: { src: coast, position: "top right" },
          overlay:
            "linear-gradient(90deg, rgba(12, 34, 31, .92), rgba(12, 34, 31, .7) 48%, rgba(12, 34, 31, .12))",
          foreground: "light",
        },
        render: () => (
          <PresentationLayout
            footer={
              <small>
                The original coast illustration comes from the image-waiting presentation; it is
                decorative background here.
              </small>
            }
          >
            <Stack justify="center" gap="relaxed">
              <small>The image fills the canvas while the reading area keeps a dark overlay</small>
              <h1>
                Let text and scenery
                <br />
                each keep a clear place
              </h1>
              <p>cover may crop; do not leave the point to details in the background.</p>
            </Stack>
          </PresentationLayout>
        ),
      },
      {
        id: "contain",
        title: "Complete image and base color",
        background: {
          fill: "#e8eee8",
          image: { src: coast, fit: "contain", position: "right" },
          overlay:
            "linear-gradient(90deg, #e8eee8 0%, rgba(232, 238, 232, .96) 42%, rgba(232, 238, 232, .12))",
          foreground: "dark",
        },
        render: () => (
          <PresentationLayout
            columns="equal"
            footer={
              <small>
                contain keeps the complete image ratio; blank areas use this page's base color.
              </small>
            }
          >
            <Stack justify="center" gap="relaxed">
              <h2>Keep the complete image first, then arrange the reading area</h2>
              <p>
                The background is decoration; charts the audience needs to check still stay in the
                body area with an explanation.
              </p>
            </Stack>
            <div />
          </PresentationLayout>
        ),
      },
      {
        id: "theme",
        title: "Explicit theme background",
        background: "theme",
        render: () => (
          <PresentationLayout>
            <Stack justify="center" gap="relaxed">
              <small>This page returns to the standard theme</small>
              <h1>
                Pause the visual change,
                <br />
                and let one sentence remain
              </h1>
              <p>An explicit theme does not inherit the deck gradient, image or overlay.</p>
            </Stack>
          </PresentationLayout>
        ),
      },
      {
        id: "dark",
        title: "Dark base and light text",
        background: { fill: "#142c35", foreground: "light" },
        render: () => (
          <PresentationLayout
            footer={
              <small>
                foreground="light" refers to text color; the background is explicitly provided by
                the author.
              </small>
            }
          >
            <Stack justify="center" gap="relaxed">
              <small>One pause</small>
              <h1>
                Color only changes the picture,
                <br />
                not the order of the information
              </h1>
              <p>Dark base with light body text; controls keep using the shared theme.</p>
            </Stack>
          </PresentationLayout>
        ),
      },
      {
        id: "fallback",
        title: "Readable even without the image",
        background: {
          fill: "#153a34",
          image: { src: "/missing-presentation-background.jpg" },
          overlay: "linear-gradient(135deg, rgba(12, 25, 34, .55), rgba(12, 25, 34, .15))",
          foreground: "light",
        },
        render: () => (
          <PresentationLayout
            footer={
              <small>
                The intentionally missing image is for verification; the base color, overlay and
                text light/dark keep the original contract.
              </small>
            }
          >
            <Stack justify="center" gap="relaxed">
              <small>State when the image is unavailable</small>
              <h1>
                Without the image,
                <br />
                this page should still read clearly
              </h1>
              <p>
                Do not let base-color readability depend on an image that is guaranteed to load.
              </p>
            </Stack>
          </PresentationLayout>
        ),
      },
      {
        id: "dynamic",
        title: "Changing background, kept input",
        background: dynamicBackground,
        render: () => {
          dynamicMounts += 1;
          return (
            <PresentationLayout
              footer={
                <small>
                  The background Signal only updates the decoration; the current content instance
                  keeps living.
                </small>
              }
            >
              <Stack justify="center" gap="relaxed" data-background-content-mount={dynamicMounts}>
                <h2>The picture can change; the draft stays here</h2>
                <p>
                  Type first, then switch the base color with the button; content, input and focus
                  are not rebuilt by background updates.
                </p>
                <Input
                  aria-label="Background draft"
                  placeholder="Write a draft line to keep"
                  value={draft}
                  onInput={(event: Event) => {
                    draft.value = (event.currentTarget as HTMLInputElement).value;
                  }}
                />
                <Inline>
                  <Button
                    data-background-cycle
                    onClick={() => {
                      dark = !dark;
                      dynamicBackground.value = dark
                        ? {
                            fill: "#142f33",
                            image: { src: `${coast}?variant=dark` },
                            overlay: "linear-gradient(90deg, #142f33, rgba(20, 47, 51, .85))",
                            foreground: "light",
                          }
                        : {
                            fill: "#f0e8dc",
                            image: {
                              src: `${coast}?variant=light`,
                              fit: "contain",
                              position: "right",
                            },
                            overlay: "linear-gradient(90deg, #f0e8dc, rgba(240, 232, 220, .86))",
                            foreground: "dark",
                          };
                    }}
                  >
                    Switch background
                  </Button>
                  <Button
                    variant="outline"
                    data-background-inherit
                    onClick={() => {
                      dynamicBackground.value = undefined;
                    }}
                  >
                    Inherit deck background
                  </Button>
                  <Button
                    variant="outline"
                    data-background-deck
                    onClick={() => {
                      deckBackground.value = { fill: "#e3edf2", foreground: "dark" };
                    }}
                  >
                    Update deck base color
                  </Button>
                </Inline>
              </Stack>
            </PresentationLayout>
          );
        },
      },
    ];
    return (
      <div style={{ height: "min(900px, calc(100dvh - 90px))" }}>
        <Presentation
          title="Common presentation backgrounds"
          slides={slides}
          background={deckBackground}
          active={false}
        />
      </div>
    );
  },
  async ready({ root }) {
    await root.ownerDocument.fonts.ready;
  },
});
