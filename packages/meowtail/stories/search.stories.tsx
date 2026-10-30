import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Field, SearchInput } from "meowtail";
import { Note } from "./specimen";

export const SearchStory = defineStory({
  id: "search-input",
  title: "Search Input · Recognition, filtering, and returning",
  group: "Forms and selection",
  groupOrder: 40,
  component: "SearchInput",
  variant: "Filtering and returning",
  description:
    "The shared search input's icon, focus, and form semantics. Search the local samples below; clearing the query restores all results. No service is accessed.",
  covers: ["SearchInput", "Field", "filter", "disabled", "readonly", "invalid", "native search"],
  render: () => (
    <div className="workshop-stack workshop-constrained">
      <Field
        label="Search in the current project"
        htmlFor="sample-search"
        description="Try searching for theme or component. Results come only from the three local items below."
      >
        <SearchInput
          id="sample-search"
          name="query"
          label="Search in the current project"
          placeholder="Enter a word from the title…"
        />
      </Field>
      <section aria-label="Search results" className="workshop-search-results">
        {[
          ["Component usage guide", "12 basic components · local sample"],
          ["Theme design notes", "MeowUI light and dark appearance · local sample"],
          ["Icon catalog", "32 functional glyphs · local sample"],
        ].map(([title, detail]) => (
          <article data-search-title={title}>
            <h3>{title}</h3>
            <p>{detail}</p>
          </article>
        ))}
        <p data-search-empty hidden>
          No matching titles; try a shorter word.
        </p>
      </section>
      <Note role="status" data-search-count>
        3 local results
      </Note>
      <section className="workshop-stack" aria-label="Other search states">
        <Field
          label="Scope locked"
          htmlFor="locked-query"
          description="Read-only text can still be selected and copied."
        >
          <SearchInput id="locked-query" label="Scope locked" value="packages/meowtail" readOnly />
        </Field>
        <Field label="Waiting for index" htmlFor="pending-query">
          <SearchInput
            id="pending-query"
            label="Waiting for index"
            placeholder="Search becomes available after indexing"
            disabled
          />
        </Field>
        <Field
          label="Query format"
          htmlFor="invalid-query"
          error="This sample accepts title text only; remove the filter expression."
        >
          <SearchInput id="invalid-query" label="Query format" value="type:" />
        </Field>
      </section>
    </div>
  ),
  setup({ root, report, onCleanup }) {
    const input = root.querySelector<HTMLInputElement>("#sample-search")!;
    const rows = [...root.querySelectorAll<HTMLElement>("[data-search-title]")];
    const update = () => {
      const query = input.value.trim().toLocaleLowerCase();
      for (const row of rows)
        row.hidden = !row.dataset.searchTitle!.toLocaleLowerCase().includes(query);
      const count = rows.filter((row) => !row.hidden).length;
      root.querySelector<HTMLElement>("[data-search-empty]")!.hidden = count !== 0;
      root.querySelector<HTMLElement>("[data-search-count]")!.textContent =
        `${count} local result${count === 1 ? "" : "s"}`;
      report(`Local filter: ${count} result${count === 1 ? "" : "s"}`);
    };
    input.addEventListener("input", update);
    onCleanup(() => input.removeEventListener("input", update));
  },
});
