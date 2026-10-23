import { themeAttributes, type ThemeDefinition } from "meowcss";
import "./runtime";
import { h, type Child } from "meowjsx";
import { renderToHtml } from "meowjsx/web";
import { Breadcrumb, NavList, SearchInput, type NavListGroup } from "meowtail";
import { Icon, IconSource, MeowlandMark } from "meowtail/icons";
import { Monitor, Moon, Sun } from "meowtail/icons/lucide";
import type { Catalog, NavigationGroup } from "./catalog";
import type { DocsPackage } from "./packages";

/** The name the site gives itself. */
export const SITE_NAME = "Meowland";

/** The one-line description the site uses in its metadata. */
export const SITE_DESCRIPTION =
  "A small UI capability library: a JSX runtime, a style system, a component library, a presentation engine, a workbench and a site generator.";

/** The site mark, inlined so the site has no extra asset request: the Meowland silhouette on a dark rounded square. */
const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='24' fill='%230f1115'/%3E%3Cpath transform='translate(18 17) scale(0.64)' fill='%23ffffff' fill-rule='evenodd' d='M17.5 42C15.6 34.5 16.8 25.8 19.8 19.4C21.4 16.6 24.6 16.4 26.6 18.9C30.4 23.4 35.2 26.4 40.4 28.4C46.8 26.2 53.6 26.1 60 28.2C65.2 26.2 69.8 23.1 73.4 18.6C75.4 16.1 78.8 16.3 80.3 19.3C83.2 25.8 83 35 82 42.5C87 47.5 89.8 53.2 90.3 60.2C90.6 74.5 79 86 62.4 87.5C55 88.3 45 88.2 38 87.1C20.6 85.2 9.5 73.4 10.2 59C10.4 52.6 13.2 47 17.5 42ZM26.5 52.5C30 47.5 38.5 47.8 43.5 52.8C41.5 59 34 62 28.6 59C26 57.5 25 55 26.5 52.5ZM56.5 53C61.5 48 70 47.6 73.5 52.4C75 55 74 57.6 71.4 59.1C66 62 58.5 59 56.5 53Z'/%3E%3C/svg%3E";

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

/** The reader's appearance choice, applied before the stylesheet paints so no page flashes. */
const APPEARANCE_STORE = "meowland-docs-appearance";
const APPEARANCE_EARLY = `(() => {
  try {
    const choice = localStorage.getItem("${APPEARANCE_STORE}");
    if (choice === "light" || choice === "dark")
      document.documentElement.setAttribute("data-meowui-color-scheme", choice);
  } catch {}
})();`;

/**
 * Cycle the appearance: system, light, dark. The choice persists for the reader and reaches the
 * live previews too, since they share the site's origin.
 */
const APPEARANCE_SWITCH = `(() => {
  const button = document.getElementById("docs-appearance");
  if (!button) return;
  const order = ["auto", "light", "dark"];
  const names = { auto: "System", light: "Light", dark: "Dark" };
  const root = document.documentElement;
  const current = () => root.getAttribute("data-meowui-color-scheme") || "auto";
  const paintFrames = (choice) => {
    for (const frame of document.querySelectorAll("iframe.docs-preview-frame")) {
      try {
        const doc = frame.contentDocument;
        if (doc && doc.documentElement) doc.documentElement.setAttribute("data-meowui-color-scheme", choice);
      } catch {}
    }
  };
  const show = () => {
    const choice = current();
    button.setAttribute("data-appearance", choice);
    button.setAttribute("aria-label", "Appearance: " + names[choice]);
    button.title = "Appearance: " + names[choice];
  };
  button.addEventListener("click", () => {
    const next = order[(order.indexOf(current()) + 1) % order.length];
    root.setAttribute("data-meowui-color-scheme", next);
    try {
      if (next === "auto") localStorage.removeItem("${APPEARANCE_STORE}");
      else localStorage.setItem("${APPEARANCE_STORE}", next);
    } catch {}
    paintFrames(next);
    show();
  });
  // A story re-applies its theme as it mounts; keep the reader's choice on each preview.
  const follow = (frame) => {
    let doc;
    try { doc = frame.contentDocument; } catch { return; }
    if (!doc || !doc.documentElement) return;
    const sync = () => {
      const choice = current();
      if (doc.documentElement.getAttribute("data-meowui-color-scheme") !== choice)
        doc.documentElement.setAttribute("data-meowui-color-scheme", choice);
    };
    new MutationObserver(sync).observe(doc.documentElement, {
      attributes: true,
      attributeFilter: ["data-meowui-color-scheme"],
    });
    sync();
  };
  for (const frame of document.querySelectorAll("iframe.docs-preview-frame")) {
    frame.addEventListener("load", () => follow(frame));
    if (frame.contentDocument && frame.contentDocument.readyState === "complete") follow(frame);
  }
  show();
  button.hidden = false;
})();`;

