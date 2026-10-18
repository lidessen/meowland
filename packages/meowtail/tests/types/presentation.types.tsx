import { h, mapSignal, signal } from "meowjsx";
import {
  Presentation,
  PresentationAudio,
  PresentationVideo,
  Reveal,
  usePresentationActivity,
  type SlideDefinition,
  type SlidePosition,
  type PresentationTransition,
} from "meowtail/presentation";

const position = signal<SlidePosition>({ slideId: "first", step: 0 });
const active = signal(false);
const slides = [
  {
    id: "first",
    title: "First",
    steps: 2,
    render({ step }) {
      // @ts-expect-error Page content can observe steps but cannot mutate the player through them.
      step.value = 1;
      return <Reveal at={2}>{step}</Reveal>;
    },
  },
] satisfies SlideDefinition[];

const presentation = (
  <Presentation
    title="Typed deck"
    slides={slides}
    position={position}
    active={active}
    transition={{ effect: "slide", direction: "left", speed: "fast" }}
    soundtrack={<PresentationAudio src="./music.wav" label="Music" />}
  />
);
void presentation;
const transition: PresentationTransition = { effect: "zoom", speed: "slow" };
void transition;
// @ts-expect-error Presets keep authored transitions bounded and portable.
const arbitraryDuration: PresentationTransition = { effect: "fade", duration: 1234 };
void arbitraryDuration;
// @ts-expect-error The player only decorates a new page, without retaining an outgoing page.
const retainedPage: PresentationTransition = "push";
void retainedPage;
const video = <PresentationVideo src="./evidence.webm" label="Evidence" />;
void video;
// @ts-expect-error Media requires an explicit accessible label even when native controls are shown.
const unnamedVideo = <PresentationVideo src="./evidence.webm" />;
void unnamedVideo;
const activity = usePresentationActivity();
// @ts-expect-error Activity is permission observed by collaborators, not a writable player store.
activity.value = true;
// @ts-expect-error Position updates replace the value so changes reach subscribers.
position.value.step = 1;
const readonlyPosition = mapSignal(position, (value) => value);
// @ts-expect-error Navigation requires the caller's writable source, not a read-only projection.
const invalid = <Presentation title="Invalid" slides={slides} position={readonlyPosition} />;
void invalid;
