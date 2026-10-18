import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Stack } from "meowtail";
import { Presentation, PresentationText, type SlideDefinition } from "meowslides";

const effects = ["editorial", "marker", "plain"] as const;

export const ArtTextStory = defineStory({
  id: "presentation-art-text",
  title: "Presentation typography · Restrained titles",
  component: "PresentationText",
  group: "Presentation and media",
  description:
    "The same real text compares typography and light marks; font size, fonts and reading scope follow the presentation canvas.",
  render() {
    const slides: SlideDefinition[] = effects.map((effect, index) => ({
      id: effect,
      title: effect,
      steps: 0,
      render: () => (
        <Stack gap="relaxed" justify="center" style={{ height: "100%", maxWidth: "1000px" }}>
          <small>{`FIELD NOTES / 0${index + 1} · ${effect}`}</small>
          <PresentationText as="h1" effect={effect}>
            Explain the complex clearly. <br />
            Make the idea clear.
          </PresentationText>
          <p>Give the words weight and leave ideas room to breathe.</p>
        </Stack>
      ),
    }));
    slides.push({
      id: "long-title",
      title: "Long titles and real text",
      steps: 0,
      render: () => (
        <Stack gap="relaxed">
          <small>LONG FORM / Long titles and multiple lines</small>
          <PresentationText as="h1" effect="editorial">
            Carry growing ideas and real long titles with a clearer structure
          </PresentationText>
          <PresentationText as="h2" effect="marker">
            A thoughtful title can grow across lines without becoming a picture.
          </PresentationText>
          <PresentationText as="p" effect="marker">
            PresentationTypographyRemainsSelectableAndWrapsEvenWhenAWordHasNoBreaksAtAnyPresentationScaleWithoutRequiringAuthoredPixels
          </PresentationText>
        </Stack>
      ),
    });
    slides.push({
      id: "editable",
      title: "Native text seam",
      steps: 0,
      render: () => (
        <Stack gap="relaxed">
          <small>NATIVE TEXT / Selection and editing</small>
          <PresentationText
            as="h1"
            effect="marker"
            contentEditable
            role="textbox"
            aria-label="Editable presentation title"
            aria-multiline="true"
          >
            Edit this title / Revise it in place
          </PresentationText>
          <p>
            Native editing belongs only to this example; the component keeps no second copy of the
            text or editing state.
          </p>
        </Stack>
      ),
    });
    return (
      <div style={{ height: "min(760px, 100dvh)", minHeight: "0" }}>
        <Presentation title="Presentation typography" slides={slides} active={false} />
      </div>
    );
  },
});
