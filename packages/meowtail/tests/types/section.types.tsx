import { h } from "meowjsx";
import { Button, Page, Section } from "../../src/components";

const plain: JSX.Element = (
  <Section
    title="Notifications"
    description="Choose how the project reaches you."
    actions={<Button size="small">Reset</Button>}
    footer="Saved automatically."
  >
    <p>Email digests are sent once a day.</p>
  </Section>
);
const card: JSX.Element = <Section title="Card section" variant="card" />;
const grouping: JSX.Element = (
  <Section>
    <p>A grouping wrapper without its own heading.</p>
  </Section>
);
const nested: JSX.Element = (
  <Page title="Page title">
    <Section title="Outer section">
      <Section title="Inner section">Content.</Section>
    </Section>
  </Page>
);
void plain;
void card;
void grouping;
void nested;

// @ts-expect-error Section variants are the two supported presentations.
const invalidVariant: JSX.Element = <Section variant="surface">Content.</Section>;
void invalidVariant;
