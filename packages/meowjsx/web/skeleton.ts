import type { ComponentObservation, ObservedComponent } from "../src/index";

export interface SkeletonOptions {
  scope: Element | (() => Iterable<Node>);
  exclude?: readonly Element[];
  observe?: boolean;
  preserveExisting?: boolean;
  observation?: { source: ComponentObservation<Node>; root?: ObservedComponent<Node> };
}

export interface SkeletonSnapshot {
  ranges: number;
  mediaElements: number;
  limitations: Record<string, number>;
}

export interface SkeletonController {
  readonly active: boolean;
  readonly snapshot: SkeletonSnapshot;
  activate(): SkeletonSnapshot;
  update(options?: { exclude?: readonly Element[] }): SkeletonSnapshot;
  dispose(): void;
}

const owners = new WeakMap<Node, symbol>();

/** A visual Web controller, independent of runtime plugins and interaction policy. */
export function createSkeletonController(options: SkeletonOptions): SkeletonController {
  const initial =
    typeof options.scope === "function"
      ? (options.scope()[Symbol.iterator]().next().value as Node | undefined)
      : options.scope;
  const document = initial?.ownerDocument;
  if (!document?.defaultView) throw new Error("Skeleton scope must belong to a live document");
  const window = document.defaultView;
  const registry = window.CSS.highlights;
  if (!registry || typeof window.Highlight === "undefined")
    throw new Error("Skeleton requires CSS Custom Highlight support");
  const token = window.crypto.randomUUID();
  const attribute = `data-meowjsx-skeleton-${token}`;
  const prefix = `meowjsx-skeleton-${token}`;
  const owner = Symbol(prefix);
  const style = document.createElement("style");
  style.dataset.meowjsxSkeletonStyle = token;
  const marked = new Set<Element>();
  const claimed = new Set<Node>();
  const highlights: string[] = [];
  let excludes = options.exclude ?? [];
  let active = false,
    disposed = false,
    updating = false;
  let frame: number | undefined;
  let observer: MutationObserver | undefined;
  let resizeObserver: ResizeObserver | undefined;
  let unsubscribe: (() => void) | undefined;
  let watchedRoots = new Set<Element>();
  let watchedAncestors = new Set<Element>();
  let snapshot: SkeletonSnapshot = { ranges: 0, mediaElements: 0, limitations: {} };
  const scheme = window.matchMedia("(prefers-color-scheme: dark)");
  const stylesheetLoaded = (event: Event) => {
    if (
      event.target instanceof window.HTMLLinkElement &&
      event.target.relList.contains("stylesheet")
    )
      schedule();
  };
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true })!;

  const clearPaint = () => {
    for (const name of highlights) registry.delete(name);
    highlights.length = 0;
    for (const element of marked) element.removeAttribute(attribute);
    marked.clear();
    for (const node of claimed) if (owners.get(node) === owner) owners.delete(node);
    claimed.clear();
    style.textContent = "";
  };
  const scopeNodes = () => {
    const result = new Set<Node>();
    const nodes = typeof options.scope === "function" ? options.scope() : [options.scope];
    let visited = 0;
    for (const node of nodes) {
      if (++visited > 40000) throw new Error("Skeleton exceeds 40000 scope nodes");
      result.add(node);
    }
    return result;
  };
  const collect = () => {
    if (options.observation) {
      const selected = typeof options.scope === "function" ? scopeNodes() : null;
      const elementScope = typeof options.scope === "function" ? null : options.scope;
      const result = new Set<Node>();
      const observed = new Set<Node>();
      const add = (node: Node) => {
        if (result.size >= 40000 && !result.has(node))
          throw new Error("Skeleton exceeds 40000 scope nodes");
        result.add(node);
      };
      for (const instance of options.observation.source.read(options.observation.root))
        for (const node of instance.nodes) {
          observed.add(node);
          if (selected ? selected.has(node) : elementScope!.contains(node)) add(node);
        }
      // A plain host root or external DOM scope may have no observed component owner.
      if (elementScope) add(elementScope);
      else for (const node of selected!) add(node);
      // Raw HTML and third-party DOM have no renderer owner. Supplement only unknown branches.
      const known = new Set(result);
      for (const node of known) {
        if (node.nodeType !== window.Node.ELEMENT_NODE) continue;
        for (const child of node.childNodes) {
          if (observed.has(child) || child.nodeType === window.Node.COMMENT_NODE) continue;
          add(child);
          const walker = document.createTreeWalker(
            child,
            window.NodeFilter.SHOW_ELEMENT | window.NodeFilter.SHOW_TEXT,
          );
          let descendant: Node | null;
          while ((descendant = walker.nextNode())) add(descendant);
        }
      }
      return result;
    }
    if (typeof options.scope === "function") {
      return scopeNodes();
    }
    const result = new Set<Node>([options.scope]);
    const walker = document.createTreeWalker(
      options.scope,
      window.NodeFilter.SHOW_ELEMENT | window.NodeFilter.SHOW_TEXT,
    );
    let node: Node | null;
    while ((node = walker.nextNode())) {
      result.add(node);
      if (result.size > 40000) throw new Error("Skeleton exceeds 40000 scope nodes");
    }
    return result;
  };
  const claim = (node: Node) => {
    const existing = owners.get(node);
    if (existing && existing !== owner) {
      if (options.preserveExisting) return false;
      throw new Error("Skeleton scopes must not overlap painted nodes");
    }
    owners.set(node, owner);
    claimed.add(node);
    return true;
  };
  const stopObserving = () => {
    if (frame !== undefined) window.cancelAnimationFrame(frame);
    frame = undefined;
    observer?.disconnect();
    observer = undefined;
    resizeObserver?.disconnect();
    resizeObserver = undefined;
    watchedRoots.clear();
    watchedAncestors.clear();
    unsubscribe?.();
    unsubscribe = undefined;
    window.removeEventListener("resize", schedule);
    scheme.removeEventListener("change", schedule);
    document.head.removeEventListener("load", stylesheetLoaded, true);
  };
  const update = (next?: { exclude?: readonly Element[] }): SkeletonSnapshot => {
    if (disposed) throw new Error("Skeleton controller is disposed");
    if (next?.exclude) excludes = next.exclude;
    if (!active || updating) return snapshot;
    updating = true;
    clearPaint();
    const result: SkeletonSnapshot = { ranges: 0, mediaElements: 0, limitations: {} };
    const note = (reason: string) => {
      result.limitations[reason] = (result.limitations[reason] ?? 0) + 1;
    };
    const colorCache = new Map<string, number[]>();
    const rgba = (value: string) => {
      const cached = colorCache.get(value);
      if (cached) return cached;
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = value;
      context.fillRect(0, 0, 1, 1);
      const color = Array.from(context.getImageData(0, 0, 1, 1).data);
      colorCache.set(value, color);
      return color;
    };
    const tint = (element: Element) => {
      const color = rgba(window.getComputedStyle(element).color);
      let background: number[] | undefined;
      for (let parent: Element | null = element; parent; parent = parent.parentElement) {
        const computed = window.getComputedStyle(parent);
        if (computed.backgroundImage !== "none") note("approximate-background-image-color");
        const value = rgba(computed.backgroundColor);
        if (value[3] === 255) {
          background = value;
          break;
        }
        if (value[3] !== 0) note("approximate-translucent-background-color");
      }
      background ??= [255, 255, 255, 255];
      const strength = (0.12 * color[3]!) / 255;
      return `rgb(${color
        .slice(0, 3)
        .map((value, index) => Math.round(background![index]! * (1 - strength) + value * strength))
        .join(",")})`;
    };
    try {
      const nodes = collect();
      if (nodes.size > 40000) throw new Error("Skeleton exceeds 40000 scope nodes");
      const groups = new Map<string, Range[]>();
      const media: { element: Element; color: string; kind: string }[] = [];
      for (const node of nodes) {
        if (!node.isConnected || node.ownerDocument !== document) continue;
        const element =
          node.nodeType === window.Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
        if (
          !element ||
          excludes.some((excluded) => excluded === element || excluded.contains(element))
        )
          continue;
        if (node.getRootNode() !== document) {
          note("shadow-root-content-unchanged");
          continue;
        }
        if (!element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
        if (node.nodeType === window.Node.TEXT_NODE && node.textContent?.trim()) {
          if (element.closest("script,style,template,noscript,textarea,select,svg")) continue;
          const range = document.createRange();
          range.selectNodeContents(node);
          if (!range.getClientRects().length) continue;
          if (!claim(node)) {
            note("existing-skeleton-preserved");
            continue;
          }
          const color = tint(element),
            ranges = groups.get(color) ?? [];
          ranges.push(range);
          groups.set(color, ranges);
          if (++result.ranges > 10000) throw new Error("Skeleton exceeds 10000 text ranges");
        } else if (
          node.nodeType === window.Node.ELEMENT_NODE &&
          element.matches("img,svg,input,textarea,select")
        ) {
          if (element.matches("svg svg") || excludes.some((excluded) => element.contains(excluded)))
            continue;
          if (!claim(element)) {
            note("existing-skeleton-preserved");
            continue;
          }
          media.push({ element, color: tint(element), kind: element.localName });
          if (++result.mediaElements > 2000)
            throw new Error("Skeleton exceeds 2000 media elements");
        }
      }
      const rules: string[] = [];
      for (const [color, ranges] of groups) {
        const name = `${prefix}-${highlights.length}`;
        registry.set(name, new window.Highlight(...ranges));
        highlights.push(name);
        rules.push(
          `::highlight(${name}){color:${color};background-color:${color};text-shadow:none;}`,
        );
      }
      for (const [index, { element, color, kind }] of media.entries()) {
        const value = `m${index}`;
        element.setAttribute(attribute, value);
        marked.add(element);
        const selector = `[${attribute}="${value}"]`;
        rules.push(
          `${selector}{background-color:${color}!important;color:${color}!important;border-color:${color}!important;box-shadow:none!important;text-shadow:none!important;caret-color:transparent!important;-webkit-text-fill-color:${color}!important;}`,
        );
        if (kind === "img")
          rules.push(`${selector}{object-position:1000000px 1000000px!important;}`);
        else if (kind === "svg")
          rules.push(
            `${selector},${selector} *{fill:${color}!important;stroke:${color}!important;}`,
          );
        else {
          rules.push(`${selector}::placeholder{color:${color}!important;opacity:1!important;}`);
          if (
            kind === "input" &&
            !["text", "email", "url", "tel", "search", "password", "number", ""].includes(
              (element as HTMLInputElement).type,
            )
          )
            note("native-control-decoration-may-remain");
          if (kind === "select") note("native-control-decoration-may-remain");
        }
      }
      style.textContent = rules.join("\n");
      if (!style.isConnected) document.head.append(style);
      snapshot = result;
      if (observer) watchScopes();
      return result;
    } catch (error) {
      active = false;
      stopObserving();
      clearPaint();
      style.remove();
      throw error;
    } finally {
      updating = false;
    }
  };
  const schedule = () => {
    if (!active || disposed || frame !== undefined) return;
    frame = window.requestAnimationFrame(() => {
      frame = undefined;
      if (active && !disposed) update();
    });
  };
  const watchScopes = () => {
    if (!observer || !resizeObserver) return;
    const candidates = scopeNodes();
    const roots = new Set<Element>();
    for (const node of candidates) {
      const element =
        node.nodeType === window.Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
      if (!element || !element.isConnected || element.ownerDocument !== document) continue;
      if ([...roots].some((root) => root.contains(element))) continue;
      for (const root of roots) if (element.contains(root)) roots.delete(root);
      roots.add(element);
    }
    const ancestors = new Set<Element>();
    for (const root of roots)
      for (let parent = root.parentElement; parent; parent = parent.parentElement)
        if (![...roots].some((scope) => scope.contains(parent))) ancestors.add(parent);
    if (
      roots.size === watchedRoots.size &&
      [...roots].every((root) => watchedRoots.has(root)) &&
      ancestors.size === watchedAncestors.size &&
      [...ancestors].every((ancestor) => watchedAncestors.has(ancestor))
    )
      return;
    observer.disconnect();
    for (const previous of watchedRoots)
      if (!roots.has(previous)) resizeObserver.unobserve(previous);
    const attributes = [
      "class",
      "style",
      "src",
      "hidden",
      "open",
      "disabled",
      "value",
      "data-meowui-color-scheme",
      "data-theme",
      "color-scheme",
    ];
    for (const root of roots) {
      observer.observe(root, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: attributes,
      });
      if (!watchedRoots.has(root)) resizeObserver.observe(root);
    }
    for (const ancestor of ancestors)
      observer.observe(ancestor, {
        childList: true,
        attributes: true,
        attributeFilter: attributes,
      });
    // Stylesheet changes can affect the scope without mutating its subtree.
    observer.observe(document.head, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["href", "media", "disabled"],
    });
    watchedRoots = roots;
    watchedAncestors = ancestors;
  };
  const activate = () => {
    if (disposed) throw new Error("Skeleton controller is disposed");
    active = true;
    try {
      const result = update();
      if (options.observe !== false && !observer) {
        observer = new window.MutationObserver((records) => {
          const ownedStyle = (node: Node) => {
            const element =
              node.nodeType === window.Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
            return !!element?.closest("style[data-meowjsx-skeleton-style]");
          };
          if (
            records.some(
              (record) =>
                !ownedStyle(record.target) &&
                // Ancestor child lists detect scope replacement without watching their subtrees.
                (!(record.type === "childList" && watchedAncestors.has(record.target as Element)) ||
                  [...record.addedNodes, ...record.removedNodes].some((node) =>
                    [...watchedRoots, ...scopeNodes()].some(
                      (root) => node === root || node.contains(root),
                    ),
                  )) &&
                (!(record.target === document.head || document.head.contains(record.target)) ||
                  (record.target.nodeType === window.Node.ELEMENT_NODE
                    ? (record.target as Element)
                    : record.target.parentElement
                  )?.closest("style,link") ||
                  [...record.addedNodes, ...record.removedNodes].some(
                    (node) =>
                      node.nodeType === window.Node.ELEMENT_NODE &&
                      (node as Element).matches("style,link"),
                  )) &&
                !(record.type === "attributes" && record.attributeName === attribute) &&
                !(
                  record.type === "childList" &&
                  [...record.addedNodes, ...record.removedNodes].every(ownedStyle)
                ),
            )
          )
            schedule();
        });
        resizeObserver = new window.ResizeObserver(schedule);
        watchScopes();
        unsubscribe = options.observation?.source.subscribe(schedule, {
          root: options.observation.root,
        });
        window.addEventListener("resize", schedule);
        scheme.addEventListener("change", schedule);
        document.head.addEventListener("load", stylesheetLoaded, true);
      }
      return result;
    } catch (error) {
      active = false;
      stopObserving();
      clearPaint();
      style.remove();
      throw error;
    }
  };
  return {
    get active() {
      return active;
    },
    get snapshot() {
      return snapshot;
    },
    activate,
    update,
    dispose() {
      if (disposed) return;
      disposed = true;
      active = false;
      stopObserving();
      clearPaint();
      style.remove();
    },
  };
}
