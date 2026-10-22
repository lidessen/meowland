import { defineComponent, h, type ComponentContract } from "meowjsx";
import { render } from "meowjsx/web";
import { uiTokens } from "../theme/tokens";
import { validateRegionLayout, type RegionLayoutDescription } from "./region-layout-types";

export const regionLayoutContract = {
  name: "region-layout",
  parts: ["root", "back", "grid", "region", "content"],
} as const satisfies ComponentContract;

export type RegionRoots = Readonly<Record<string, HTMLElement>>;
export interface RegionLayoutSurface {
  readonly regions: RegionRoots;
  showGroup(group: string): void;
  back(): void;
  dispose(): void;
}
export interface RegionLayoutOptions {
  isolateContent?: boolean;
  backLabel?: string;
  regionLabels?: Readonly<Record<string, string>>;
}

function gapValue(gap: string | undefined) {
  return gap === "none"
    ? "0px"
    : String(
        gap === "compact"
          ? uiTokens.space.group
          : gap === "relaxed"
            ? uiTokens.space.panel
            : uiTokens.space.section,
      );
}
function deepFocus(document: Document): Element | null {
  let element = document.activeElement;
  while (element?.shadowRoot?.activeElement) element = element.shadowRoot.activeElement;
  return element;
}

interface ShellCapture {
  root?: HTMLElement;
  grid?: HTMLElement;
  back?: HTMLButtonElement;
  containers: Record<string, HTMLElement>;
  roots: Record<string, HTMLElement>;
}
interface ShellProps {
  layout: RegionLayoutDescription;
  names: readonly string[];
  options: RegionLayoutOptions;
  capture: ShellCapture;
  onBack(): void;
}

const RegionLayoutShell = defineComponent<
  ShellProps,
  "region-layout",
  (typeof regionLayoutContract.parts)[number]
>(regionLayoutContract, ({ layout, names, options, capture, onBack }, context) =>
  context.part(
    "root",
    "div",
    {
      ref: (root: HTMLElement) => {
        capture.root = root;
      },
    },
    context.part(
      "back",
      "button",
      {
        type: "button",
        hidden: true,
        onClick: onBack,
        ref: (button: HTMLButtonElement) => {
          capture.back = button;
        },
      },
      options.backLabel ?? "Back",
    ),
    context.part(
      "grid",
      "div",
      {
        ref: (grid: HTMLElement) => {
          capture.grid = grid;
        },
      },
      names.map((name) =>
        context.part("region", "div", {
          "data-region": name,
          ref: (container: HTMLElement) => {
            capture.containers[name] = container;
            const target = options.isolateContent
              ? container.attachShadow({ mode: "open" })
              : container;
            const content = container.ownerDocument.createElement("div");
            content.dataset.meowuiPart = "region-layout/content";
            content.dataset.regionContent = name;
            const description = layout.regions[name]!;
            const inline = description.direction === "inline";
            Object.assign(content.style, {
              boxSizing: "border-box",
              minWidth: "0",
              minHeight: "0",
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: inline ? "row" : "column",
              flexWrap: inline ? "wrap" : "nowrap",
              alignItems: description.align ?? (inline ? "baseline" : "stretch"),
              gap: gapValue(description.gap),
              overflow: description.scrollOwner === "content" ? "hidden" : "auto",
              overscrollBehavior: "contain",
              position: "relative",
              contain: "layout paint",
            });
            if (description.scrollOwner === "content") content.dataset.scrollOwner = "content";
            else {
              content.dataset.scrollOwner = "layout";
              content.tabIndex = 0;
            }
            const label = options.regionLabels?.[name];
            if (label) {
              content.setAttribute("role", "region");
              content.setAttribute("aria-label", label);
            }
            target.append(content);
            capture.roots[name] = content;
          },
        }),
      ),
    ),
  ),
);

