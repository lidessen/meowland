import type { StoryEntry } from "../types";
import { mountGallery } from "./gallery-shell";
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
      ? "点击元素查看间距；绿色为 padding，橙色为 margin（上右下左）；gap 见数值。关闭标注恢复普通点击。"
      : "点击画布元素查看实际数值；关闭标注恢复普通点击。";
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
const galleryScheme = get<HTMLSelectElement>("gallery-scheme");
galleryScheme.value = "auto";
try {
  const saved = localStorage.getItem("meowbook:color-scheme");
  if (saved && ["auto", "light", "dark"].includes(saved)) galleryScheme.value = saved;
} catch {
  /* Appearance remains usable when storage is unavailable. */
}
document.documentElement.dataset.meowuiColorScheme = galleryScheme.value;
galleryScheme.addEventListener("change", () => {
  document.documentElement.dataset.meowuiColorScheme = galleryScheme.value;
  try {
    localStorage.setItem("meowbook:color-scheme", galleryScheme.value);
  } catch {
    /* No persistence required. */
  }
});
const viewportButtons = [...get("viewport").querySelectorAll<HTMLButtonElement>("[data-width]")];
let width = "fluid";
let stories: StoryInfo[] = [];
let active = new URL(location.href).searchParams.get("story") ?? "";
let renderError = false;
let batch: AbortController | undefined;
const initialWidth = new URL(location.href).searchParams.get("width");
if (["fluid", "390", "768", "1100"].includes(initialWidth ?? "")) width = initialWidth!;

function canvasURL() {
  return `/canvas.html${active ? `?story=${encodeURIComponent(active)}` : ""}`;
}
function updateURL(replace = false) {
  const url = new URL(location.href);
  if (active) url.searchParams.set("story", active);
  else url.searchParams.delete("story");
  url.searchParams.set("width", width);
  if (replace) history.replaceState(null, "", url);
  else history.pushState(null, "", url);
}
function applyWidth() {
  frame.style.width = width === "fluid" ? "100%" : `${width}px`;
  get("viewport-size").textContent = width === "fluid" ? "自适应" : `${width} px`;
  for (const button of viewportButtons)
    button.setAttribute("aria-pressed", String(button.dataset.width === width));
}
function showInfo() {
  const story = stories.find((item) => item.id === active);
  get("title").textContent = story?.component ?? story?.title ?? "未找到样例";
  get("group").textContent = story?.group ?? "组件预览";
  get("breadcrumb-component").textContent = story?.component ?? story?.title ?? "未找到样例";
  get("scenario-description").textContent = story?.description ?? "请从目录选择组件。";
  const siblings = story
    ? stories.filter((item) => componentKey(item) === componentKey(story))
    : [];
  get("variants").replaceChildren(
    ...siblings.map((item) => storyLink(item, item.variant ?? item.title)),
  );
  get("variants").hidden = siblings.length < 2;
  get("description").textContent = story?.description ?? "请从左侧选择一个已有样例。";
  get("covers").replaceChildren(
    ...(story?.covers ?? []).map((text) => {
      const span = document.createElement("span");
      span.textContent = text;
      return span;
    }),
  );
  get<HTMLAnchorElement>("standalone").href = canvasURL();
  document.title = `${story?.title ?? "Meowbook"} · Meowbook`;
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
  const fragment = document.createDocumentFragment();
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
  for (const group of groups) {
    const heading = document.createElement("h2");
    const label = document.createElement("span");
    label.textContent = group;
    heading.append(label);
    fragment.append(heading);
    const entries = [...components.values()].filter((items) => items[0]!.group === group);
    entries.sort((a, b) =>
      (a[0]!.component ?? a[0]!.title).localeCompare(b[0]!.component ?? b[0]!.title),
    );
    for (const items of entries) {
      const story = items.find((item) => item.id === active) ?? items[0]!;
      const link = storyLink(story, story.component ?? story.title);
      const current = stories.find((item) => item.id === active);
      if (current && componentKey(current) === componentKey(story))
        link.setAttribute("aria-current", "page");
      fragment.append(link);
    }
  }
  if (!matches.length) {
    const empty = document.createElement("p");
    empty.textContent = `没有找到“${search.value.trim()}”。试试组件名称或清空搜索。`;
    empty.className = "catalog-empty";
    fragment.append(empty);
  }
  get("catalog").replaceChildren(fragment);
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
  frame.src = canvasURL();
  get("events").replaceChildren();
  get("latest-event").hidden = true;
  get("inspection").textContent = "正在渲染…";
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
        ["元素", "name"],
        ["宽 × 高", "size"],
        ["字号 / 行高", "typography"],
        ["间距", "spacing"],
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
    stories = stories.map((entry) =>
      entry.id === active ? { ...entry, ...data.entry, covers: data.entry.covers ?? [] } : entry,
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
      ? `${issues.length} 项提示 · ${data.width}px`
      : `未发现基础检查问题 · ${data.width}px`;
    get("inspection").dataset.warning = String(issues.length > 0);
    for (const issue of issues) log(issue);
  } else if (data.type === "error" && typeof data.message === "string") {
    renderError = true;
    get("inspection").textContent = "样例渲染异常";
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
    probe.title = `后台检查：${story.title}`;
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
        finish([`渲染异常：${data.message}`]);
      else if (requested && data.type === "inspection" && Array.isArray(data.issues))
        finish(data.issues.filter((issue: unknown): issue is string => typeof issue === "string"));
    };
    window.addEventListener("message", receive);
    signal.addEventListener("abort", cancel, { once: true });
    probe.src = `/canvas.html?story=${encodeURIComponent(story.id)}`;
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
      status.textContent = `检查中 ${completed + 1}/${queue.length} · ${pixels}px · ${story.title}`;
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
      detail.textContent = issues.join("；");
      row.append(link, detail);
      results.append(row);
    }
    status.textContent = `${controller.signal.aborted ? "已取消" : "检查完成"} · ${pixels}px · ${completed}/${queue.length} 已检查，${passed} 项无基础问题，${completed - passed} 项有提示`;
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
  const response = await fetch("/manifest.json");
  if (!response.ok) throw new Error("场景清单加载失败");
  const entries: StoryEntry[] = await response.json();
  stories = entries.map((entry) => ({
    ...entry,
    group: entry.group ?? "组件",
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
