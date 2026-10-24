import { h, signal } from "meowjsx";
import { cx } from "meowcss";
import { ui } from "meowtail/theme";
import {
  Presentation,
  PresentationText,
  Reveal,
  PresentationLayout,
  PresentationList,
  PresentationVideo,
  PresentationAudio,
  type PresentationProps,
} from "meowslides";
import type { PresentationProps as RootPresentationProps } from "meowslides";

const props: PresentationProps = {
  title: "Scoped content",
  className: "host-chrome",
  slideClassName: "lesson-content",
  slides: [{ id: "one", title: "One", render: () => <h1>Lesson heading</h1> }],
};
const className = [ui.p.panel, signal(ui.px.group), cx(ui.text.body, "host-copy")] as const;
const classNameConsumers = [
  <Presentation {...props} className={className} />,
  <PresentationText className={className} />,
  <Reveal at={0} className={className} />,
  <PresentationLayout className={className} />,
  <PresentationList items={[]} className={className} />,
  <PresentationVideo src="/video.webm" label="Video" className={className} />,
  <PresentationAudio src="/audio.wav" label="Audio" className={className} />,
];
void classNameConsumers;
const rootProps: RootPresentationProps = props;
const view = <Presentation {...rootProps} />;
void view;
// @ts-expect-error The slide styling hook is one class string, not inline style data.
const invalidScope: PresentationProps["slideClassName"] = { color: "red" };
void invalidScope;
