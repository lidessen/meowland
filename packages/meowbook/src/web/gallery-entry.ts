import type { NavListGroup } from "meowtail";
import type { GallerySettings, StoryEntry } from "../types";
import { mountCatalog, mountGallery } from "./gallery-shell";
import { chromeThemeAttribute } from "./gallery.styles";
mountGallery();
type StoryInfo = StoryEntry & {
  id: string;
  title: string;
  group: string;
  description: string;
  covers: string[];
};
const get = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
let frame = get<HTMLIFrameElement>("canvas");
let placeholder = false;
const measurementMode = get<HTMLSelectElement>("measure-mode");
measurementMode.value = "off";
const showMeasurementHelp = () => {
  get("measurement-detail").hidden = measurementMode.value === "off";
  get("measurement-values").replaceChildren();
  get("measurement-help").textContent =
    measurementMode.value === "spacing"
      ? "Click an element to see its spacing; green is padding, orange is margin (top, right, bottom, left); gap appears in the values. Turn annotations off to restore normal clicks."
      : "Click a canvas element to see its actual values; turn annotations off to restore normal clicks.";
};
const syncMeasurements = () =>
  frame.contentWindow?.postMessage(
    { channel: "meowbook", type: "measure", mode: measurementMode.value, placeholder },
    location.origin,
  );
measurementMode.addEventListener("change", () => {
  showMeasurementHelp();
  syncMeasurements();
});
get("text-placeholder").addEventListener("click", () => {
  placeholder = !placeholder;
  get("text-placeholder").setAttribute("aria-pressed", String(placeholder));
  syncMeasurements();
});
const search = get<HTMLInputElement>("search");

/** What the host site set in the config; an absent `gallery.json` keeps Meowbook's own chrome. */
let settings: GallerySettings = {};
const schemes = ["auto", "light", "dark"] as const;
type Scheme = (typeof schemes)[number];
const schemeKey = () => settings.appearance?.schemeStorageKey ?? "meowbook:color-scheme";
const themes = () => settings.appearance?.themes ?? [];
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
function scheme(): Scheme {
  const saved = read(schemeKey());
  return schemes.includes(saved as Scheme) ? (saved as Scheme) : "auto";
}
function theme() {
  const choices = themes();
  const saved = read(settings.appearance?.themeStorageKey);
  return choices.find((choice) => choice.value === saved)?.value ?? choices[0]?.value;
}
/** One scheme paints the tool and the story, so a dark story never sits in light chrome. */
function paintScheme() {
  const choice = scheme();
  document.documentElement.dataset.meowuiColorScheme = choice;
  // The chrome wears the chosen theme's Meowtail counterpart, so tool and story agree.
  const chrome = themes().find((item) => item.value === theme())?.chrome;
  if (chrome && chrome !== "standard")
    document.documentElement.setAttribute(chromeThemeAttribute, chrome);
  else document.documentElement.removeAttribute(chromeThemeAttribute);
  get("appearance-trigger").dataset.appearance = choice;
  const root = frameRoot();
  if (root && root.dataset.meowuiColorScheme !== choice) root.dataset.meowuiColorScheme = choice;
  for (const input of document.querySelectorAll<HTMLInputElement>("#appearance input"))
    input.checked = input.value === (input.name === "gallery-theme" ? theme() : choice);
}
function frameRoot() {
  try {
    return frame.contentDocument?.documentElement ?? null;
  } catch {
    return null;
  }
}
/** An environment can re-apply its theme while the story mounts; the reader's scheme stays. */
function followScheme(target: HTMLIFrameElement) {
  target.addEventListener("load", () => {
    const root = frameRoot();
    if (target !== frame || !root) return;
    new MutationObserver(() => {
      if (root.dataset.meowuiColorScheme !== scheme()) root.dataset.meowuiColorScheme = scheme();
    }).observe(root, { attributes: true, attributeFilter: ["data-meowui-color-scheme"] });
    paintScheme();
  });
}
get("appearance").addEventListener("change", (event) => {
  const input = event.target as HTMLInputElement;
  if (input.name === "gallery-theme") {
    write(settings.appearance?.themeStorageKey, input.value, themes()[0]?.value ?? "");
    // An environment mounts its theme once, so a new theme is a new canvas.
    load();
  } else write(schemeKey(), input.value, "auto");
  paintScheme();
});
// A choice made in the host site's other tabs reaches this one.
window.addEventListener("storage", (event) => {
  if (event.key === schemeKey()) paintScheme();
  else if (event.key && event.key === settings.appearance?.themeStorageKey) load();
});
paintScheme();