/** One renderer owns area geometry for built-in pages and isolated Extension leaves. */
export function mountRegionLayout(
  host: HTMLElement,
  description: RegionLayoutDescription,
  options: RegionLayoutOptions = {},
): RegionLayoutSurface {
  const layout = validateRegionLayout(description);
  const names = [...new Set(layout.areas.flat().filter((name): name is string => name !== null))];
  const groupOf = (name: string) => layout.regions[name]!.group ?? "main";
  const groups = [...new Set(names.map(groupOf))];
  const capture: ShellCapture = { containers: {}, roots: {} };
  let activeGroup = groups[0]!;
  let compact = false;
  let disposed = false;
  const history: { group: string; focus: HTMLElement | null }[] = [];
  const mounted = render(
    h(RegionLayoutShell, {
      layout,
      names,
      options,
      capture,
      onBack: () => back(),
    }),
    host,
  );
  const root = capture.root!,
    grid = capture.grid!,
    backButton = capture.back!;
  const columns = layout.columns ?? layout.areas[0]!.map(() => "fill" as const);
  const rows = layout.rows ?? layout.areas.map(() => "fill" as const);
  const box = (name: string) => {
    const positions = layout.areas.flatMap((row, y) =>
      row.flatMap((value, x) => (value === name ? [{ x, y }] : [])),
    );
    return {
      left: Math.min(...positions.map((point) => point.x)),
      right: Math.max(...positions.map((point) => point.x)),
      top: Math.min(...positions.map((point) => point.y)),
      bottom: Math.max(...positions.map((point) => point.y)),
    };
  };
  const boxes = new Map(names.map((name) => [name, box(name)]));
  function track(value: string, axis: "inline" | "block") {
    if (value === "fill") return "minmax(0, 1fr)";
    if (axis === "block") return "minmax(0, max-content)";
    if (value === "compact") return `minmax(0, ${uiTokens.layout.gridNormal})`;
    return `fit-content(${uiTokens.layout.gridWide})`;
  }
  function paint() {
    grid.style.gap = gapValue(layout.gap);
    const visible =
      compact && groups.length > 1 ? names.filter((name) => groupOf(name) === activeGroup) : names;
    if (compact) {
      grid.style.gridTemplateColumns = "minmax(0, 1fr)";
      grid.style.gridTemplateRows = visible
        .map((name) => {
          const bounds = boxes.get(name)!;
          return track(
            layout.regions[name]!.compactRow ??
              (rows.slice(bounds.top, bounds.bottom + 1).includes("fill") ? "fill" : "content"),
            "block",
          );
        })
        .join(" ");
    } else {
      grid.style.gridTemplateColumns = columns.map((value) => track(value, "inline")).join(" ");
      grid.style.gridTemplateRows = rows.map((value) => track(value, "block")).join(" ");
    }
    root.dataset.compact = String(compact);
    backButton.hidden = !compact || (!history.length && activeGroup === groups[0]);
    for (const name of names) {
      const container = capture.containers[name]!;
      container.hidden = !visible.includes(name);
      container.inert = container.hidden;
      if (compact) {
        container.style.gridColumn = "1";
        container.style.gridRow = String(visible.indexOf(name) + 1);
      } else {
        const bounds = boxes.get(name)!;
        container.style.gridColumn = `${bounds.left + 1} / ${bounds.right + 2}`;
        container.style.gridRow = `${bounds.top + 1} / ${bounds.bottom + 2}`;
      }
    }
  }
  function focusGroup() {
    const first = names.find((name) => groupOf(name) === activeGroup);
    if (first) {
      const target = capture.roots[first]!;
      if (!target.hasAttribute("tabindex")) target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
  }
  function back() {
    if (disposed) return;
    const previous =
      history.pop() ?? (activeGroup !== groups[0] ? { group: groups[0]!, focus: null } : undefined);
    if (!previous) return;
    activeGroup = previous.group;
    paint();
    if (compact) {
      if (previous.focus?.isConnected) previous.focus.focus({ preventScroll: true });
      else focusGroup();
    }
  }
  function resize(force = false) {
    if (disposed) return;
    const style = getComputedStyle(root);
    const dimension = (name: string, fallback: number) =>
      parseFloat(style.getPropertyValue(name)) || fallback;
    const minimum = columns.reduce(
      (total, column) =>
        total +
        dimension(
          column === "fill" ? uiTokens.layout.gridWide.name : uiTokens.layout.gridCompact.name,
          column === "fill" ? 320 : 160,
        ),
      0,
    );
    const gap =
      layout.gap === "none"
        ? 0
        : dimension(
            layout.gap === "compact"
              ? uiTokens.space.group.name
              : layout.gap === "relaxed"
                ? uiTokens.space.panel.name
                : uiTokens.space.section.name,
            20,
          );
    const next = columns.length > 1 && root.clientWidth < minimum + gap * (columns.length - 1);
    const focused = deepFocus(host.ownerDocument);
    let nextGroup = activeGroup;
    // A focused region stays visible when the window becomes compact.
    if (next && focused instanceof HTMLElement) {
      const region = names.find((name) => capture.roots[name]!.contains(focused));
      if (region) nextGroup = groupOf(region);
    }
    if (!force && compact === next && activeGroup === nextGroup) return;
    compact = next;
    activeGroup = nextGroup;
    while (history.at(-1)?.group === activeGroup) history.pop();
    paint();
  }
  const view = root.ownerDocument.defaultView!;
  let resizeFrame: number | undefined;
  const observer = new view.ResizeObserver(() => {
    if (disposed || resizeFrame !== undefined) return;
    resizeFrame = view.requestAnimationFrame(() => {
      resizeFrame = undefined;
      resize();
    });
  });
  observer.observe(root);
  resize(true);
  return {
    regions: Object.freeze(capture.roots),
    showGroup(group) {
      if (disposed) return;
      if (!groups.includes(group)) throw new Error("Unknown region group");
      if (group !== activeGroup) {
        const focused = deepFocus(host.ownerDocument);
        history.push({
          group: activeGroup,
          focus: focused instanceof HTMLElement ? focused : null,
        });
        activeGroup = group;
      }
      paint();
      if (compact) focusGroup();
    },
    back,
    dispose() {
      if (disposed) return;
      disposed = true;
      observer.disconnect();
      if (resizeFrame !== undefined) view.cancelAnimationFrame(resizeFrame);
      history.length = 0;
      mounted.unmount();
    },
  };
}
