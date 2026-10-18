export type MeasurementMode = "off" | "controls" | "text" | "spacing" | "structure";
export interface MeasurementOptions {
  mode: MeasurementMode;
  placeholder: boolean;
}
export interface MeasurementDetail {
  name: string;
  size: string;
  typography: string;
  spacing: string;
}
export const isMeasurementMode = (value: unknown): value is MeasurementMode =>
  value === "off" ||
  value === "controls" ||
  value === "text" ||
  value === "spacing" ||
  value === "structure";

/** Generic DOM/CSS inspection. Consumer nodes and styles remain untouched. */
export function createMeasurements(
  root: HTMLElement,
  report: (detail: MeasurementDetail | null) => void,
) {
  const layer = document.createElement("div");
  layer.id = "story-measurements";
  layer.setAttribute("aria-hidden", "true");
  let options: MeasurementOptions = { mode: "off", placeholder: false };
  let selected: HTMLElement | null = null;
  let candidates: HTMLElement[] = [];
  let frame = 0,
    running = false;
  const controls =
    "button,input:not([type=hidden]),select,textarea,a[href],[role=button],[role=tab],[role=checkbox],[role=switch],[role=combobox]";
  const number = (value: number) => String(Math.round(value * 10) / 10);
  const sides = ["top", "right", "bottom", "left"];
  const box = (style: CSSStyleDeclaration, prefix: string) =>
    sides.map((side) => style.getPropertyValue(prefix + "-" + side)).join(" ");
  const ownText = (element: HTMLElement) =>
    [...element.childNodes].some(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
    );
  const visible = (rect: DOMRect) =>
    rect.width > 0 &&
    rect.height > 0 &&
    rect.bottom > 0 &&
    rect.top < innerHeight &&
    rect.right > 0 &&
    rect.left < innerWidth;
  const label = (element: HTMLElement) => {
    const labelled = (element.getAttribute("aria-labelledby") ?? "")
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent ?? "")
      .join(" ")
      .trim();
    const labels = "labels" in element ? (element as HTMLInputElement).labels : null;
    return (
      element.tagName.toLowerCase() +
      " · " +
      (element.getAttribute("aria-label") ||
        labelled ||
        (labels && [...labels].map((item) => item.textContent).join(" ")) ||
        element.getAttribute("placeholder") ||
        [...element.childNodes]
          .filter((node) => node.nodeType === Node.TEXT_NODE)
          .map((node) => node.textContent)
          .join(" ")
          .trim()
          .slice(0, 60) ||
        element.id ||
        element.tagName.toLowerCase())
    );
  };
  const rectangle = (
    rect: { left: number; top: number; width: number; height: number },
    className: string,
  ) => {
    const node = document.createElement("div");
    node.className = className;
    Object.assign(node.style, {
      left: rect.left + "px",
      top: rect.top + "px",
      width: Math.max(0, rect.width) + "px",
      height: Math.max(0, rect.height) + "px",
    });
    layer.append(node);
    return node;
  };
  const mask = (rect: DOMRect, owner: HTMLElement) => {
    let left = Math.max(0, rect.left),
      top = Math.max(0, rect.top);
    let right = Math.min(innerWidth, rect.right),
      bottom = Math.min(innerHeight, rect.bottom);
    for (let parent: HTMLElement | null = owner; parent; parent = parent.parentElement) {
      const style = getComputedStyle(parent),
        bounds = parent.getBoundingClientRect();
      if (style.overflowX !== "visible") {
        left = Math.max(left, bounds.left + parent.clientLeft);
        right = Math.min(right, bounds.left + parent.clientLeft + parent.clientWidth);
      }
      if (style.overflowY !== "visible") {
        top = Math.max(top, bounds.top + parent.clientTop);
        bottom = Math.min(bottom, bounds.top + parent.clientTop + parent.clientHeight);
      }
    }
    if (right > left && bottom > top)
      rectangle(
        { left, top, width: right - left, height: bottom - top },
        "measurement-placeholder",
      );
  };
  const textMasks = () => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode,
        owner = node.parentElement;
      if (
        !owner ||
        !node.textContent?.trim() ||
        owner.closest("script,style,textarea,select,svg") ||
        getComputedStyle(owner).visibility !== "visible"
      )
        continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const rect of range.getClientRects()) if (visible(rect)) mask(rect, owner);
    }
    // Native values have no text nodes. Mirror text metrics only, outside the story.
    for (const control of root.querySelectorAll<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >("input,textarea,select")) {
      if (
        control instanceof HTMLInputElement &&
        !["text", "search", "email", "url", "tel", "password", "number"].includes(control.type)
      )
        continue;
      const rect = control.getBoundingClientRect(),
        style = getComputedStyle(control);
      if (!visible(rect) || style.visibility !== "visible") continue;
      const value =
        control instanceof HTMLSelectElement
          ? (control.selectedOptions[0]?.textContent ?? "")
          : control.value || control.placeholder;
      if (!value) continue;
      const mirror = document.createElement("div");
      const text = document.createTextNode(
        control instanceof HTMLInputElement && control.type === "password"
          ? "•".repeat(value.length)
          : value,
      );
      Object.assign(mirror.style, {
        position: "fixed",
        left: rect.left + control.clientLeft + "px",
        top: rect.top + control.clientTop + "px",
        width: control.clientWidth + "px",
        boxSizing: "border-box",
        font: style.font,
        letterSpacing: style.letterSpacing,
        textAlign: style.textAlign,
        padding: style.padding,
        whiteSpace: control instanceof HTMLTextAreaElement ? "pre-wrap" : "pre",
        overflowWrap: "break-word",
        opacity: "0",
      });
      mirror.append(text);
      layer.append(mirror);
      const range = document.createRange();
      range.selectNodeContents(text);
      for (const bound of range.getClientRects())
        mask(
          new DOMRect(
            bound.left - control.scrollLeft,
            bound.top - control.scrollTop,
            bound.width,
            bound.height,
          ),
          control,
        );
      mirror.remove();
    }
  };
  const render = () => {
    frame = 0;
    if (!running) return;
    layer.replaceChildren();
    layer.dataset.mode = options.mode;
    if (options.placeholder) textMasks();
    candidates = [];
    for (const element of root.querySelectorAll("*")) {
      if (!(element instanceof HTMLElement)) continue;
      const rect = element.getBoundingClientRect(),
        style = getComputedStyle(element);
      if (!visible(rect) || style.visibility !== "visible") continue;
      const container =
        !element.matches(controls) &&
        element.children.length > 0 &&
        (style.display.includes("flex") ||
          style.display.includes("grid") ||
          style.display === "block");
      const matches =
        options.mode === "controls"
          ? element.matches(controls)
          : options.mode === "text"
            ? ownText(element)
            : options.mode === "structure"
              ? container
              : options.mode === "spacing";
      if (!matches) continue;
      candidates.push(element);
      if (options.mode === "spacing" && element !== selected) continue;
      const marker = rectangle(
        rect,
        "measurement-box" + (element === selected ? " measurement-active" : ""),
      );
      marker.dataset.kind = options.mode;
      if (options.mode === "controls" || element === selected) {
        const caption = document.createElement("span");
        caption.textContent =
          options.mode === "text"
            ? style.fontSize + " / " + style.lineHeight + " · " + style.fontWeight
            : number(rect.width) + " × " + number(rect.height);
        marker.append(caption);
      }
      if (options.mode === "spacing" && element === selected) {
        const p = sides.map((side) => parseFloat(style.getPropertyValue("padding-" + side)) || 0);
        const m = sides.map((side) => parseFloat(style.getPropertyValue("margin-" + side)) || 0);
        const outer = rectangle(
          {
            left: rect.left - m[3]!,
            top: rect.top - m[0]!,
            width: rect.width + m[1]! + m[3]!,
            height: rect.height + m[0]! + m[2]!,
          },
          "measurement-margin",
        );
        outer.style.borderWidth = m.map((value) => Math.max(0, value) + "px").join(" ");
        const padding = rectangle(
          {
            left: rect.left + element.clientLeft,
            top: rect.top + element.clientTop,
            width: element.clientWidth,
            height: element.clientHeight,
          },
          "measurement-padding",
        );
        padding.style.borderWidth = p.map((value) => value + "px").join(" ");
      }
    }
    if (selected && root.contains(selected) && options.mode !== "off") {
      const rect = selected.getBoundingClientRect(),
        style = getComputedStyle(selected);
      report({
        name: label(selected),
        size: number(rect.width) + " × " + number(rect.height),
        typography:
          style.fontSize + " / " + style.lineHeight + " · Font weight " + style.fontWeight,
        spacing:
          "P " + box(style, "padding") + " · M " + box(style, "margin") + " · gap " + style.gap,
      });
    } else report(null);
  };
  const schedule = () => {
    if (running && !frame) frame = requestAnimationFrame(render);
  };
  const select = (event: Event) => {
    if (options.mode === "off") return;
    const element = event
      .composedPath()
      .find((node) => node instanceof HTMLElement && candidates.includes(node as HTMLElement)) as
      | HTMLElement
      | undefined;
    if (!element) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    selected = element;
    schedule();
  };
  const resize = new ResizeObserver(schedule),
    mutations = new MutationObserver(schedule),
    themes = new MutationObserver(schedule);
  const configure = (next: MeasurementOptions) => {
    if (next.mode !== options.mode) selected = null;
    options = next;
    const enabled = options.mode !== "off" || options.placeholder;
    if (enabled !== running) {
      running = enabled;
      if (running) {
        document.body.append(layer);
        resize.observe(root);
        mutations.observe(root, {
          subtree: true,
          childList: true,
          attributes: true,
          characterData: true,
        });
        themes.observe(document.documentElement, { attributes: true });
        themes.observe(document.body, { attributes: true });
        window.addEventListener("scroll", schedule, true);
        window.addEventListener("resize", schedule);
        root.addEventListener("input", schedule);
        root.addEventListener("change", schedule);
        root.addEventListener("transitionend", schedule);
        root.addEventListener("click", select, true);
      } else {
        cancelAnimationFrame(frame);
        frame = 0;
        resize.disconnect();
        mutations.disconnect();
        themes.disconnect();
        window.removeEventListener("scroll", schedule, true);
        window.removeEventListener("resize", schedule);
        root.removeEventListener("input", schedule);
        root.removeEventListener("change", schedule);
        root.removeEventListener("transitionend", schedule);
        root.removeEventListener("click", select, true);
        layer.remove();
        selected = null;
        report(null);
      }
    }
    schedule();
  };
  return { configure, dispose: () => configure({ mode: "off", placeholder: false }) };
}
