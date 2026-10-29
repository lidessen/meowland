import { themeAttributes, type ThemeDefinition } from "meowcss";
import "./runtime";
import { h, type Child } from "meowjsx";
import { renderToHtml } from "meowjsx/web";
import { Breadcrumb, NavList, SearchInput, type NavListGroup } from "meowtail";
import { Icon, IconSource, type IconSourceProps } from "meowtail/icons";
import { focusModalityScript } from "meowtail/web";
import {
  BookOpen,
  LayoutPanelLeft,
  Monitor,
  Moon,
  Palette,
  PawPrint,
  Sun,
} from "meowtail/icons/lucide";
import type { Catalog, NavigationGroup } from "./catalog";
import type { DocsPackage } from "./packages";
import {
  DOCS_APPEARANCE_STORE,
  DOCS_THEME_ATTRIBUTE,
  DOCS_THEME_STORE,
  DOCS_THEMES,
} from "./theme";

/** The name the site gives itself. */
export const SITE_NAME = "Meowland";

/** The one-line description the site uses in its metadata. */
export const SITE_DESCRIPTION =
  "A small UI capability library: a JSX runtime, a style system, a component library, a presentation engine, a workbench and a site generator.";

/** The light and dark variants of the site mark. */
export const LIGHT_LOGO = "meowland-logo-a.svg";
export const DARK_LOGO = "meowland-logo-c.svg";

function logoHref(depth: number, asset: string): string {
  return depth <= 0 ? `./${asset}` : `${"../".repeat(depth)}${asset}`;
}
const FAVICON = "/favicon.ico?v=4";

function SiteMark({ depth }: { depth: number }): Child {
  return [
    <img
      className="docs-logo-light"
      src={logoHref(depth, LIGHT_LOGO)}
      alt=""
      width="28"
      height="28"
    />,
    <img
      className="docs-logo-dark"
      src={logoHref(depth, DARK_LOGO)}
      alt=""
      width="28"
      height="28"
    />,
  ];
}

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

/**
 * The reader's appearance and theme choices, applied before the stylesheet paints so no page
 * flashes.
 */
const APPEARANCE_STORE = DOCS_APPEARANCE_STORE;
const THEME_STORE = DOCS_THEME_STORE;
const APPEARANCE_EARLY = `(() => {
  try {
    const choice = localStorage.getItem("${APPEARANCE_STORE}");
    if (choice === "light" || choice === "dark")
      document.documentElement.setAttribute("data-meowui-color-scheme", choice);
    const theme = localStorage.getItem("${THEME_STORE}");
    if (${JSON.stringify(DOCS_THEMES)}.includes(theme))
      document.documentElement.setAttribute("${DOCS_THEME_ATTRIBUTE}", theme);
  } catch {}
})();`;

/**
 * The appearance menu: one button opens the theme and scheme choices. Both persist for the reader.
 * The scheme reaches the live previews directly, since they share the site's origin; each preview
 * is a gallery canvas that mounts its theme once, so a preview showing another theme reloads with
 * the reader's choice in its `theme` parameter.
 */
