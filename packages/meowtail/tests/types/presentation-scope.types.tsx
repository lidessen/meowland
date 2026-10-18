import { h } from "meowjsx";
import { Presentation, type PresentationProps } from "meowtail/presentation";
import type { PresentationProps as RootPresentationProps } from "meowtail";

const props: PresentationProps = {
  title: "Scoped content",
  className: "host-chrome",
  slideClassName: "lesson-content",
  slides: [{ id: "one", title: "One", render: () => <h1>Lesson heading</h1> }],
};
const rootProps: RootPresentationProps = props;
const view = <Presentation {...rootProps} />;
void view;
// @ts-expect-error The slide styling hook is one class string, not inline style data.
const invalidScope: PresentationProps["slideClassName"] = { color: "red" };
void invalidScope;
