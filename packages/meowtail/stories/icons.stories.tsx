import { h } from "meowjsx/runtime";
import {
  Button,
  DoodleCat,
  ExternalArrowIcon,
  Field,
  GithubIcon,
  Icon,
  IconButton,
  IconSource,
  iconNames,
  SearchInput,
  MeowlandMark,
  NotesIcon,
  PlusIcon,
  SearchIcon,
  TasksIcon,
} from "meowtail";
import { defineStory } from "meowbook";
import { Bell, Camera, Rocket } from "meowtail/icons/lucide";

export const IconsStory = defineStory({
  id: "icons",
  title: "Functional icons · Full set",
  group: "Icons and brand",
  groupOrder: 60,
  component: "Icon",
  variant: "All icons",
  description:
    "Find and choose a semantic icon. Names are the stable call keys used by components and JSON; application-only icons use IconSource with the pinned Lucide pass-through.",
  covers: ["Icon", "iconNames", "all functional icons", "search", "selection", "keyboard"],
  render: () => (
    <div className="workshop-stack">
      <Field htmlFor="icon-search" label="Find an icon" className="workshop-constrained">
        <SearchInput
          id="icon-search"
          label="Find an icon"
          placeholder="For example: search, file, arrow…"
        />
      </Field>
      <p className="workshop-feedback" role="status" data-icon-feedback>
        {iconNames.length} icons · select one to see its name
      </p>
      <div className="workshop-icon-grid" aria-label="Functional icons">
        {iconNames.map((name) => (
          <Button
            variant="quiet"
            className="workshop-icon-item"
            data-icon={name}
            aria-pressed="false"
          >
            <Icon name={name} size={20} />
            <span>{name}</span>
          </Button>
        ))}
      </div>
      <p className="workshop-note" data-icon-empty hidden>
        No matching icons; try a shorter name.
      </p>
    </div>
  ),
  setup({ root, report, onCleanup }) {
    const search = root.querySelector<HTMLInputElement>("#icon-search")!;
    const items = [...root.querySelectorAll<HTMLButtonElement>("button[data-icon]")];
    const feedback = root.querySelector<HTMLElement>("[data-icon-feedback]")!;
    const filter = () => {
      const query = search.value.trim().toLowerCase();
      for (const item of items) item.hidden = !item.dataset.icon!.includes(query);
      const count = items.filter((item) => !item.hidden).length;
      feedback.textContent = `${count} / ${items.length} icons`;
      root.querySelector<HTMLElement>("[data-icon-empty]")!.hidden = count !== 0;
    };
    const choose = (event: Event) => {
      const target = (event.target as Element).closest<HTMLButtonElement>("button[data-icon]");
      if (!target) return;
      for (const item of items) item.setAttribute("aria-pressed", String(item === target));
      feedback.textContent = `Selected ${target.dataset.icon} · Reference it with Icon's name prop`;
      report(`Selected icon ${target.dataset.icon}`);
    };
    search.addEventListener("input", filter);
    root.addEventListener("click", choose);
    onCleanup(() => {
      search.removeEventListener("input", filter);
      root.removeEventListener("click", choose);
    });
  },
});

export const IconSizesStory = defineStory({
  id: "icon-sizes",
  title: "Icon · Scale and its relationship to text",
  group: "Icons and brand",
  groupOrder: 60,
  component: "Icon",
  variant: "Scale and text",
  description:
    "Compare the default, 16, 20, and 24px outlines with adjacent text, and check named graphics and icon buttons. Size and hit area are judged separately.",
  covers: [
    "Icon",
    "IconButton",
    "default / 16 / 20 / 24px",
    "theme stroke",
    "Icon.label",
    "accessible labels",
  ],
  render: () => (
    <div className="workshop-stack">
      <section className="workshop-stack" aria-label="Size reference">
        <h2 className="workshop-section-title">Same outline, different reading distance</h2>
        {[undefined, 16, 20, 24].map((size) => (
          <div className="workshop-row workshop-icon-scale">
            <span className="workshop-note">{size === undefined ? "Default" : `${size}px`}</span>
            <span>
              <Icon name="search" size={size} /> Find components
            </span>
            <span>
              <Icon name="file" size={size} /> Design notes
            </span>
            <span>
              <Icon name="folder" size={size} /> Current project
            </span>
          </div>
        ))}
      </section>
      <section className="workshop-stack" aria-label="Theme stroke reference">
        <h2 className="workshop-section-title">The theme decides stroke and feel</h2>
        <div className="workshop-row">
          <span className="workshop-note">MeowUI standard theme</span>
          <span className="workshop-icon-state-sample">
            <IconButton label="studio search" data-icon-action="studio">
              <Icon name="search" />
            </IconButton>
            <span className="workshop-note">Available</span>
          </span>
          <span className="workshop-icon-state-sample">
            <IconButton label="studio search unavailable" disabled>
              <Icon name="search" />
            </IconButton>
            <span className="workshop-note">Unavailable</span>
          </span>
        </div>
      </section>
      <section className="workshop-row" aria-label="Standalone graphic names">
        <Icon name="folder" size={24} label="Project folder" />
        <span className="workshop-note">
          Standalone graphics can be named; decorative icons inside a button take their action from
          the button.
        </span>
      </section>
      <p className="workshop-feedback" role="status" data-feedback>
        Use Tab and Enter to operate the icon buttons.
      </p>
    </div>
  ),
  setup({ root, report, onCleanup }) {
    const onClick = (event: Event) => {
      const button = (event.target as Element).closest<HTMLElement>("[data-icon-action]");
      if (!button) return;
      const message = `${button.dataset.iconAction} search triggered`;
      root.querySelector("[data-feedback]")!.textContent = message;
      report(message);
    };
    root.addEventListener("click", onClick);
    onCleanup(() => root.removeEventListener("click", onClick));
  },
});

