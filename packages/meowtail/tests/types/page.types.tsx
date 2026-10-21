import { h } from "meowjsx";
import { Button, Page, Section } from "../../src/components";

const page: JSX.Element = (
  <Page
    title="Build a page from regions"
    description="One line of purpose."
    eyebrow="Guide"
    actions={<Button>Copy page link</Button>}
    toolbar={<Button size="small">Filter</Button>}
    notice="The draft is read-only."
    width="wide"
  >
    <Section title="Overview">Content.</Section>
  </Page>
);
const escapedHeader: JSX.Element = (
  <Page header={<nav aria-label="Page chrome">Host chrome</nav>}>Content.</Page>
);
const contentOnly: JSX.Element = (
  <Page>
    <p>A content-only page without an identity block.</p>
  </Page>
);
const fullWidth: JSX.Element = <Page title="Full width column" width="full" />;
void page;
void escapedHeader;
void contentOnly;
void fullWidth;

// @ts-expect-error Page widths are the four content columns; "page" belongs to Container.
const invalidWidth: JSX.Element = <Page title="Width" width="page" />;
void invalidWidth;
