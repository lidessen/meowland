import type { ComponentMetadata, ComponentMeta } from "meowjsx";

interface TypedComponent {
  (props: { label: string }): null;
  meta: ComponentMeta<"capture-metadata", readonly []>;
  metadata?: ComponentMetadata;
}

declare const Typed: TypedComponent;
Typed.metadata = { capture: { transparent: true } };
// @ts-expect-error Capture transparency requires a boolean.
Typed.metadata = { capture: { transparent: "true" } };
// @ts-expect-error Capture metadata rejects misspelled fields.
Typed.metadata = { capture: { transparant: true } };

function Defined() {
  return null;
}
Defined.meta = { name: "capture-metadata", parts: [] } as const;
Defined.metadata = { capture: { transparent: false } };
const InvalidMeta: ComponentMeta = {
  name: "capture-metadata",
  parts: [],
  // @ts-expect-error Capture metadata remains a separate extension.
  capture: { transparent: 1 },
};
void InvalidMeta;

function Plain() {
  return null;
}
Plain.metadata = { capture: { transparent: true } } satisfies ComponentMetadata;
// @ts-expect-error satisfies checks ordinary function metadata explicitly.
const Invalid = { capture: { transparent: "false" } } satisfies ComponentMetadata;
void Invalid;