export const BrandIconsStory = defineStory({
  id: "brand-icons",
  title: "Graphics · Brand and convenience entries",
  group: "Icons and brand",
  groupOrder: 60,
  component: "Brand icons",
  variant: "Brand and convenience entries",
  description:
    "Brand and illustration graphics keep their own shapes, while functional icon convenience entries reuse the same Lucide outline. Toggle light and dark to check readability.",
  covers: [
    "MeowlandMark",
    "DoodleCat",
    "GithubIcon",
    "NotesIcon",
    "TasksIcon",
    "SearchIcon",
    "PlusIcon",
    "ExternalArrowIcon",
  ],
  render: () => (
    <div className="workshop-stack">
      <section className="workshop-brand-grid" aria-label="Brand and illustration">
        <figure>
          <MeowlandMark />
          <figcaption>MeowlandMark</figcaption>
        </figure>
        <figure>
          <DoodleCat />
          <figcaption>DoodleCat</figcaption>
        </figure>
        <figure>
          <GithubIcon />
          <figcaption>GithubIcon</figcaption>
        </figure>
      </section>
      <section className="workshop-row" aria-label="Meowland brand at small sizes">
        {[16, 24, 32].map((size) => (
          <span className="workshop-row">
            <span style={`display:inline-flex;width:${size}px;height:${size}px`}>
              <MeowlandMark />
            </span>
            <span>Meowland · {size}px</span>
          </span>
        ))}
      </section>
      <section className="workshop-stack" aria-label="Functional icon convenience entries">
        <h2 className="workshop-section-title">Convenience entries share the Icon outline</h2>
        <div className="workshop-icon-grid">
          {(
            [
              ["NotesIcon", NotesIcon],
              ["TasksIcon", TasksIcon],
              ["SearchIcon", SearchIcon],
              ["PlusIcon", PlusIcon],
              ["ExternalArrowIcon", ExternalArrowIcon],
            ] as const
          ).map(([name, Graphic]) => (
            <div className="workshop-icon-item">
              <Graphic />
              <span>{name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  ),
});

export const IconSourceStory = defineStory({
  id: "icon-source",
  title: "Icon · Caller icon data",
  group: "Icons and brand",
  groupOrder: 60,
  component: "IconSource",
  variant: "Caller icon data",
  description:
    "Render application icons outside the semantic set through IconSource. The pinned meowtail/icons/lucide pass-through supplies Lucide data; the shared frame keeps theme stroke, sizing, and accessible naming.",
  covers: ["IconSource", "IconNode", "meowtail/icons/lucide", "theme stroke", "accessible labels"],
  render: () => (
    <div className="workshop-stack">
      <section className="workshop-stack" aria-label="Application icons">
        <h2 className="workshop-section-title">Icons outside the semantic set</h2>
        <div className="workshop-row">
          {(
            [
              [Bell, "Notifications"],
              [Camera, "Camera"],
              [Rocket, "Rocket"],
            ] as const
          ).map(([source, name]) => (
            <span className="workshop-row">
              <IconSource source={source} size={20} />
              <span className="workshop-note">{name}</span>
            </span>
          ))}
        </div>
      </section>
      <section className="workshop-row" aria-label="Named standalone icon">
        <IconSource source={Bell} size={24} label="Notifications" />
        <span className="workshop-note">
          Pass label when the icon carries meaning on its own; otherwise it stays decorative.
        </span>
      </section>
    </div>
  ),
});
