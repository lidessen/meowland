import { themeAttributes, type ThemeDefinition } from "meowcss";
import "./runtime";
import { h, type Child } from "meowjsx";
import { renderToHtml } from "meowjsx/web";
import { Breadcrumb, NavList, SearchInput, type NavListGroup } from "meowtail";
import { Icon, MeowlandMark } from "meowtail/icons";
import type { Catalog, NavigationGroup } from "./catalog";
import type { DocsPackage } from "./packages";

/** The name the site gives itself. */
export const SITE_NAME = "Meowland";

/** The one-line description the site uses in its metadata. */
export const SITE_DESCRIPTION =
  "A small UI capability library: a JSX runtime, a style system, a component library, a presentation engine, a workbench and a site generator.";

/** The site mark, inlined so the site has no extra asset request. */
const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%230f1115'/%3E%3Cpath d='M9 21V11l7 5 7-5v10' stroke='%23ffffff' stroke-width='2.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

/** One level of the trail that says where the reader is. */
export interface TrailItem {
  label: string;
  href?: string;
}

export interface DocumentOptions {
  /** The theme that paints the page. */
  theme: ThemeDefinition;
  /** The component reference, used by the sidebar. */
  catalog: Catalog;
  /** The workspace packages, used by the sidebar. */
  packages: DocsPackage[];
  /** Site path of the current page, without a leading slash. */
  path: string;
  /** The page title, without the site name. */
  title: string;
  /** The page description, used in the metadata. */
  description?: string;
  /** The trail in the page header. */
  trail: readonly TrailItem[];
  /** The page body. */
  children: Child;
}

/** The name of the theme stylesheet the build writes. */
export const THEME_STYLESHEET = "docs-theme.css";

/** The stylesheet path for a page at a given depth. */
export function stylesheetHref(depth: number): string {
  return depth <= 0 ? `./${THEME_STYLESHEET}` : `${"../".repeat(depth)}${THEME_STYLESHEET}`;
}

/**
 * The catalog filter. The catalog is static HTML, so the search field and the
 * matching it drives run in the page itself; the field itself is a Meowtail
 * control, and the matching belongs to the site.
 */
const CATALOG_FILTER = `(() => {
  const input = document.querySelector('[data-meowui-part="search-input/control"]');
  const catalog = document.getElementById("docs-catalog");
  if (!input || !catalog) return;
  const groups = Array.from(
    catalog.querySelectorAll('[data-meowui-part="nav-list/group"]'),
  );
  const empty = document.getElementById("docs-catalog-empty");
  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    let visible = 0;
    for (const group of groups) {
      let shown = 0;
      const items = Array.from(
        group.querySelectorAll('[data-meowui-part="nav-list/item"]'),
      );
      for (const item of items) {
        const match = !query || (item.textContent || "").toLowerCase().includes(query);
        const row = item.closest("li") ?? item;
        row.hidden = !match;
        if (match) shown++;
      }
      group.hidden = shown === 0;
      visible += shown;
    }
    if (empty) empty.hidden = visible > 0 || !query;
  });
})();`;

/**
 * Grow each live preview to fit its story. The canvas is same-origin, so the page reads the
 * story's height directly; the fixed height is the floor and the no-script fallback, and a
 * cap keeps a tall story scrolling inside its frame.
 */
const PREVIEW_FIT = `(() => {
  const frames = document.querySelectorAll(".docs-preview-frame");
  const fit = (frame) => {
    let doc;
    try { doc = frame.contentDocument; } catch { return; }
    if (!doc || !doc.documentElement) return;
    const tall = frame.classList.contains("docs-preview-frame-tall");
    // The body's own extent, not the document's: the document never reports less than the frame.
    const body = doc.body;
    if (!body) return;
    const margin = parseFloat(getComputedStyle(body).marginBottom) || 0;
    const content = Math.ceil(Math.max(body.scrollHeight, body.getBoundingClientRect().bottom + margin));
    // Grow only: a story that fills its viewport would otherwise shrink the frame with it.
    const height = Math.max(tall ? 680 : 440, Math.min(content, tall ? 960 : 720));
    if (Math.abs(frame.getBoundingClientRect().height - height) > 1) frame.style.height = height + "px";
  };
  for (const frame of frames) {
    const watch = () => {
      fit(frame);
      let doc;
      try { doc = frame.contentDocument; } catch { return; }
      if (!doc || !window.ResizeObserver) return;
      // Resize on the next frame, outside the observer's delivery, so the story's own
      // observers never see a resize loop.
      let pending = 0;
      const observer = new ResizeObserver(() => {
        if (pending) return;
        pending = requestAnimationFrame(() => {
          pending = 0;
          fit(frame);
        });
      });
      if (doc.body) observer.observe(doc.body);
    };
    frame.addEventListener("load", watch);
    if (frame.contentDocument && frame.contentDocument.readyState === "complete") watch();
  }
})();`;

