import {
  defineJsonComponent,
  jsonSchema as s,
  type JsonPropsDefinition,
  type JsonValue,
} from "../../src/json/index";
import type { Props, ReadableSignal } from "../../src/index";
interface OpenProps extends Props {
  title: string;
  count?: number;
  value?: ReadableSignal<string>;
  onChange?: (value: string) => void;
}
const Component = (_: OpenProps) => null;
defineJsonComponent(Component, {
  title: { kind: "value", schema: s.string(), required: true },
  value: { kind: "value", schema: s.string(), bindable: true },
  onChange: { kind: "action", args: [s.string()], mapArgs: (value: string) => [value] },
});
const badName: JsonPropsDefinition<OpenProps> = {
  // @ts-expect-error Open Props index signatures do not create arbitrary catalog fields.
  typo: { kind: "value", schema: s.string() },
};
const badValue: JsonPropsDefinition<OpenProps> = {
  // @ts-expect-error The existing prop type constrains schema output.
  title: { kind: "value", schema: s.number() },
};
const badBinding: JsonPropsDefinition<OpenProps> = {
  // @ts-expect-error Plain props do not accept host Signal bindings.
  count: { kind: "value", schema: s.number(), bindable: true },
};
const badAction: JsonPropsDefinition<OpenProps> = {
  // @ts-expect-error Direct action schema outputs must match the original callback's parameters.
  onChange: { kind: "action", args: [s.number()] },
};
const data: JsonValue = { $binding: "literal", constructor: "data" };
void [badName, badValue, badBinding, badAction, data];