/** Brand, related links and theme choices come from the host's config. */
function applySettings() {
  const { name, tag, logo, href } = settings.brand ?? {};
  if (href) get<HTMLAnchorElement>("brand").href = href;
  if (name) get("brand-name").textContent = name;
  if (tag !== undefined) get("brand-label").textContent = tag;
  get("brand-label").hidden = !get("brand-label").textContent;
  if (logo) {
    // A pair of marks shows the one for the current scheme; the stylesheet chooses.
    const sources =
      typeof logo === "string"
        ? [["", logo]]
        : [
            ["light", logo.light],
            ["dark", logo.dark],
          ];
    const marks = sources.map(([scheme, src]) => {
      const image = document.createElement("img");
      image.src = src!;
      image.alt = "";
      image.width = 28;
      image.height = 28;
      if (scheme) image.className = `workshop-logo-${scheme}`;
      return image;
    });
    get("brand-mark").replaceWith(...marks);
  }
  const links = get("host-links");
  links.replaceChildren(
    ...(settings.links ?? []).map(({ label, href }) => {
      const link = document.createElement("a");
      link.className = "workshop-header-link";
      link.href = href;
      link.textContent = label;
      return link;
    }),
  );
  links.hidden = !links.childElementCount;
  const choices = get("appearance-themes");
  choices.replaceChildren(choices.querySelector("legend")!);
  for (const { value, label } of themes()) {
    const row = document.createElement("label");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "gallery-theme";
    input.value = value;
    const text = document.createElement("span");
    text.textContent = label;
    row.append(input, text);
    choices.append(row);
  }
  choices.hidden = themes().length < 2;
  paintScheme();
}
const viewportButtons = [...get("viewport").querySelectorAll<HTMLButtonElement>("[data-width]")];
let width = "fluid";
let stories: StoryInfo[] = [];
let active = new URL(location.href).searchParams.get("story") ?? "";
let renderError = false;
let batch: AbortController | undefined;
const initialWidth = new URL(location.href).searchParams.get("width");
if (["fluid", "390", "768", "1100"].includes(initialWidth ?? "")) width = initialWidth!;

/** The canvas and the manifest sit next to the gallery, whatever path it is served from. */
/**
 * The one canvas address. Inside the gallery the canvas is embedded: the gallery's chrome carries
 * the theme and the scheme, so the environment draws no controls of its own. The standalone link
 * leaves the canvas its own controls.
 */
