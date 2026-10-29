import { h, createRuntime, type MountResult } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import {
  installMeowUI,
  meowUIComponents,
  Button,
  NavList,
  SearchInput,
  Select,
  Disclosure,
  Popover,
  Toolbar,
  type NavListGroup,
} from "meowtail";
import { Icon, IconSource } from "meowtail/icons";
import { BookOpen, Monitor, Moon, Sun, Type } from "meowtail/icons/lucide";
import { standardTheme } from "meowtail/theme";
import { applyTheme } from "meowcss/web";

/** The catalog rebuilds on search/selection, so it keeps its own long-lived runtime. */
const catalogRuntime = createRuntime();
installMeowUI({ components: meowUIComponents }, catalogRuntime);
const catalogRenderer = createWebRenderer(catalogRuntime);
let mountedCatalog: MountResult | undefined;

/** One rendered catalog state: the visible groups, the current component and the empty copy. */
export interface CatalogView {
  groups: readonly NavListGroup[];
  /** Component key of the current story; empty when nothing is current. */
  activeId: string;
  /** Shown instead of the lists when no story matches the search. */
  emptyMessage: string;
}

/**
 * Mount or replace the catalog inside the existing `#catalog` scroll container.
 * The host owns the manifest data and rebuilds it on search/selection; each new
 * state disposes the previous tree so ids, focus targets and `aria-current` never
 * come from two catalog generations.
 */
export function mountCatalog({ groups, activeId, emptyMessage }: CatalogView) {
  const container = document.getElementById("catalog");
  if (!container) return;
  mountedCatalog?.unmount();
  container.replaceChildren();
  mountedCatalog = catalogRenderer.render(
    groups.length ? (
      <NavList
        className="workshop-catalog"
        label="Component samples"
        groups={groups}
        activeId={activeId}
      />
    ) : (
      <p className="catalog-empty">{emptyMessage}</p>
    ),
    container,
  );
}