const APPEARANCE_MENU = `(() => {
  const button = document.getElementById("docs-appearance");
  const panel = document.getElementById("docs-appearance-panel");
  if (!button || !panel) return;
  const names = { auto: "System", light: "Light", dark: "Dark" };
  const root = document.documentElement;
  const scheme = () => root.getAttribute("data-meowui-color-scheme") || "auto";
  const themes = { standard: "Standard", journal: "Journal", meow: "Meow" };
  const theme = () => {
    const choice = root.getAttribute("${DOCS_THEME_ATTRIBUTE}");
    return choice in themes ? choice : "standard";
  };
  const frames = () => document.querySelectorAll("iframe.docs-preview-frame");
  const paintScheme = (choice) => {
    for (const frame of frames()) {
      try {
        const doc = frame.contentDocument;
        if (doc && doc.documentElement) doc.documentElement.setAttribute("data-meowui-color-scheme", choice);
      } catch {}
    }
  };
  const paintTheme = (choice) => {
    for (const frame of frames()) {
      const url = new URL(frame.getAttribute("src"), location.href);
      if (url.searchParams.get("theme") === choice) continue;
      url.searchParams.set("theme", choice);
      frame.setAttribute("src", url.pathname + url.search);
    }
  };
  const show = () => {
    const choice = scheme();
    button.setAttribute("data-appearance", choice);
    button.title = "Appearance: " + themes[theme()] + ", " + names[choice];
    for (const input of panel.querySelectorAll("input")) {
      input.checked = input.value === (input.name === "docs-theme" ? theme() : choice);
    }
  };
  const open = (next) => {
    panel.hidden = !next;
    button.setAttribute("aria-expanded", String(next));
  };
  button.addEventListener("click", () => {
    open(panel.hidden);
    if (!panel.hidden) (panel.querySelector("input:checked") || panel.querySelector("input")).focus();
  });
  panel.addEventListener("change", (event) => {
    const input = event.target;
    if (input.name === "docs-theme") {
      if (input.value === "standard") root.removeAttribute("${DOCS_THEME_ATTRIBUTE}");
      else root.setAttribute("${DOCS_THEME_ATTRIBUTE}", input.value);
      try {
        if (input.value === "standard") localStorage.removeItem("${THEME_STORE}");
        else localStorage.setItem("${THEME_STORE}", input.value);
      } catch {}
      paintTheme(input.value);
    } else {
      root.setAttribute("data-meowui-color-scheme", input.value);
      try {
        if (input.value === "auto") localStorage.removeItem("${APPEARANCE_STORE}");
        else localStorage.setItem("${APPEARANCE_STORE}", input.value);
      } catch {}
      paintScheme(input.value);
    }
    show();
  });
  panel.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    open(false);
    button.focus();
  });
  document.addEventListener("pointerdown", (event) => {
    if (!panel.hidden && !button.parentElement.contains(event.target)) open(false);
  });
  panel.addEventListener("focusout", (event) => {
    if (!panel.hidden && !button.parentElement.contains(event.relatedTarget)) open(false);
  });
  // A story re-applies its theme as it mounts; keep the reader's scheme on each preview.
  const follow = (frame) => {
    let doc;
    try { doc = frame.contentDocument; } catch { return; }
    if (!doc || !doc.documentElement) return;
    const sync = () => {
      const choice = scheme();
      if (doc.documentElement.getAttribute("data-meowui-color-scheme") !== choice)
        doc.documentElement.setAttribute("data-meowui-color-scheme", choice);
    };
    new MutationObserver(sync).observe(doc.documentElement, {
      attributes: true,
      attributeFilter: ["data-meowui-color-scheme"],
    });
    sync();
  };
  for (const frame of frames()) {
    frame.addEventListener("load", () => follow(frame));
    if (frame.contentDocument && frame.contentDocument.readyState === "complete") follow(frame);
  }
  paintTheme(theme());
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
  for (const button of document.querySelectorAll(".docs-install-copy")) {
    const text = button.parentElement && button.parentElement.querySelector("span");
    if (!text) continue;
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(text.textContent || "");
        button.setAttribute("data-copied", "");
        button.setAttribute("aria-label", "Copied");
      } catch {
        button.setAttribute("aria-label", "Copy failed");
      }
      setTimeout(() => {
        button.removeAttribute("data-copied");
        button.setAttribute("aria-label", "Copy install command");
      }, 1600);
    });
    button.hidden = false;
  }
  document.documentElement.setAttribute("data-docs-code-actions", "");
})();`;

/**
 * Preview and Code tabs on each example. The page ships both panels; the script turns them into
 * tabs with the preview selected, so the source stays one click away instead of filling the page.
 */
const EXAMPLE_TABS = `(() => {
  let count = 0;
  for (const example of document.querySelectorAll("[data-docs-tabs]")) {
    const list = example.querySelector('[role="tablist"]');
    if (!list) continue;
    const tabs = Array.from(list.querySelectorAll('[role="tab"]'));
    const panels = tabs.map((tab) =>
      example.querySelector('[data-docs-panel="' + tab.getAttribute("data-docs-tab") + '"]'),
    );
    if (!tabs.length || panels.some((panel) => !panel)) continue;
    count += 1;
    tabs.forEach((tab, index) => {
      const panel = panels[index];
      tab.id = "docs-tab-" + count + "-" + index;
      panel.id = "docs-panel-" + count + "-" + index;
      tab.setAttribute("aria-controls", panel.id);
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tab.id);
    });
    const select = (selected, focus) => {
      tabs.forEach((tab, index) => {
        const on = index === selected;
        tab.setAttribute("aria-selected", String(on));
        tab.tabIndex = on ? 0 : -1;
        panels[index].hidden = !on;
      });
      if (focus) tabs[selected].focus();
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => select(index, false));
      tab.addEventListener("keydown", (event) => {
        const last = tabs.length - 1;
        const next =
          event.key === "ArrowRight" ? (index === last ? 0 : index + 1)
          : event.key === "ArrowLeft" ? (index === 0 ? last : index - 1)
          : event.key === "Home" ? 0
          : event.key === "End" ? last
          : -1;
        if (next < 0) return;
        event.preventDefault();
        select(next, true);
      });
    });
    select(0, false);
    list.hidden = false;
    example.setAttribute("data-docs-tabs", "ready");
  }
})();`;

