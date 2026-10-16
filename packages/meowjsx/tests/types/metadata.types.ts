import { defineComponent, type Component, type ComponentMetadata } from "meowjsx";

declare module "meowjsx" {
  interface ComponentMetadata {
    inspection?: { transparent: boolean };
  }
}

declare const Typed: Component<{ label: string }>;
Typed.metadata = { inspection: { transparent: true } };
// @ts-expect-error Metadata extension values must match their declared types.
Typed.metadata = { inspection: { transparent: "true" } };
// @ts-expect-error Misspelled metadata namespaces are rejected.
Typed.metadata = { inspectoin: { transparent: true } };

const Defined = defineComponent({ name: "Metadata", parts: [] } as const, () => null);
Defined.metadata = { inspection: { transparent: false } };
// @ts-expect-error defineComponent preserves the metadata extension contract.
Defined.metadata = { inspection: { transparent: 1 } };

function Plain() {
  return "plain";
}
Plain.metadata = { inspection: { transparent: true } } satisfies ComponentMetadata;
// @ts-expect-error satisfies checks metadata on untyped ordinary functions.
const Invalid = { inspection: { transparent: "false" } } satisfies ComponentMetadata;
void Invalid;