/** Only tool composition lives here; controls, icons and theme are Meowtail. */
export function mountGallery() {
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
  applyTheme(document.documentElement, standardTheme);
  createWebRenderer(runtime).render(
    <div className="workshop-shell">
      <aside className="workshop-sidebar" id="sidebar">
        <a className="workshop-brand" id="brand" href="./">
          <span id="brand-mark" className="workshop-brand-mark">
            <Icon name="notebook-tabs" size={18} />
          </span>
          <strong id="brand-name">Meowbook</strong>
          <span id="brand-label">UI</span>
        </a>
        <SearchInput
          className="workshop-search"
          id="search"
          label="Find components"
          placeholder="Find components…"
        />
        <div className="catalog-label">
          Components <span id="story-count" />
        </div>
        <div id="catalog">
          <p className="catalog-empty">Loading samples…</p>
        </div>
      </aside>
      <button id="catalog-backdrop" aria-label="Close component catalog" tabindex={-1} hidden />
      <main className="workshop-main">
        <header className="workshop-header">
          <Button
            id="toggle-sidebar"
            variant="quiet"
            aria-label="Toggle component catalog"
            aria-controls="sidebar"
            aria-expanded="false"
          >
            <Icon name="panel-left" size={16} />
          </Button>
          <nav className="workshop-trail" aria-label="Breadcrumb">
            <span id="group">Components</span>
            <span className="breadcrumb-separator" aria-hidden="true">
              /
            </span>
            <span id="breadcrumb-component" aria-current="page">
              Meowbook
            </span>
          </nav>
          <div className="workshop-header-actions">
            <a id="story-docs" className="workshop-header-link" hidden>
              <IconSource source={BookOpen} size={14} />
              <span>Docs</span>
            </a>
            <nav id="host-links" className="workshop-host-links" aria-label="Related" hidden />
            <Popover
              id="appearance"
              className="workshop-appearance"
              align="end"
              role="dialog"
              labelledBy="appearance-trigger"
              trigger={(bindings) => (
                <button
                  {...bindings}
                  id="appearance-trigger"
                  className="workshop-icon-button"
                  type="button"
                  aria-label="Appearance"
                  title="Appearance"
                  data-appearance="auto"
                >
                  <IconSource source={Monitor} size={16} className="appearance-auto" />
                  <IconSource source={Sun} size={16} className="appearance-light" />
                  <IconSource source={Moon} size={16} className="appearance-dark" />
                </button>
              )}
            >
              <fieldset id="appearance-themes" hidden>
                <legend>Theme</legend>
              </fieldset>
              <fieldset id="appearance-schemes">
                <legend>Appearance</legend>
                {(
                  [
                    ["auto", "System", Monitor],
                    ["light", "Light", Sun],
                    ["dark", "Dark", Moon],
                  ] as const
                ).map(([value, label, icon]) => (
                  <label>
                    <input type="radio" name="gallery-scheme" value={value} />
                    <IconSource source={icon} size={14} />
                    <span>{label}</span>
                  </label>
                ))}
              </fieldset>
            </Popover>
            <a
              id="standalone"
              className="workshop-icon-button"
              href="./canvas.html"
              target="_blank"
              rel="noopener"
              aria-label="Open the canvas on its own"
              title="Open the canvas on its own"
            >
              <Icon name="arrow-up-right" size={16} />
            </a>
          </div>
        </header>
        <section className="workshop-intro" aria-label="Current component scenario">
          <h1 id="title" tabindex={-1}>
            Meowbook
          </h1>
          <p id="scenario-description" />
          <nav id="variants" aria-label="Component scenarios" />
        </section>
        <Toolbar className="workshop-toolbar" label="Preview tools">
          <div
            id="viewport"
            className="workshop-viewport"
            role="group"
            aria-label="Preview devices"
          >
            {[
              ["1100", "Desktop"],
              ["768", "Tablet"],
              ["390", "Mobile"],
              ["fluid", "Fluid"],
            ].map(([value, label]) => (
              <Button variant="quiet" size="small" data-width={value} aria-pressed="false">
                {label}
              </Button>
            ))}
          </div>
          <span id="viewport-size" className="viewport-size">
            1100 px
          </span>
          <div className="workshop-tools">
            <Select id="measure-mode" aria-label="Annotation category">
              <option value="off">Annotations off</option>
              <option value="controls">Control sizes</option>
              <option value="text">Text typography</option>
              <option value="spacing">Spacing layout</option>
              <option value="structure">Structure outlines</option>
            </Select>
            <Button
              id="text-placeholder"
              variant="quiet"
              size="small"
              aria-pressed="false"
              aria-label="Text placeholders"
              title="Replace text with placeholder bars"
            >
              <IconSource source={Type} size={14} />
              <span>Text placeholders</span>
            </Button>
            <Button
              id="reset"
              variant="quiet"
              size="small"
              aria-label="Reset sample"
              title="Reset sample"
            >
              <Icon name="refresh-cw" size={14} />
            </Button>
          </div>
        </Toolbar>
        <div className="workshop-stage">
          <iframe id="canvas" title="Component preview canvas" />
        </div>
        <section id="measurement-detail" aria-label="Selected element details" hidden>
          <p id="measurement-help">
            Click a canvas element to see its actual values; turn annotations off to restore normal
            clicks.
          </p>
          <dl id="measurement-values" />
        </section>
        <Disclosure
          className="workshop-observations"
          id="inspection-panel"
          contentClassName="inspection-body"
          summary={[
            <Icon name="list-checks" size={15} />,
            <strong>Checks and notes</strong>,
            <span id="latest-event" role="status" hidden />,
            <span id="inspection" role="status">
              Waiting for the canvas…
            </span>,
          ]}
        >
          <section className="workshop-description" aria-label="Sample description">
            <p id="description">Loading…</p>
            <div id="covers" />
          </section>
          <div className="workshop-observation-head">
            <strong>Interaction log</strong>
            <Button id="inspect" variant="quiet" size="small">
              Check again
            </Button>
            <Button id="clear-log" variant="quiet" size="small">
              Clear log
            </Button>
          </div>
          <ol id="events" aria-live="polite" />
          <section className="workshop-batch" aria-label="All sample checks">
            <div className="workshop-observation-head">
              <Button id="inspect-all" variant="outline" size="small" disabled>
                Check all samples
              </Button>
              <Button id="cancel-inspection" variant="quiet" size="small" hidden>
                Cancel check
              </Button>
              <span id="batch-status" role="status">
                Check all scenarios at the current width.
              </span>
            </div>
            <ul id="batch-results" />
          </section>
          <p className="workshop-limits">
            Checks rendering, horizontal overflow and control names; does not replace interaction or
            visual acceptance.
          </p>
        </Disclosure>
      </main>
    </div>,
    document.body,
  );
}
