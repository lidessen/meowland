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
  Toolbar,
  type NavListGroup,
} from "meowtail";
import { Icon } from "meowtail/icons";
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
        <a className="workshop-brand" href="./">
          <Icon name="notebook-tabs" size={21} />
          <strong>Meowbook</strong>
          <span>UI</span>
        </a>
        <SearchInput
          className="workshop-search"
          id="search"
          label="Find components"
          placeholder="Find components…"
        />
        <div className="catalog-label">
          Component catalog <span id="story-count" />
        </div>
        <div id="catalog">
          <p>Loading samples…</p>
        </div>
        <div className="workshop-local">
          <label className="workshop-appearance">
            Tool appearance
            <Select id="gallery-scheme" aria-label="Tool appearance">
              <option value="auto">Follow system</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </Select>
          </label>
          <span className="workshop-local-note">
            <span className="status-dot" />
            Local component environment
          </span>
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
            <Icon name="panel-left" size={17} />
          </Button>
          <span id="group">Component preview</span>
          <span className="breadcrumb-separator">/</span>
          <span id="breadcrumb-component">Meowbook</span>
          <a
            id="standalone"
            href="./canvas.html"
            target="_blank"
            rel="noopener"
            aria-label="Standalone preview"
            title="Standalone preview"
          >
            <Icon name="arrow-up-right" size={16} />
          </a>
        </header>
        <section className="workshop-intro" aria-label="Current component scenario">
          <h1 id="title" tabindex={-1}>
            Meowbook
          </h1>
          <p id="scenario-description" />
          <nav id="variants" aria-label="Component scenarios" />
        </section>
        <Toolbar className="workshop-toolbar" label="Preview tools">
          <span className="preview-label">
            <Icon name="eye" size={15} />
            Preview
          </span>
          <div
            id="viewport"
            className="workshop-viewport"
            role="group"
            aria-label="Preview devices"
          >
            {[
              ["1100", "Desktop"],
              ["390", "Mobile"],
              ["768", "Tablet"],
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
          <Button id="reset" variant="quiet" size="small" title="Reset sample">
            <Icon name="refresh-cw" size={14} />
            <span>Reset sample</span>
          </Button>
          <Select id="measure-mode" aria-label="Annotation category">
            <option value="off">Annotations off</option>
            <option value="controls">Control sizes</option>
            <option value="text">Text typography</option>
            <option value="spacing">Spacing layout</option>
            <option value="structure">Structure outlines</option>
          </Select>
          <Button id="text-placeholder" variant="quiet" size="small" aria-pressed="false">
            Text placeholders
          </Button>
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