/**
 * Site search: a dialog over the index the build writes. The index loads on first open, titles
 * outrank section names, which outrank descriptions and body text, and a result can land on the
 * section that matched.
 */
const SEARCH = `(() => {
  const open = document.getElementById("docs-search-open");
  const dialog = document.getElementById("docs-search-dialog");
  if (!open || !dialog || !dialog.showModal) return;
  const input = dialog.querySelector("input");
  const list = dialog.querySelector("ul");
  const empty = dialog.querySelector(".docs-search-empty");
  let index, active = 0, results = [];
  const load = () => (index ??= fetch("/search-index.json").then((r) => r.json()).catch(() => []));
  const snippet = (entry, term) => {
    const source = entry.description || entry.text;
    const at = source.toLowerCase().indexOf(term);
    if (at < 0) return source.slice(0, 110);
    const from = Math.max(0, at - 40);
    return (from > 0 ? "…" : "") + source.slice(from, from + 110);
  };
  const score = (entry, terms) => {
    let total = 0, section;
    const title = entry.title.toLowerCase();
    for (const term of terms) {
      let best = 0;
      if (title === term) best = 40;
      else if (title.startsWith(term)) best = 24;
      else if (title.includes(term)) best = 16;
      const hit = entry.sections.find((s) => s.title.toLowerCase().includes(term));
      if (hit && best < 8) { best = 8; section = hit; }
      if (!best && (entry.description + " " + entry.group).toLowerCase().includes(term)) best = 4;
      if (!best && entry.text.toLowerCase().includes(term)) best = 1;
      if (!best) return undefined;
      total += best;
    }
    return { entry, total, section };
  };
  const paint = () => {
    list.replaceChildren(...results.map((result, i) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = result.entry.url + (result.section ? "#" + result.section.id : "");
      link.id = "docs-search-result-" + i;
      link.setAttribute("role", "option");
      link.setAttribute("aria-selected", String(i === active));
      const head = document.createElement("span");
      head.className = "docs-search-title";
      head.textContent = result.entry.title + (result.section ? " › " + result.section.title : "");
      const meta = document.createElement("span");
      meta.className = "docs-search-meta";
      meta.textContent = [result.entry.group, result.snippet].filter(Boolean).join(" · ");
      link.append(head, meta);
      link.addEventListener("mousemove", () => { if (active !== i) { active = i; mark(); } });
      item.append(link);
      return item;
    }));
    empty.hidden = results.length > 0 || !input.value.trim();
    mark();
  };
  const mark = () => {
    list.querySelectorAll("a").forEach((link, i) => link.setAttribute("aria-selected", String(i === active)));
    const current = list.querySelector('[aria-selected="true"]');
    if (current) { input.setAttribute("aria-activedescendant", current.id); current.scrollIntoView({ block: "nearest" }); }
    else input.removeAttribute("aria-activedescendant");
  };
  const search = async () => {
    const entries = await load();
    const terms = input.value.toLowerCase().split(/\\s+/).filter(Boolean);
    results = terms.length
      ? entries.map((entry) => score(entry, terms)).filter(Boolean)
          .sort((a, b) => b.total - a.total).slice(0, 12)
          .map((r) => ({ ...r, snippet: snippet(r.entry, terms[0]) }))
      : [];
    active = 0;
    paint();
  };
  const show = () => {
    if (dialog.open) return;
    dialog.showModal();
    input.select();
    load();
  };
  open.addEventListener("click", show);
  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      dialog.open ? dialog.close() : show();
    }
  });
  input.addEventListener("input", search);
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!results.length) return;
      active = (active + (event.key === "ArrowDown" ? 1 : results.length - 1)) % results.length;
      mark();
    } else if (event.key === "Enter" && results[active]) {
      event.preventDefault();
      list.querySelectorAll("a")[active].click();
    }
  });
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  open.hidden = false;
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
        { id: "components", href: "/components/", label: "Components" },
        { id: "gallery", href: "/gallery/", label: "Component playground" },
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
 * returning to the rail. The playground is a separate app, not a page in the sequence.
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
        <SiteMark depth={path ? path.split("/").length : 0} />
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

/** One choice in the appearance menu: a radio row with its icon and name. */
function AppearanceChoice({
  group,
  value,
  icon,
  children,
}: {
  group: string;
  value: string;
  icon: IconSourceProps["source"];
  children: Child;
}): Child {
  return (
    <label>
      <input type="radio" name={group} value={value} />
      <IconSource source={icon} size={14} />
      <span>{children}</span>
    </label>
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
        {/* Focus rings follow the keyboard, not the browser's guess after a tap. */}
        <script dangerouslySetInnerHTML={{ __html: focusModalityScript }} />
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
              <SiteMark depth={depth} />
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
              <button className="docs-search-open" id="docs-search-open" type="button" hidden>
                <Icon name="search" size={14} />
                <span>Search</span>
                <kbd aria-hidden="true">⌘K</kbd>
              </button>
              <div className="docs-appearance-menu">
                <button
                  className="docs-appearance"
                  id="docs-appearance"
                  type="button"
                  aria-label="Appearance"
                  aria-expanded="false"
                  aria-controls="docs-appearance-panel"
                  hidden
                >
                  <IconSource source={Monitor} size={16} className="docs-appearance-auto" />
                  <IconSource source={Sun} size={16} className="docs-appearance-light" />
                  <IconSource source={Moon} size={16} className="docs-appearance-dark" />
                </button>
                <div className="docs-appearance-panel" id="docs-appearance-panel" hidden>
                  <fieldset>
                    <legend>Theme</legend>
                    <AppearanceChoice group="docs-theme" value="standard" icon={Palette}>
                      Standard
                    </AppearanceChoice>
                    <AppearanceChoice group="docs-theme" value="journal" icon={BookOpen}>
                      Journal
                    </AppearanceChoice>
                    <AppearanceChoice group="docs-theme" value="meow" icon={PawPrint}>
                      Meow
                    </AppearanceChoice>
                  </fieldset>
                  <fieldset>
                    <legend>Appearance</legend>
                    <AppearanceChoice group="docs-scheme" value="auto" icon={Monitor}>
                      System
                    </AppearanceChoice>
                    <AppearanceChoice group="docs-scheme" value="light" icon={Sun}>
                      Light
                    </AppearanceChoice>
                    <AppearanceChoice group="docs-scheme" value="dark" icon={Moon}>
                      Dark
                    </AppearanceChoice>
                  </fieldset>
                </div>
              </div>
              <a className="docs-header-link" href="/gallery/">
                <IconSource source={LayoutPanelLeft} size={14} />
                <span>Playground</span>
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
        <dialog
          className="docs-search-dialog"
          id="docs-search-dialog"
          aria-label="Search the documentation"
        >
          <div className="docs-search-field">
            <Icon name="search" size={16} />
            {/* A text input, so Escape closes the dialog instead of clearing a search field. */}
            <input
              type="text"
              enterKeyHint="search"
              placeholder="Search components, packages and guides…"
              aria-label="Search the documentation"
              role="combobox"
              aria-expanded="true"
              aria-controls="docs-search-results"
              autoComplete="off"
              spellCheck={false}
            />
            <kbd aria-hidden="true">Esc</kbd>
          </div>
          <ul className="docs-search-results" id="docs-search-results" role="listbox" />
          <p className="docs-search-empty" hidden>
            No pages match. Try a component name or a word from its description.
          </p>
        </dialog>
        <script dangerouslySetInnerHTML={{ __html: CATALOG_FILTER }} />
        <script dangerouslySetInnerHTML={{ __html: NAVIGATION_DISCLOSURE }} />
        <script dangerouslySetInnerHTML={{ __html: PREVIEW_FIT }} />
        <script dangerouslySetInnerHTML={{ __html: APPEARANCE_MENU }} />
        <script dangerouslySetInnerHTML={{ __html: FILTER_SHORTCUT }} />
        <script dangerouslySetInnerHTML={{ __html: EXAMPLE_TABS }} />
        <script dangerouslySetInnerHTML={{ __html: CODE_ACTIONS }} />
        <script dangerouslySetInnerHTML={{ __html: SEARCH }} />
      </body>
    </html>
  );
}

/** Render one page document. */
export function renderDocument(options: DocumentOptions): string {
  return `<!doctype html>\n${renderToHtml(<Document {...options} />)}`;
}
