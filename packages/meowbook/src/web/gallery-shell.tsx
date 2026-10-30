import { h, createRuntime, keyed, type Child, type ComponentRenderContext } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { batch as flush, derived, mapSignal, signal } from "meowjsx/signal";
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
import { installFocusModality } from "meowtail/web";
import { applyTheme } from "meowcss/web";
import type { GallerySettings, StoryEntry } from "../types";
import { chromeThemeAttribute } from "./gallery.styles";

type StoryInfo = StoryEntry & {
  id: string;
  title: string;
  group: string;
  description: string;
  covers: string[];
};
const widths = ["fluid", "390", "768", "1100"];
const schemes = ["auto", "light", "dark"] as const;
type Scheme = (typeof schemes)[number];
const narrowQuery = "(max-width: 640px)";
const measurementHelp =
  "Click a canvas element to see its actual values; turn annotations off to restore normal clicks.";
const spacingHelp =
  "Click an element to see its spacing; green is padding, orange is margin (top, right, bottom, left); gap appears in the values. Turn annotations off to restore normal clicks.";

function read(key: string | undefined) {
  if (!key) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
/** The first choice is the default, so it is stored by removing the key, as a host site does. */
function write(key: string | undefined, value: string, fallback: string) {
  if (!key) return;
  try {
    if (value === fallback) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* The choice still applies to this page. */
  }
}
function componentKey(story: StoryInfo) {
  return JSON.stringify([story.group, story.component ?? story.id]);
}
const storyHref = (story: StoryInfo, width: string) =>
  `?story=${encodeURIComponent(story.id)}&width=${width}`;
const plainClick = (event: MouseEvent) =>
  !(event.ctrlKey || event.metaKey || event.shiftKey || event.altKey);

/** The name a component's row, header and tab show: the host's label, else component, else title. */
function rowName(story: StoryInfo, settings: GallerySettings): string {
  return settings.componentLabels?.[story.id] ?? story.component ?? story.title;
}

/** The catalog for one search: groups in their configured order, one row per component. */
function catalogView(
  stories: readonly StoryInfo[],
  query: string,
  active: string,
  width: string,
  settings: GallerySettings,
) {
  const needle = query.trim().toLocaleLowerCase();
  const matches = stories.filter((story) =>
    [
      story.group,
      settings.componentLabels?.[story.id],
      story.component,
      story.variant,
      story.title,
      ...story.covers,
    ]
      .join(" ")
      .toLocaleLowerCase()
      .includes(needle),
  );
  const components = new Map<string, StoryInfo[]>();
  for (const story of matches) {
    const key = componentKey(story);
    components.set(key, [...(components.get(key) ?? []), story]);
  }
  const total = new Set(stories.map(componentKey)).size;
  const groupOrders = new Map<string, number>();
  for (const story of stories) {
    if (story.groupOrder !== undefined)
      groupOrders.set(
        story.group,
        Math.min(groupOrders.get(story.group) ?? Infinity, story.groupOrder),
      );
  }
  const names = [...new Set(matches.map((story) => story.group))];
  names.sort((a, b) => (groupOrders.get(a) ?? Infinity) - (groupOrders.get(b) ?? Infinity));
  const groups: NavListGroup[] = names.map((group) => {
    const entries = [...components.values()].filter((items) => items[0]!.group === group);
    entries.sort((a, b) => rowName(a[0]!, settings).localeCompare(rowName(b[0]!, settings)));
    return {
      label: group,
      items: entries.map((items) => {
        // The row keeps pointing at the active scenario when it belongs to the component;
        // otherwise it opens the component's first scenario.
        const story = items.find((item) => item.id === active) ?? items[0]!;
        return {
          id: componentKey(items[0]!),
          label: rowName(story, settings),
          href: storyHref(story, width),
        };
      }),
    };
  });
  const current = stories.find((story) => story.id === active);
  return {
    groups,
    activeId: current ? componentKey(current) : "",
    count: needle ? `${components.size} / ${total}` : String(total),
    empty: `No results for "${query.trim()}". Try a component name or clear the search.`,
  };
}

interface GalleryProps {
  /** What the host site set in the config; empty keeps Meowbook's own chrome. Fixed for the mount. */
  settings: GallerySettings;
  /** The story index; the gallery shows its loading copy until it settles. */
  manifest: Promise<readonly StoryEntry[]>;
}

/**
 * The workbench. Its state lives in the Signals below and the markup binds them; the effects only
 * reach what has no prop: the document root, history, storage and the canvas document.
 */
function Gallery({ settings, manifest }: GalleryProps, context: ComponentRenderContext) {
  const params = new URL(location.href).searchParams;
  const appearance = settings.appearance;
  const themes = appearance?.themes ?? [];
  const schemeKey = appearance?.schemeStorageKey ?? "meowbook:color-scheme";
  const readScheme = (): Scheme => {
    const saved = read(schemeKey);
    return schemes.includes(saved as Scheme) ? (saved as Scheme) : "auto";
  };
  const readTheme = () => {
    const saved = read(appearance?.themeStorageKey);
    return themes.find((choice) => choice.value === saved)?.value ?? themes[0]?.value;
  };

  const stories = signal<StoryInfo[]>([]);
  const loaded = signal(false);
  const active = signal(params.get("story") ?? "");
  const width = signal(widths.includes(params.get("width") ?? "") ? params.get("width")! : "fluid");
  const query = signal("");
  const scheme = signal(readScheme());
  const theme = signal(readTheme());
  /** Each load is a new canvas: a fresh WindowProxy cannot deliver a reset document's messages. */
  const generation = signal(0);
  const events = signal<readonly { id: number; message: string }[]>([]);
  const inspection = signal<{ text: string; warning?: boolean }>({
    text: "Waiting for the canvas…",
  });
  const measureMode = signal("off");
  const placeholder = signal(false);
  const measured = signal<readonly (readonly [string, string])[]>([]);
  const batchRunning = signal(false);
  const batchStatus = signal("Check all scenarios at the current width.");
  const batchResults = signal<readonly { story: StoryInfo; width: string; issues: string[] }[]>([]);
  const catalogOpen = signal(false);
  const narrow = signal(matchMedia(narrowQuery).matches);
  const frameWidth = signal(0);

  let frame: HTMLIFrameElement | undefined;
  let title: HTMLElement | undefined;
  let search: HTMLInputElement | undefined;
  let toggle: HTMLElement | undefined;
  let batch: AbortController | undefined;
  let renderError = false;
  let nextEvent = 0;

  const current = derived(() => stories.value.find((story) => story.id === active.value));
  const covered = derived(() => catalogOpen.value && narrow.value);
  const catalog = derived(() =>
    catalogView(stories.value, query.value, active.value, width.value, settings),
  );

  /**
   * The one canvas address. Inside the gallery the canvas is embedded: the gallery's chrome carries
   * the theme and the scheme, so the environment draws no controls of its own. The standalone link
   * leaves the canvas its own controls.
   */
  const canvasURL = (id: string, embedded = true) => {
    const address = new URLSearchParams();
    if (id) address.set("story", id);
    if (embedded) {
      address.set("embedded", "1");
      address.set("scheme", scheme.value);
    }
    if (theme.value) address.set("theme", theme.value);
    const text = address.toString();
    return `./canvas.html${text ? `?${text}` : ""}`;
  };
  const updateURL = (replace = false) => {
    const url = new URL(location.href);
    if (active.value) url.searchParams.set("story", active.value);
    else url.searchParams.delete("story");
    url.searchParams.set("width", width.value);
    if (replace) history.replaceState(null, "", url);
    else history.pushState(null, "", url);
  };
  const post = (target: HTMLIFrameElement | undefined, data: Record<string, unknown>) =>
    target?.contentWindow?.postMessage({ channel: "meowbook", ...data }, location.origin);
  const syncMeasurements = () =>
    post(frame, { type: "measure", mode: measureMode.value, placeholder: placeholder.value });
  const log = (message: string) => {
    events.value = [{ id: nextEvent++, message }, ...events.value].slice(0, 12);
  };
  const load = () => {
    measured.value = [];
    renderError = false;
    events.value = [];
    inspection.value = { text: "Rendering…" };
    generation.value++;
  };
  const open = (story: StoryInfo, nextWidth = width.value) => {
    active.value = story.id;
    width.value = nextWidth;
    updateURL();
    load();
  };
  /** Applied at once, so the focus that follows lands on an element that is shown and not inert. */
  const setCatalogOpen = (next: boolean) =>
    flush(() => {
      catalogOpen.value = next;
    });
  /**
   * Focus follows a choice so a keyboard reader lands on the result; after a tap the browser is
   * told not to ring it, since the tap itself was the cue.
   */
  const moveFocus = (target: HTMLElement | undefined, event?: MouseEvent) =>
    target?.focus({ preventScroll: true, focusVisible: !event?.detail } as FocusOptions);
  const choose = (story: StoryInfo, event: MouseEvent) => {
    open(story);
    setCatalogOpen(false);
    moveFocus(title, event);
  };

  // One scheme paints the tool and the story, so a dark story never sits in light chrome; the
  // chrome wears the chosen theme's Meowtail counterpart, so tool and story agree.
  context.effect(() => {
    const root = document.documentElement;
    root.dataset.meowuiColorScheme = scheme.value;
    const chrome = themes.find((item) => item.value === theme.value)?.chrome;
    if (chrome && chrome !== "standard") root.setAttribute(chromeThemeAttribute, chrome);
    else root.removeAttribute(chromeThemeAttribute);
  });
  context.effect(() => {
    const story = current.value;
    const name = settings.brand?.name ?? "Meowbook";
    document.title = story ? `${rowName(story, settings)} · ${name}` : name;
  });
  const canvasRoot = () => {
    try {
      return frame?.contentDocument?.documentElement ?? null;
    } catch {
      return null;
    }
  };
  // The open canvas follows a new scheme in place, so its input survives.
  context.effect(() => {
    const choice = scheme.value;
    const root = canvasRoot();
    if (root && root.dataset.meowuiColorScheme !== choice) root.dataset.meowuiColorScheme = choice;
  });
  /** An environment can re-apply its theme while the story mounts; the reader's scheme stays. */
  const followScheme = (target: HTMLIFrameElement) => {
    target.addEventListener("load", () => {
      const root = canvasRoot();
      if (target !== frame || !root) return;
      const keep = () => {
        if (root.dataset.meowuiColorScheme !== scheme.value)
          root.dataset.meowuiColorScheme = scheme.value;
      };
      new MutationObserver(keep).observe(root, {
        attributes: true,
        attributeFilter: ["data-meowui-color-scheme"],
      });
      keep();
    });
  };

  const onMessage = (event: MessageEvent) => {
    if (!frame || event.source !== frame.contentWindow || event.origin !== location.origin) return;
    const data = event.data;
    if (!data || data.channel !== "meowbook" || data.story !== active.value) return;
    if (data.type === "measurement") {
      const detail = data.detail;
      measured.value =
        detail &&
        ["name", "size", "typography", "spacing"].every((key) => typeof detail[key] === "string")
          ? [
              ["Element", detail.name],
              ["Width × height", detail.size],
              ["Font size / line height", detail.typography],
              ["Spacing", detail.spacing],
            ]
          : [];
    }
    if (data.type === "ready") syncMeasurements();
    if (data.type === "metadata" && data.entry) {
      // The canvas metadata is the story module's own metadata; keep the manifest's
      // group fallback so a story without an explicit group stays in its catalog group.
      stories.value = stories.value.map((entry) =>
        entry.id === active.value
          ? {
              ...entry,
              ...data.entry,
              group: data.entry.group ?? entry.group,
              covers: data.entry.covers ?? [],
            }
          : entry,
      );
      if (!active.value && typeof data.active === "string") {
        active.value = data.active;
        updateURL(true);
      }
    } else if (data.type === "event" && typeof data.message === "string") log(data.message);
    else if (data.type === "inspection" && Array.isArray(data.issues)) {
      if (renderError) return;
      const issues = data.issues as string[];
      inspection.value = {
        text: issues.length
          ? `${issues.length} items with notes · ${data.width}px`
          : `No basic check issues found · ${data.width}px`,
        warning: issues.length > 0,
      };
      for (const issue of issues) log(issue);
    } else if (data.type === "error" && typeof data.message === "string") {
      renderError = true;
      inspection.value = { text: "Sample render error", warning: true };
      log(data.message);
    }
  };

  /**
   * Each sample gets a fresh, offscreen document; its response cannot be confused with another
   * load. The probe is an instrument outside the workbench's markup, so it is created directly.
   */
  const inspectStory = (story: StoryInfo, pixels: number, signal: AbortSignal) =>
    new Promise<string[] | null>((resolve) => {
      const probe = document.createElement("iframe");
      probe.className = "workshop-batch-canvas";
      probe.title = `Background check: ${story.title}`;
      probe.setAttribute("aria-hidden", "true");
      probe.tabIndex = -1;
      probe.inert = true;
      probe.style.width = `${pixels}px`;
      let finished = false;
      let requested = false;
      const finish = (issues: string[] | null) => {
        if (finished) return;
        finished = true;
        window.removeEventListener("message", receive);
        signal.removeEventListener("abort", cancel);
        probe.remove();
        resolve(issues);
      };
      const cancel = () => finish(null);
      const receive = (event: MessageEvent) => {
        if (event.source !== probe.contentWindow || event.origin !== location.origin) return;
        const data = event.data;
        if (!data || data.channel !== "meowbook" || data.story !== story.id) return;
        if (data.type === "ready") {
          requested = true;
          post(probe, { type: "inspect" });
        }
        if (data.type === "error" && typeof data.message === "string")
          finish([`Render error: ${data.message}`]);
        else if (requested && data.type === "inspection" && Array.isArray(data.issues))
          finish(
            data.issues.filter((issue: unknown): issue is string => typeof issue === "string"),
          );
      };
      window.addEventListener("message", receive);
      signal.addEventListener("abort", cancel, { once: true });
      probe.src = canvasURL(story.id);
      if (signal.aborted) {
        cancel();
        return;
      }
      document.body.append(probe);
    });
  const inspectAll = async () => {
    if (batch || !stories.value.length) return;
    const controller = new AbortController();
    batch = controller;
    batchRunning.value = true;
    const queue = [...stories.value];
    const selectedWidth = width.value;
    const pixels = Math.max(1, Math.round(frame?.clientWidth ?? 0));
    batchResults.value = [];
    let completed = 0;
    let passed = 0;
    try {
      for (const story of queue) {
        batchStatus.value = `Checking ${completed + 1}/${queue.length} · ${pixels}px · ${story.title}`;
        const issues = await inspectStory(story, pixels, controller.signal);
        if (issues === null) break;
        completed++;
        if (!issues.length) passed++;
        else batchResults.value = [...batchResults.value, { story, width: selectedWidth, issues }];
      }
      batchStatus.value = `${controller.signal.aborted ? "Canceled" : "Check complete"} · ${pixels}px · ${completed}/${queue.length} checked, ${passed} items without basic issues, ${completed - passed} items with notes`;
    } finally {
      batch = undefined;
      batchRunning.value = false;
    }
  };

  const onStorage = (event: StorageEvent) => {
    // A choice made in the host site's other tabs reaches this one.
    if (event.key === schemeKey) scheme.value = readScheme();
    else if (event.key && event.key === appearance?.themeStorageKey) {
      theme.value = readTheme();
      load();
    }
  };
  const onPopState = () => {
    const query = new URL(location.href).searchParams;
    active.value = query.get("story") ?? "";
    width.value = widths.includes(query.get("width") ?? "") ? query.get("width")! : "fluid";
    load();
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return;
    if (catalogOpen.value) {
      setCatalogOpen(false);
      moveFocus(toggle);
    } else if (document.activeElement === search && query.value) query.value = "";
  };
  const media = matchMedia(narrowQuery);
  const onMedia = () => {
    narrow.value = media.matches;
    setCatalogOpen(false);
  };
  const onPageHide = () => batch?.abort();
  window.addEventListener("message", onMessage);
  window.addEventListener("storage", onStorage);
  window.addEventListener("popstate", onPopState);
  window.addEventListener("pagehide", onPageHide);
  document.addEventListener("keydown", onKeyDown);
  media.addEventListener("change", onMedia);
  context.onCleanup(() => {
    window.removeEventListener("message", onMessage);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("popstate", onPopState);
    window.removeEventListener("pagehide", onPageHide);
    document.removeEventListener("keydown", onKeyDown);
    media.removeEventListener("change", onMedia);
    batch?.abort();
  });

  manifest.then(
    (entries) => {
      stories.value = entries.map((entry) => ({
        ...entry,
        group: entry.group ?? "Components",
        description: entry.description ?? "",
        covers: [...(entry.covers ?? [])],
      }));
      if (!active.value) active.value = stories.value[0]?.id ?? "";
      loaded.value = true;
      updateURL(true);
      load();
    },
    (error) => {
      inspection.value = { text: String(error) };
    },
  );

  const { name, tag = "UI", logo, href } = settings.brand ?? {};
  const label = (text: (story: StoryInfo | undefined) => string, before: string) =>
    derived(() => (loaded.value ? text(current.value) : before));
  const componentName = (story: StoryInfo | undefined) =>
    story ? rowName(story, settings) : "Sample not found";
  const siblings = derived(() => {
    const story = current.value;
    return story ? stories.value.filter((item) => componentKey(item) === componentKey(story)) : [];
  });
  const docsLink = derived(() => {
    const story = current.value;
    return story ? settings.docsLinks?.[story.id] : undefined;
  });
  const marks: Child =
    logo === undefined ? (
      <span className="workshop-brand-mark">
        <Icon name="notebook-tabs" size={18} />
      </span>
    ) : (
      // A pair of marks shows the one for the current scheme; the stylesheet chooses.
      (typeof logo === "string"
        ? [["", logo]]
        : [
            ["light", logo.light],
            ["dark", logo.dark],
          ]
      ).map(([scheme, src]) => (
        <img
          src={src}
          alt=""
          width={28}
          height={28}
          className={scheme ? `workshop-logo-${scheme}` : undefined}
        />
      ))
    );
  const radio = (group: "gallery-theme" | "gallery-scheme", value: string, choice: Child) => (
    <label>
      <input
        type="radio"
        name={group}
        value={value}
        checked={derived(() => (group === "gallery-theme" ? theme.value : scheme.value) === value)}
        onChange={() => {
          if (group === "gallery-theme") {
            write(appearance?.themeStorageKey, value, themes[0]?.value ?? "");
            theme.value = value;
            // An environment mounts its theme once, so a new theme is a new canvas.
            load();
          } else {
            write(schemeKey, value, "auto");
            scheme.value = value as Scheme;
          }
        }}
      />
      {choice}
    </label>
  );

  return (
    <div className={mapSignal(catalogOpen, (open) => ["workshop-shell", open && "catalog-open"])}>
      <aside className="workshop-sidebar" id="sidebar">
        <a className="workshop-brand" id="brand" href={href ?? "./"}>
          {marks}
          <strong id="brand-name">{name ?? "Meowbook"}</strong>
          <span id="brand-label" hidden={!tag}>
            {tag}
          </span>
        </a>
        <SearchInput
          className="workshop-search"
          id="search"
          label="Find components"
          placeholder="Find components…"
          value={query}
          onInput={(event) => (query.value = (event.target as HTMLInputElement).value)}
          ref={(element: HTMLInputElement) => {
            search = element;
          }}
        />
        <div className="catalog-label">
          Components <span id="story-count">{mapSignal(catalog, (view) => view.count)}</span>
        </div>
        {/* One delegated handler keeps plain catalog clicks inside the workbench; modified clicks
            keep the anchor's own navigation to the scenario URL. */}
        <div
          id="catalog"
          onClick={(event: MouseEvent) => {
            const target = event.target;
            const anchor = target instanceof Element ? target.closest("a") : null;
            if (!anchor || !plainClick(event)) return;
            const id = new URL(anchor.href).searchParams.get("story");
            const story = stories.value.find((item) => item.id === id);
            if (!story) return;
            event.preventDefault();
            choose(story, event);
          }}
        >
          {/* NavList takes its groups for the mount, so each catalog state is a new list. */}
          {keyed(
            derived(() => [loaded.value ? catalog.value : undefined]),
            (view) => JSON.stringify(view ?? null),
            (view) => {
              const { groups, activeId, empty } = view.value ?? {};
              if (!groups) return <p className="catalog-empty">Loading samples…</p>;
              return groups.length ? (
                <NavList
                  className="workshop-catalog"
                  label="Component samples"
                  groups={groups}
                  activeId={activeId}
                />
              ) : (
                <p className="catalog-empty">{empty}</p>
              );
            },
          )}
        </div>
      </aside>
      <button
        id="catalog-backdrop"
        aria-label="Close component catalog"
        tabindex={-1}
        hidden={mapSignal(catalogOpen, (open) => !open)}
        onClick={(event: MouseEvent) => {
          setCatalogOpen(false);
          moveFocus(toggle, event);
        }}
      />
      <main className="workshop-main">
        <header className="workshop-header">
          <Button
            id="toggle-sidebar"
            variant="quiet"
            aria-label="Toggle component catalog"
            aria-controls="sidebar"
            aria-expanded={mapSignal(catalogOpen, String)}
            ref={(element: HTMLElement) => {
              toggle = element;
            }}
            onClick={(event: MouseEvent) => {
              const next = !catalogOpen.value;
              setCatalogOpen(next);
              if (next && (event.detail === 0 || !matchMedia("(pointer: coarse)").matches))
                search?.focus();
            }}
          >
            <Icon name="panel-left" size={16} />
          </Button>
          <nav className="workshop-trail" aria-label="Breadcrumb">
            <span id="group">
              {label((story) => story?.group ?? "Component preview", "Components")}
            </span>
            <span className="breadcrumb-separator" aria-hidden="true">
              /
            </span>
            <span id="breadcrumb-component" aria-current="page">
              {label(componentName, "Meowbook")}
            </span>
          </nav>
          <div className="workshop-header-actions">
            {/* A phone shows only the icon, so the link keeps its name. */}
            <a
              id="story-docs"
              className="workshop-header-link"
              hidden={mapSignal(docsLink, (link) => !link)}
              href={mapSignal(docsLink, (link) => link?.href)}
              aria-label={mapSignal(docsLink, (link) => link?.label)}
            >
              <IconSource source={BookOpen} size={14} />
              <span>{mapSignal(docsLink, (link) => link?.label ?? "Docs")}</span>
            </a>
            <nav
              id="host-links"
              className="workshop-host-links"
              aria-label="Related"
              hidden={!settings.links?.length}
            >
              {(settings.links ?? []).map(({ label, href }) => (
                <a className="workshop-header-link" href={href}>
                  {label}
                </a>
              ))}
            </nav>
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
                  data-appearance={scheme}
                >
                  <IconSource source={Monitor} size={16} className="appearance-auto" />
                  <IconSource source={Sun} size={16} className="appearance-light" />
                  <IconSource source={Moon} size={16} className="appearance-dark" />
                </button>
              )}
            >
              <fieldset id="appearance-themes" hidden={themes.length < 2}>
                <legend>Theme</legend>
                {themes.map(({ value, label }) =>
                  radio("gallery-theme", value, <span>{label}</span>),
                )}
              </fieldset>
              <fieldset id="appearance-schemes">
                <legend>Appearance</legend>
                {(
                  [
                    ["auto", "System", Monitor],
                    ["light", "Light", Sun],
                    ["dark", "Dark", Moon],
                  ] as const
                ).map(([value, label, icon]) =>
                  radio("gallery-scheme", value, [
                    <IconSource source={icon} size={14} />,
                    <span>{label}</span>,
                  ]),
                )}
              </fieldset>
            </Popover>
            <a
              id="standalone"
              className="workshop-icon-button"
              href={derived(() => canvasURL(active.value, false))}
              target="_blank"
              rel="noopener"
              aria-label="Open the canvas on its own"
              title="Open the canvas on its own"
              inert={covered}
            >
              <Icon name="arrow-up-right" size={16} />
            </a>
          </div>
        </header>
        <section className="workshop-intro" aria-label="Current component scenario" inert={covered}>
          <h1
            id="title"
            tabindex={-1}
            inert={covered}
            ref={(element: HTMLElement) => {
              title = element;
            }}
          >
            {label(componentName, "Meowbook")}
          </h1>
          <p id="scenario-description">
            {label((story) => story?.description ?? "Choose a component from the catalog.", "")}
          </p>
          <nav
            id="variants"
            aria-label="Component scenarios"
            hidden={mapSignal(siblings, (items) => items.length < 2)}
          >
            {keyed(
              siblings,
              (story) => story.id,
              (story) => (
                <a
                  href={derived(() => storyHref(story.value, width.value))}
                  title={mapSignal(story, (item) => item.title)}
                  aria-current={derived(() =>
                    story.value.id === active.value ? "page" : undefined,
                  )}
                  onClick={(event: MouseEvent) => {
                    if (!plainClick(event)) return;
                    event.preventDefault();
                    choose(story.value, event);
                  }}
                >
                  {mapSignal(story, (item) => item.variant ?? item.title)}
                </a>
              ),
            )}
          </nav>
        </section>
        <Toolbar className="workshop-toolbar" label="Preview tools" inert={covered}>
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
              <Button
                variant="quiet"
                size="small"
                data-width={value}
                aria-pressed={mapSignal(width, (current) => String(current === value))}
                onClick={() => {
                  if (width.value === value) return;
                  width.value = value!;
                  updateURL();
                }}
              >
                {label}
              </Button>
            ))}
          </div>
          {/* The readout names the width the story actually gets, the fluid one included. */}
          <span id="viewport-size" className="viewport-size">
            {derived(() => {
              const pixels = width.value === "fluid" ? frameWidth.value : Number(width.value);
              return pixels ? `${pixels} px` : "";
            })}
          </span>
          <div className="workshop-tools">
            <Select
              id="measure-mode"
              aria-label="Annotation category"
              value={measureMode}
              onChange={(event) => {
                measureMode.value = (event.target as HTMLSelectElement).value;
                measured.value = [];
                syncMeasurements();
              }}
            >
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
              aria-pressed={mapSignal(placeholder, String)}
              aria-label="Text placeholders"
              title="Replace text with placeholder bars"
              onClick={() => {
                placeholder.value = !placeholder.value;
                syncMeasurements();
              }}
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
              onClick={load}
            >
              <Icon name="refresh-cw" size={14} />
            </Button>
          </div>
        </Toolbar>
        <div className="workshop-stage" inert={covered}>
          {keyed(
            mapSignal(generation, (count) => [count]),
            (count) => count,
            () => (
              <iframe
                id="canvas"
                title="Component preview canvas"
                src={loaded.value ? canvasURL(active.value) : undefined}
                style={{
                  width: mapSignal(width, (value) => (value === "fluid" ? "100%" : `${value}px`)),
                }}
                ref={(element: HTMLIFrameElement) => {
                  frame = element;
                  followScheme(element);
                  const observer = new ResizeObserver(() => {
                    if (frame === element) frameWidth.value = Math.round(element.clientWidth);
                  });
                  observer.observe(element);
                  return () => observer.disconnect();
                }}
              />
            ),
          )}
        </div>
        <section
          id="measurement-detail"
          aria-label="Selected element details"
          hidden={mapSignal(measureMode, (mode) => mode === "off")}
        >
          <p id="measurement-help">
            {mapSignal(measureMode, (mode) => (mode === "spacing" ? spacingHelp : measurementHelp))}
          </p>
          <dl id="measurement-values">
            {keyed(
              measured,
              ([term]) => term,
              (row) => [
                <dt>{mapSignal(row, ([term]) => term)}</dt>,
                <dd>{mapSignal(row, ([, value]) => value)}</dd>,
              ],
            )}
          </dl>
        </section>
        <Disclosure
          className="workshop-observations"
          id="inspection-panel"
          contentClassName="inspection-body"
          inert={covered}
          summary={[
            <Icon name="list-checks" size={15} />,
            <strong>Checks and notes</strong>,
            <span
              id="latest-event"
              role="status"
              hidden={mapSignal(events, (items) => !items.length)}
              title={mapSignal(events, (items) => items[0]?.message)}
            >
              {mapSignal(events, (items) => items[0]?.message ?? "")}
            </span>,
            <span
              id="inspection"
              role="status"
              data-warning={mapSignal(inspection, (state) =>
                state.warning === undefined ? undefined : String(state.warning),
              )}
            >
              {mapSignal(inspection, (state) => state.text)}
            </span>,
          ]}
        >
          <section className="workshop-description" aria-label="Sample description">
            <p id="description">
              {label(
                (story) => story?.description ?? "Choose an existing sample from the left.",
                "Loading…",
              )}
            </p>
            <div id="covers">
              {keyed(
                mapSignal(current, (story) =>
                  (story?.covers ?? []).map((text, at) => ({ at, text })),
                ),
                (cover) => cover.at,
                (cover) => (
                  <span>{mapSignal(cover, (item) => item.text)}</span>
                ),
              )}
            </div>
          </section>
          <div className="workshop-observation-head">
            <strong>Interaction log</strong>
            <Button
              id="inspect"
              variant="quiet"
              size="small"
              onClick={() => post(frame, { type: "inspect" })}
            >
              Check again
            </Button>
            <Button id="clear-log" variant="quiet" size="small" onClick={() => (events.value = [])}>
              Clear log
            </Button>
          </div>
          <ol id="events" aria-live="polite">
            {keyed(
              events,
              (entry) => entry.id,
              (entry) => (
                <li>{mapSignal(entry, (item) => item.message)}</li>
              ),
            )}
          </ol>
          <section className="workshop-batch" aria-label="All sample checks">
            <div className="workshop-observation-head">
              <Button
                id="inspect-all"
                variant="outline"
                size="small"
                disabled={derived(() => batchRunning.value || stories.value.length === 0)}
                onClick={() => void inspectAll()}
              >
                Check all samples
              </Button>
              <Button
                id="cancel-inspection"
                variant="quiet"
                size="small"
                hidden={mapSignal(batchRunning, (running) => !running)}
                onClick={() => batch?.abort()}
              >
                Cancel check
              </Button>
              <span id="batch-status" role="status">
                {batchStatus}
              </span>
            </div>
            <ul id="batch-results">
              {keyed(
                batchResults,
                (result) => result.story.id,
                (result) => {
                  const { story, width: resultWidth, issues } = result.value;
                  return (
                    <li>
                      <a
                        href={storyHref(story, resultWidth)}
                        onClick={(event: MouseEvent) => {
                          event.preventDefault();
                          open(story, resultWidth);
                        }}
                      >
                        {story.title}
                      </a>
                      <span>{issues.join("; ")}</span>
                    </li>
                  );
                },
              )}
            </ul>
          </section>
          <p className="workshop-limits">
            Checks rendering, horizontal overflow and control names; does not replace interaction or
            visual acceptance.
          </p>
        </Disclosure>
      </main>
    </div>
  );
}

/** Only tool composition lives here; controls, icons and theme are Meowtail. */
export function mountGallery(props: GalleryProps) {
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
  applyTheme(document.documentElement, standardTheme);
  installFocusModality(document);
  return createWebRenderer(runtime).render(<Gallery {...props} />, document.body);
}