/**
 * Wire each static code surface's own Soft wrap and Copy code buttons, which the library renders
 * but cannot run without its runtime. Copy reads the code's text, so it copies what the reader sees.
 */
const CODE_ACTIONS = `(() => {
  const blocks = document.querySelectorAll('.docs-article [data-meowui-part="code-block/root"]');
  for (const block of blocks) {
    const content = block.querySelector('[data-meowui-part="code-block/content"]');
    const code = block.querySelector('[data-meowui-part="code-block/code"]');
    const buttons = block.querySelectorAll('[data-meowui-part="code-block/actions"] button');
    const [wrap, copy] = buttons;
    if (!content || !code || !wrap || !copy) continue;
    wrap.addEventListener("click", () => {
      const next = content.getAttribute("data-wrap") === "true" ? "false" : "true";
      content.setAttribute("data-wrap", next);
      wrap.setAttribute("aria-pressed", next);
    });
    const label = copy.textContent;
    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(code.textContent || "");
        copy.textContent = "Copied";
      } catch {
        copy.textContent = "Copy failed";
      }
      setTimeout(() => { copy.textContent = label; }, 1600);
    });
  }
  document.documentElement.setAttribute("data-docs-code-actions", "");
})();`;

/** Press "/" anywhere outside a field to filter the navigation. */
const FILTER_SHORTCUT = `(() => {
  const input = document.querySelector('[data-meowui-part="search-input/control"]');
  if (!input) return;
  document.addEventListener("keydown", (event) => {
    if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target;
    if (target instanceof HTMLElement && target.closest("input, textarea, select, [contenteditable]")) return;
    event.preventDefault();
    input.focus();
  });
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

/**
 * The pages before and after this one in sidebar order, so a reader can keep going without
 * returning to the rail. The workbench is a separate app, not a page in the sequence.
 */
function Pager({
  catalog,
  packages,
  path,
}: {
  catalog: Catalog;
  packages: DocsPackage[];
  path: string;
}): Child {
  const pages = sidebarGroups(catalog, packages).flatMap((group) =>
    group.items
      .filter((item) => item.id !== "gallery")
      .map((item) => ({ href: item.href!, label: String(item.label), group: group.label })),
  );
  const index = pages.findIndex((page) => page.href === (path ? `/${path}/` : "/"));
  if (index < 0) return null;
  const previous = pages[index - 1];
  const next = pages[index + 1];
  if (!previous && !next) return null;
  return (
    <nav className="docs-pager" aria-label="Pages">
      {previous ? (
        <a className="docs-pager-link" href={previous.href} rel="prev">
          <span className="docs-pager-direction">
            <Icon name="arrow-left" size={14} />
            Previous
          </span>
          <span className="docs-pager-title">{previous.label}</span>
        </a>
      ) : (
        <span />
      )}
      {next ? (
        <a className="docs-pager-link docs-pager-next" href={next.href} rel="next">
          <span className="docs-pager-direction">
            Next
            <Icon name="arrow-right" size={14} />
          </span>
          <span className="docs-pager-title">{next.label}</span>
        </a>
      ) : null}
    </nav>
  );
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
      <div className="docs-search-wrap">
        <SearchInput
          className="docs-search"
          label="Filter navigation"
          placeholder="Filter navigation…"
        />
        <kbd className="docs-search-key" aria-hidden="true">
          /
        </kbd>
      </div>
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
        <script dangerouslySetInnerHTML={{ __html: APPEARANCE_EARLY }} />
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
              <MeowlandMark />
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
              <button
                className="docs-appearance"
                id="docs-appearance"
                type="button"
                aria-label="Appearance: System"
                hidden
              >
                <IconSource source={Monitor} size={16} className="docs-appearance-auto" />
                <IconSource source={Sun} size={16} className="docs-appearance-light" />
                <IconSource source={Moon} size={16} className="docs-appearance-dark" />
              </button>
              <a className="docs-header-link" href="/gallery/">
                Workbench
                <Icon name="arrow-up-right" size={14} />
              </a>
            </header>
            <main className={path === "" ? "docs-content docs-content-home" : "docs-content"}>
              <article className="docs-article">{children}</article>
              <Pager catalog={catalog} packages={packages} path={path} />
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
        <script dangerouslySetInnerHTML={{ __html: APPEARANCE_SWITCH }} />
        <script dangerouslySetInnerHTML={{ __html: FILTER_SHORTCUT }} />
        <script dangerouslySetInnerHTML={{ __html: CODE_ACTIONS }} />
      </body>
    </html>
  );
}

/** Render one page document. */
export function renderDocument(options: DocumentOptions): string {
  return `<!doctype html>\n${renderToHtml(<Document {...options} />)}`;
}
