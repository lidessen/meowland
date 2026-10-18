import { h, signal } from "meowjsx";
import { PresentationList, type PresentationListProps } from "meowtail/presentation";
import {
  PresentationList as RootList,
  type PresentationListProps as RootListProps,
} from "meowtail";

const label = signal("Current evidence");
const props: PresentationListProps = {
  as: "ol",
  start: 3,
  reversed: true,
  items: [label, <strong>Source sentence</strong>],
};
const rootProps: RootListProps = props;
const views = [<PresentationList {...props} />, <RootList {...rootProps} />];
void views;
// @ts-expect-error A list uses native unordered or ordered list semantics.
const table = <PresentationList as="table" items={[]} />;
void table;
// @ts-expect-error Items are a finite array of list-item content, not one unstructured paragraph.
const paragraph = <PresentationList items="A paragraph" />;
void paragraph;