function canvasURL(id = active, embedded = true) {
  const query = new URLSearchParams();
  if (id) query.set("story", id);
  if (embedded) {
    query.set("embedded", "1");
    query.set("scheme", scheme());
  }
  const chosen = theme();
  if (chosen) query.set("theme", chosen);
  const search = query.toString();
  return `./canvas.html${search ? `?${search}` : ""}`;
}
function updateURL(replace = false) {
  const url = new URL(location.href);
  if (active) url.searchParams.set("story", active);
  else url.searchParams.delete("story");
  url.searchParams.set("width", width);
  if (replace) history.replaceState(null, "", url);
  else history.pushState(null, "", url);
}
/** The readout names the width the story actually gets, the fluid one included. */
function showSize() {
  const pixels = width === "fluid" ? Math.round(frame.clientWidth) : Number(width);
  get("viewport-size").textContent = pixels ? `${pixels} px` : "";
}
new ResizeObserver(showSize).observe(get("canvas").parentElement!);
function applyWidth() {
  frame.style.width = width === "fluid" ? "100%" : `${width}px`;
  showSize();
  for (const button of viewportButtons)
    button.setAttribute("aria-pressed", String(button.dataset.width === width));
}
function showInfo() {
  const story = stories.find((item) => item.id === active);
  get("title").textContent = story?.component ?? story?.title ?? "Sample not found";
  get("group").textContent = story?.group ?? "Component preview";
  get("breadcrumb-component").textContent = story?.component ?? story?.title ?? "Sample not found";
  get("scenario-description").textContent =
    story?.description ?? "Choose a component from the catalog.";
  const siblings = story
    ? stories.filter((item) => componentKey(item) === componentKey(story))
    : [];
  get("variants").replaceChildren(
    ...siblings.map((item) => storyLink(item, item.variant ?? item.title)),
  );
  get("variants").hidden = siblings.length < 2;
  get("description").textContent = story?.description ?? "Choose an existing sample from the left.";
  get("covers").replaceChildren(
    ...(story?.covers ?? []).map((text) => {
      const span = document.createElement("span");
      span.textContent = text;
      return span;
    }),
  );
  get<HTMLAnchorElement>("standalone").href = canvasURL(active, false);
  const name = settings.brand?.name ?? "Meowbook";
  document.title = story ? `${story.component ?? story.title} · ${name}` : name;
  const docs = get<HTMLAnchorElement>("story-docs");
  const link = story ? settings.docsLinks?.[story.id] : undefined;
  docs.hidden = !link;
  if (link) {
    docs.href = link.href;
    docs.querySelector("span")!.textContent = link.label;
    // A phone shows only the icon, so the link keeps its name.
    docs.setAttribute("aria-label", link.label);
  }
}
function componentKey(story: StoryInfo) {
  return JSON.stringify([story.group, story.component ?? story.id]);
}
function storyLink(story: StoryInfo, label: string) {
  const link = document.createElement("a");
  link.href = `?story=${encodeURIComponent(story.id)}&width=${width}`;
  link.textContent = label;
  link.title = story.title;
  if (active === story.id) link.setAttribute("aria-current", "page");
  link.addEventListener("click", (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    active = story.id;
    updateURL();
    load();
    setCatalogOpen(false);
    get("title").focus({ preventScroll: true });
  });
  return link;
}
function showCatalog() {
  const query = search.value.trim().toLocaleLowerCase();
  const matches = stories.filter((story) =>
    [story.group, story.component, story.variant, story.title, ...story.covers]
      .join(" ")
      .toLocaleLowerCase()
      .includes(query),
  );
  const components = new Map<string, StoryInfo[]>();
  for (const story of matches) {
    const key = componentKey(story);
    components.set(key, [...(components.get(key) ?? []), story]);
  }
  const count = new Set(stories.map(componentKey)).size;
  get("story-count").textContent = query ? `${components.size} / ${count}` : String(count);
  const groupOrders = new Map<string, number>();
  for (const story of stories) {
    if (story.groupOrder !== undefined)
      groupOrders.set(
        story.group,
        Math.min(groupOrders.get(story.group) ?? Infinity, story.groupOrder),
      );
  }
  const groups = [...new Set(matches.map((story) => story.group))];
  groups.sort((a, b) => (groupOrders.get(a) ?? Infinity) - (groupOrders.get(b) ?? Infinity));
  const current = stories.find((story) => story.id === active);
  const catalog: NavListGroup[] = groups.map((group) => {
    const entries = [...components.values()].filter((items) => items[0]!.group === group);
    entries.sort((a, b) =>
      (a[0]!.component ?? a[0]!.title).localeCompare(b[0]!.component ?? b[0]!.title),
    );
    return {
      label: group,
      items: entries.map((items) => {
        // The row keeps pointing at the active scenario when it belongs to the component;
        // otherwise it opens the component's first scenario.
        const story = items.find((item) => item.id === active) ?? items[0]!;
        return {
          id: componentKey(items[0]!),
          label: story.component ?? story.title,
          href: `?story=${encodeURIComponent(story.id)}&width=${width}`,
        };
      }),
    };
  });
  mountCatalog({
    groups: catalog,
    activeId: current ? componentKey(current) : "",
    emptyMessage: `No results for "${search.value.trim()}". Try a component name or clear the search.`,
  });
}
function log(message: string) {
  const list = get("events");
  const line = document.createElement("li");
  line.textContent = message;
  list.prepend(line);
  while (list.childElementCount > 12) list.lastElementChild?.remove();
  get("latest-event").textContent = message;
  get("latest-event").title = message;
  get("latest-event").hidden = false;
}
function load() {
  showMeasurementHelp();
  renderError = false;
  // A new WindowProxy prevents queued messages from a reset document being accepted.
  const next = frame.cloneNode(false) as HTMLIFrameElement;
  next.removeAttribute("src");
  frame.replaceWith(next);
  frame = next;
  followScheme(frame);
  frame.src = canvasURL();
  get("events").replaceChildren();
  get("latest-event").hidden = true;
  get("inspection").textContent = "Rendering…";
  get("inspection").removeAttribute("data-warning");
  showInfo();
  showCatalog();
  applyWidth();
}
window.addEventListener("message", (event) => {
  if (event.source !== frame.contentWindow || event.origin !== location.origin) return;
  const data = event.data;
  if (!data || data.channel !== "meowbook") return;
  if (data.story !== active) return;
  if (data.type === "measurement") {
    const detail = data.detail;
    const list = get("measurement-values");
    list.replaceChildren();
    if (
      detail &&
      ["name", "size", "typography", "spacing"].every((key) => typeof detail[key] === "string")
    ) {
      for (const [name, key] of [
        ["Element", "name"],
        ["Width × height", "size"],
        ["Font size / line height", "typography"],
        ["Spacing", "spacing"],
      ]) {
        const term = document.createElement("dt"),
          value = document.createElement("dd");
        term.textContent = name!;
        value.textContent = detail[key!];
        list.append(term, value);
      }
    }
  }
  if (data.type === "ready") syncMeasurements();
  if (data.type === "metadata" && data.entry) {
    // The canvas metadata is the story module's own metadata; keep the manifest's
    // group fallback so a story without an explicit group stays in its catalog group.
    stories = stories.map((entry) =>
      entry.id === active
        ? {
            ...entry,
            ...data.entry,
            group: data.entry.group ?? entry.group,
            covers: data.entry.covers ?? [],
          }
        : entry,
    );
    get<HTMLButtonElement>("inspect-all").disabled = !!batch || stories.length === 0;
    if (!active && typeof data.active === "string") {
      active = data.active;
      updateURL(true);
    }
    showInfo();
    showCatalog();
  } else if (data.type === "event" && typeof data.message === "string") log(data.message);
  else if (data.type === "inspection" && Array.isArray(data.issues)) {
    if (renderError) return;
    const issues = data.issues as string[];
    get("inspection").textContent = issues.length
      ? `${issues.length} items with notes · ${data.width}px`
      : `No basic check issues found · ${data.width}px`;
    get("inspection").dataset.warning = String(issues.length > 0);
    for (const issue of issues) log(issue);
  } else if (data.type === "error" && typeof data.message === "string") {
    renderError = true;
    get("inspection").textContent = "Sample render error";
    get("inspection").dataset.warning = "true";
    log(data.message);
  }
});

