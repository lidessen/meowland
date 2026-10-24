import type { Component, ComponentMetadata, Context } from "meowjsx";

declare module "meowjsx" {
  interface ComponentMetadata {
    inspection?: { transparent: boolean };
  }
}

const Typed = (({ label }: { label: string }) => label) as Component<{ label: string }>;
Typed.metadata = { inspection: { transparent: true } };
// @ts-expect-error Metadata extension values must match their declared types.
Typed.metadata = { inspection: { transparent: "true" } };
// @ts-expect-error Misspelled metadata namespaces are rejected.
Typed.metadata = { inspectoin: { transparent: true } };

function Plain() {
  return "plain";
}
Plain.metadata = { inspection: { transparent: true } } satisfies ComponentMetadata;
// @ts-expect-error satisfies checks metadata on untyped ordinary functions.
const Invalid = { inspection: { transparent: "false" } } satisfies ComponentMetadata;
void Invalid;

function Card(_props: { title: string }, context: Context<typeof Card, { title: string }>): string {
  const root = context.parts.root;
  // @ts-expect-error Component parts are finite.
  const invalid = context.parts.missing;
  return root.component + invalid.part;
}
Card.meta = { name: "metadata-card", parts: ["root"] } as const;
