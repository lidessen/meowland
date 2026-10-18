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
const numbered = [1, 2, 3].map((columns) => <PresentationLayout columns={columns as 1 | 2 | 3} />);
void numbered;
// @ts-expect-error Presentation columns are finite counts or named proportions.
const invalid = <PresentationLayout columns="33% 67%" />;
void invalid;

// @ts-expect-error Four columns are outside the bounded presentation presets.
const tooMany = <PresentationLayout columns={4} />;
void tooMany;
