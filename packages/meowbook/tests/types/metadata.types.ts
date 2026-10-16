import { defineComponent, type Component } from "meowjsx";
import type { ComponentMetadata } from "meowbook";

declare const Typed: Component<{ label: string }>;
Typed.metadata = { capture: { transparent: true } };
// @ts-expect-error Capture transparency requires a boolean.
Typed.metadata = { capture: { transparent: "true" } };
// @ts-expect-error Capture metadata rejects misspelled fields.
Typed.metadata = { capture: { transparant: true } };

const Defined = defineComponent({ name: "CaptureMetadata", parts: [] } as const, () => null);
Defined.metadata = { capture: { transparent: false } };
// @ts-expect-error defineComponent retains the capture metadata extension.
Defined.metadata = { capture: { transparent: 1 } };

function Plain() {
  return null;
}
Plain.metadata = { capture: { transparent: true } } satisfies ComponentMetadata;
// @ts-expect-error satisfies checks ordinary function metadata explicitly.
const Invalid = { capture: { transparent: "false" } } satisfies ComponentMetadata;
void Invalid;
