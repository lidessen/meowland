import { h } from "meowjsx";
import { PresentationImage } from "meowtail";
import {
  PresentationImage as SubpathImage,
  type PresentationImageProps,
  type PresentationImagePosition,
} from "meowtail/presentation";

const position: PresentationImagePosition = "bottom right";
const props: PresentationImageProps = {
  src: "/photo.jpg",
  alt: "A photograph with an explicit crop",
  ratio: "fill",
  fit: "cover",
  position,
  caption: <span>Author · license · crop noted.</span>,
};
const valid = [
  <PresentationImage {...props} />,
  <SubpathImage src="/document.png" alt="Full document" ratio={3 / 2} />,
];
void valid;
// @ts-expect-error The frame has one numeric ratio or fill, not a second height policy.
const invalidRatio = <PresentationImage src="/photo" alt="Photo" ratio="wide" />;
void invalidRatio;
// @ts-expect-error Fitting is bounded; fill must not stretch the source pixels.
const invalidFit = <PresentationImage src="/photo" alt="Photo" fit="fill" />;
void invalidFit;
// @ts-expect-error Position uses the shared semantic nine-point vocabulary.
const invalidPosition = <PresentationImage src="/photo" alt="Photo" position="17% 40%" />;
void invalidPosition;
// @ts-expect-error A content image requires a deliberate text alternative.
const missingAlt = <PresentationImage src="/document" />;
void missingAlt;
const arbitraryChildren: PresentationImageProps = {
  src: "/photo",
  alt: "Photo",
  // @ts-expect-error Image and caption are the component's structure.
  children: <button>Open</button>,
};
void arbitraryChildren;
