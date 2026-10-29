import { h } from "meowjsx";
import { mapSignal, signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { Pagination, Table, type TableRow } from "meowtail";
import { Note, Specimen, Specimens } from "./specimen";

const pageSize = 5;
const runs = Array.from({ length: 112 }, (_, index) => ({
  id: `run-${index + 1}`,
  name: `Nightly build #${index + 1}`,
  result: index % 7 === 3 ? "Failed" : "Passed",
  duration: `${4 + (index % 5)} min`,
}));

function rowsFor(page: number): TableRow[] {
  return runs.slice((page - 1) * pageSize, page * pageSize).map((run) => ({
    id: run.id,
    cells: [run.name, run.result, run.duration],
  }));
}

export const PaginationStory = defineStory({
  id: "pagination",
  title: "Pagination · Known and unknown totals",
  component: "Pagination",
  group: "Navigation and layout",
  groupOrder: 45,
  description:
    "Moves through pages of host records. With a known total it shows numbered pages; with an unknown total it shows the page and asks the host whether a later page exists. The host owns the page, loading and the records.",
  covers: [
    "Pagination known total",
    "Pagination unknown total",
    "Pagination busy",
    "Pagination boundaries",
  ],
  render: () => {
    const page = signal(1);
    const pageCount = Math.ceil(runs.length / pageSize);

    const cursorPage = signal(1);
    const loading = signal(false);
    const cursorPages = 3;
    let timer: ReturnType<typeof setTimeout> | undefined;

    return (
      <Specimens>
        <Specimen label="Known total" note="A table page with numbered pages beneath it.">
          <Table
            label="Build runs"
            columns={[
              { id: "name", header: "Run", width: 200 },
              { id: "result", header: "Result", width: 120 },
              { id: "duration", header: "Duration", align: "end", width: 100 },
            ]}
            rows={mapSignal(page, rowsFor)}
          />
          <Pagination
            label="Build run pages"
            page={page}
            pageCount={pageCount}
            onPageChange={(next) => {
              page.value = next;
            }}
          />
          <Note role="status">
            {mapSignal(page, (value) => {
              const from = (value - 1) * pageSize + 1;
              const to = Math.min(value * pageSize, runs.length);
              return `Showing ${from}–${to} of ${runs.length} runs.`;
            })}
          </Note>
        </Specimen>
        <Specimen
          label="Unknown total"
          note="A cursor-based feed: the host says whether a later page exists and reports loading."
          align="start"
        >
          <Pagination
            label="Activity pages"
            page={cursorPage}
            hasNext={mapSignal(cursorPage, (value) => value < cursorPages)}
            busy={loading}
            onPageChange={(next) => {
              loading.value = true;
              clearTimeout(timer);
              timer = setTimeout(() => {
                cursorPage.value = next;
                loading.value = false;
              }, 600);
            }}
          />
          <Note role="status">
            {mapSignal(loading, (value) => (value ? "Loading activity…" : "Activity loaded."))}
          </Note>
        </Specimen>
        <Specimen label="Few pages" align="start">
          <Pagination page={2} pageCount={4} onPageChange={() => {}} />
        </Specimen>
        <Specimen label="Disabled" align="start">
          <Pagination page={6} pageCount={20} disabled onPageChange={() => {}} />
        </Specimen>
      </Specimens>
    );
  },
});