/** Enhance the one navigation rail into an inline disclosure on narrow screens. */
const NAVIGATION_DISCLOSURE = `(() => {
  const button = document.getElementById("docs-navigation-toggle");
  const navigation = document.getElementById("docs-navigation");
  if (!button || !navigation || !window.matchMedia) return;
  const narrow = window.matchMedia("(max-width: 900px)");
  let open = false;
  const update = () => {
    navigation.hidden = narrow.matches && !open;
    button.setAttribute("aria-expanded", String(!narrow.matches || open));
    document.body.setAttribute("data-docs-navigation-open", String(open));
  };
  button.addEventListener("click", () => {
    open = !open;
    update();
  });
  const escape = (event) => {
    if (event.key !== "Escape" || !narrow.matches || !open) return;
    event.preventDefault();
    open = false;
    update();
    button.focus();
  };
  navigation.addEventListener("keydown", escape);
  button.addEventListener("keydown", escape);
  narrow.addEventListener("change", () => {
    open = narrow.matches && navigation.contains(document.activeElement);
    update();
  });
  update();
  document.body.setAttribute("data-docs-navigation-enhanced", "true");
  button.hidden = false;
})();`;

/** The sidebar groups, in the order the rail shows them. The home item id is the empty path. */
function sidebarGroups(catalog: Catalog, packages: DocsPackage[]): NavListGroup[] {
  const groups: NavigationGroup[] = catalog.navigation;
  return [
    {
      label: "Start here",
      items: [
        { id: "", href: "/", label: "Home" },
        { id: "gallery", href: "/gallery/", label: "Component workbench" },
      ],
    },
    {
      label: "Packages",
      items: packages.map((entry) => ({
        id: entry.path,
        href: `/${entry.path}/`,
        label: entry.title,
      })),
    },
    ...groups.map((group) => ({
      label: group.label,
      items: group.entries.map((entry) => ({
        id: entry.path,
        href: entry.href,
        label: entry.label,
      })),
    })),
  ];
}

function Sidebar({
  catalog,
  packages,
  path,
}: {
  catalog: Catalog;
  packages: DocsPackage[];
  path: string;
}): Child {
  return (
    <aside className="docs-sidebar" id="docs-navigation" aria-label="Documentation navigation">
      <a className="docs-brand" href="/">
        <MeowlandMark />
        <strong>Meowland</strong>
        <span>docs</span>
      </a>
      <SearchInput
        className="docs-search"
        label="Filter navigation"
        placeholder="Filter navigation…"
      />
      <div className="docs-catalog-label">Documentation</div>
      <div className="docs-catalog" id="docs-catalog">
        <NavList label="Documentation" activeId={path} groups={sidebarGroups(catalog, packages)} />
        <p className="docs-catalog-empty" id="docs-catalog-empty" hidden>
          No navigation entries match that filter.
        </p>
      </div>
    </aside>
  );
}

function Document({
  theme,
  catalog,
  packages,
  path,
  title,
  description,
  trail,
  children,
}: DocumentOptions): Child {
  const depth = path ? path.split("/").length : 0;
  const documentTitle = title === SITE_NAME ? title : `${title} · ${SITE_NAME}`;
  return (
    <html lang="en" {...themeAttributes(theme)}>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={description ?? SITE_DESCRIPTION} />
        <link rel="icon" href={FAVICON} />
        <link rel="stylesheet" href={stylesheetHref(depth)} />
        <title>{documentTitle}</title>
      </head>
      <body>
        <div className="docs-shell">
          <div className="docs-mobile-bar">
            <a className="docs-mobile-brand" href="/">
              Meowland <span>docs</span>
            </a>
            <button
              className="docs-navigation-toggle"
              id="docs-navigation-toggle"
              type="button"
              aria-controls="docs-navigation"
              aria-expanded="false"
              hidden
            >
              <Icon name="menu" size={16} />
              Navigation
            </button>
          </div>
          <Sidebar catalog={catalog} packages={packages} path={path} />
          <div className="docs-main">
            <header className="docs-header">
              <Breadcrumb items={trail} label="Breadcrumb" />
              <a
                className="docs-header-link"
                href="/gallery/"
                title="Open the component workbench"
                aria-label="Open the component workbench"
              >
                <Icon name="external-link" size={16} />
              </a>
            </header>
            <main className={path === "" ? "docs-content docs-content-home" : "docs-content"}>
              <article className="docs-article">{children}</article>
              <footer className="docs-footer">
                <span>Meowland documentation</span>
                <span>
                  <a href="/llm.txt">llm.txt</a> · <a href="/agents.md">agents.md</a>
                </span>
              </footer>
            </main>
          </div>
        </div>
        <script dangerouslySetInnerHTML={{ __html: CATALOG_FILTER }} />
        <script dangerouslySetInnerHTML={{ __html: NAVIGATION_DISCLOSURE }} />
        <script dangerouslySetInnerHTML={{ __html: PREVIEW_FIT }} />
      </body>
    </html>
  );
}

/** Render one page document. */
export function renderDocument(options: DocumentOptions): string {
  return `<!doctype html>\n${renderToHtml(<Document {...options} />)}`;
}
