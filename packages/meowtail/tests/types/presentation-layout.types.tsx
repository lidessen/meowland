import { h } from "meowjsx";
import { PresentationLayout } from "meowtail/presentation";

const valid = (
  <PresentationLayout
    columns="wide-end"
    gap="relaxed"
    header={<h1>Header</h1>}
    footer={<small>Source</small>}
  >
    <p>Copy</p>
    <figure>Media</figure>
  </PresentationLayout>
);
void valid;
// @ts-expect-error Presentation columns are finite named proportions.
const invalid = <PresentationLayout columns="33% 67%" />;
void invalid;