/** Each sample gets a fresh document; its response cannot be confused with another load. */
function inspectStory(
  story: StoryInfo,
  pixels: number,
  signal: AbortSignal,
): Promise<string[] | null> {
  return new Promise((resolve) => {
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
        probe.contentWindow?.postMessage({ channel: "meowbook", type: "inspect" }, location.origin);
      }
      if (data.type === "error" && typeof data.message === "string")
        finish([`Render error: ${data.message}`]);
      else if (requested && data.type === "inspection" && Array.isArray(data.issues))
        finish(data.issues.filter((issue: unknown): issue is string => typeof issue === "string"));
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
}

async function inspectAll() {
  if (batch || !stories.length) return;
  const controller = new AbortController();
  batch = controller;
  const queue = [...stories];
  const selectedWidth = width;
  const pixels = Math.max(1, Math.round(frame.clientWidth));
  const results = get("batch-results");
  const status = get("batch-status");
  results.replaceChildren();
  get<HTMLButtonElement>("inspect-all").disabled = true;
  get("cancel-inspection").hidden = false;
  let completed = 0;
  let passed = 0;
  try {
    for (const story of queue) {
      status.textContent = `Checking ${completed + 1}/${queue.length} · ${pixels}px · ${story.title}`;
      const issues = await inspectStory(story, pixels, controller.signal);
      if (issues === null) break;
      completed++;
      if (!issues.length) {
        passed++;
        continue;
      }
      const row = document.createElement("li");
      const link = document.createElement("a");
      link.href = `?story=${encodeURIComponent(story.id)}&width=${selectedWidth}`;
      link.textContent = story.title;
      link.addEventListener("click", (event) => {
        event.preventDefault();
        active = story.id;
        width = selectedWidth;
        updateURL();
        load();
      });
      const detail = document.createElement("span");
      detail.textContent = issues.join("; ");
      row.append(link, detail);
      results.append(row);
    }
    status.textContent = `${controller.signal.aborted ? "Canceled" : "Check complete"} · ${pixels}px · ${completed}/${queue.length} checked, ${passed} items without basic issues, ${completed - passed} items with notes`;
  } finally {
    batch = undefined;
    get<HTMLButtonElement>("inspect-all").disabled = stories.length === 0;
    get("cancel-inspection").hidden = true;
  }
}
get("inspect-all").addEventListener("click", () => void inspectAll());
get("cancel-inspection").addEventListener("click", () => batch?.abort());
window.addEventListener("pagehide", () => batch?.abort());
search.addEventListener("input", showCatalog);
// One delegated handler keeps plain catalog clicks inside the workbench; modified
// clicks keep the anchor's own navigation to the scenario URL.
get("catalog").addEventListener("click", (event) => {
  const target = event.target;
  const anchor = target instanceof Element ? target.closest<HTMLAnchorElement>("a") : null;
  if (!anchor) return;
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const story = stories.find((item) => item.id === new URL(anchor.href).searchParams.get("story"));
  if (!story) return;
  event.preventDefault();
  active = story.id;
  updateURL();
  load();
  setCatalogOpen(false);
  get("title").focus({ preventScroll: true });
});
for (const button of viewportButtons)
  button.addEventListener("click", () => {
    if (button.dataset.width === width) return;
    width = button.dataset.width!;
    applyWidth();
    updateURL();
    showCatalog();
    showInfo();
  });
get("reset").addEventListener("click", load);
function setCatalogOpen(open: boolean) {
  document.body.classList.toggle("catalog-open", open);
  get("toggle-sidebar").setAttribute("aria-expanded", String(open));
  get("catalog-backdrop").hidden = !open;
  const covered = open && matchMedia("(max-width: 640px)").matches;
  for (const element of document.querySelectorAll<HTMLElement>(
    ".workshop-intro, .workshop-toolbar, .workshop-stage, .workshop-observations, #standalone, #title",
  ))
    element.inert = covered;
}
matchMedia("(max-width: 640px)").addEventListener("change", () => setCatalogOpen(false));
get("toggle-sidebar").addEventListener("click", (event) => {
  const open = !document.body.classList.contains("catalog-open");
  setCatalogOpen(open);
  if (open && (event.detail === 0 || !matchMedia("(pointer: coarse)").matches)) search.focus();
});
get("catalog-backdrop").addEventListener("click", () => {
  setCatalogOpen(false);
  get("toggle-sidebar").focus();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (document.body.classList.contains("catalog-open")) {
      setCatalogOpen(false);
      get("toggle-sidebar").focus();
    } else if (document.activeElement === search && search.value) {
      search.value = "";
      showCatalog();
    }
  }
});
get("clear-log").addEventListener("click", () => {
  get("events").replaceChildren();
  get("latest-event").hidden = true;
});
get("inspect").addEventListener("click", () =>
  frame.contentWindow?.postMessage({ channel: "meowbook", type: "inspect" }, location.origin),
);
window.addEventListener("popstate", () => {
  const query = new URL(location.href).searchParams;
  active = query.get("story") ?? "";
  width = ["fluid", "390", "768", "1100"].includes(query.get("width") ?? "")
    ? query.get("width")!
    : "fluid";
  load();
});
applyWidth();
try {
  const response = await fetch("./gallery.json");
  if (response.ok) settings = await response.json();
} catch {
  /* Without host settings the gallery keeps its own chrome. */
}
applySettings();
try {
  const response = await fetch("./manifest.json");
  if (!response.ok) throw new Error("Failed to load the scenario manifest");
  const entries: StoryEntry[] = await response.json();
  stories = entries.map((entry) => ({
    ...entry,
    group: entry.group ?? "Components",
    description: entry.description ?? "",
    covers: [...(entry.covers ?? [])],
  }));
  if (!active) active = stories[0]?.id ?? "";
  updateURL(true);
  get<HTMLButtonElement>("inspect-all").disabled = stories.length === 0;
  load();
} catch (error) {
  get("inspection").textContent = String(error);
}
