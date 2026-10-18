import { h, signal } from "meowjsx";
import { PresentationText } from "meowslides";

const effect = signal<"editorial" | "marker">("editorial");
const title = (
  <PresentationText as="h1" effect={effect}>
    A clear idea
  </PresentationText>
);
const editable = (
  <PresentationText contentEditable aria-label="Title">
    Edit me
  </PresentationText>
);
void title;
void editable;
// @ts-expect-error Treatments are a bounded typography vocabulary.
const arbitrary = <PresentationText effect="rainbow">Title</PresentationText>;
void arbitrary;
// @ts-expect-error This component supplies text semantics, not arbitrary controls.
const button = <PresentationText as="button">Title</PresentationText>;
void button;
