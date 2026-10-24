import {
  derived,
  h,
  unwrap,
  type Child,
  type MaybeSignal,
  type Props,
  type Context,
} from "meowjsx";
import { Button } from "./button";
import { copyTextToClipboard } from "../clipboard";

/** A header part appears only when its prop has content; a Signal counts as provided. */
function provided(value: MaybeSignal<Child> | undefined): boolean {
  return value !== undefined && value !== null && value !== false;
}

/** Bounds on what one diagram may cost; rendering is synchronous on the main thread. */
export interface MermaidDiagramLimits {
  /** Longest source accepted, in characters. */
  source?: number;
  /** Largest SVG produced, in characters. */
  output?: number;
  /** Most edges a graph may have. */
  edges?: number;
}

export interface MermaidDiagramProps extends Props {
  /** Mermaid source. A Signal re-renders the diagram in place. */
  source: MaybeSignal<string>;
  /** The diagram's name at the start of the header. A plain value is fixed for the mount. */
  title?: MaybeSignal<Child>;
  /** A quiet supporting line for the name. A plain value is fixed for the mount. */
  caption?: MaybeSignal<Child>;
  /** Host buttons or links; they render before the built-in Copy source action. */
  actions?: MaybeSignal<Child>;
  /**
   * Zoom and pan controls: `"auto"` shows them only when the diagram is larger than its frame.
   * Fixed for the mount.
   */
  zoom?: boolean | "auto";
  /** Tighter or looser bounds than the defaults (50,000 source characters, 2,000 edges). */
  limits?: MermaidDiagramLimits;
  /** Hosts may supply a clipboard implementation; the default uses the browser clipboard. */
  onCopy?: (source: string) => Promise<void>;
}

type Mounted = { update(text: string, options?: object): void; destroy(): void; error: unknown };

/**
 * A Mermaid diagram drawn as themed SVG by Pele, with an optional title and a Copy source
 * action. Before the client mounts it, and when the source cannot be drawn, it shows the source
 * itself; links, images and icons inside diagrams are off, so untrusted text draws safely.
 */
export function MermaidDiagram(
  { source, title, caption, actions, zoom = "auto", limits, onCopy, ...props }: MermaidDiagramProps,
  context: Context<typeof MermaidDiagram>,
) {
  // "source" until the first drawing lands, so server output and slow loads read as text.
  const state = context.signal<"source" | "ready" | "error">("source");
  const errorText = context.signal("");
  const copying = context.signal(false);
  const feedback = context.signal("");
  const options = {
    links: false,
    images: false,
    zoom,
    limit: limits?.source ?? 50_000,
    maxEdges: limits?.edges ?? 2_000,
    ...(limits?.output === undefined ? {} : { outputLimit: limits.output }),
  };
  let canvas: HTMLElement | undefined;
  let mounted: Mounted | undefined;
  let version = 0;
  let disposed = false;
  context.onCleanup(() => {
    disposed = true;
    mounted?.destroy();
    mounted = undefined;
  });

  const fail = (error: unknown) => {
    errorText.value =
      error instanceof Error && error.message ? error.message : "This diagram could not be drawn.";
    state.value = "error";
  };

  const draw = async (text: string) => {
    const current = ++version;
    try {
      // Loaded on first draw: the engine and each diagram type stay out of the host bundle.
      const pele = await import("pele/lazy");
      await pele.load(pele.detectType(text));
      // A newer source or an unmount while loading wins; this result is dropped.
      if (disposed || current !== version || !canvas) return;
      let failed: unknown;
      const onError = (error: unknown) => {
        failed = error ?? new Error("This diagram could not be drawn.");
      };
      // Pele sizes text by an option, not by CSS; the canvas carries the theme's body size.
      const fontSize = Number.parseFloat(getComputedStyle(canvas).fontSize) || undefined;
      const drawing = { ...options, fontSize, onError };
      if (mounted) mounted.update(text, drawing);
      else mounted = pele.mount(canvas, text, drawing) as Mounted;
      const error = failed ?? mounted.error;
      if (error) fail(error);
      else state.value = "ready";
    } catch (error) {
      if (!disposed && current === version) fail(error);
    }
  };

  context.effect(() => {
    const text = unwrap(source);
    if (canvas) void draw(text);
  });

  const copy = async () => {
    if (copying.value) return;
    copying.value = true;
    feedback.value = "";
    const text = unwrap(source);
    try {
      if (onCopy) await onCopy(text);
      else await copyTextToClipboard(text);
      if (!disposed) feedback.value = "Copied";
    } catch {
      if (!disposed) feedback.value = "Copy failed; select the source and copy it manually.";
    } finally {
      if (!disposed) copying.value = false;
    }
  };

  return (
    <figure {...props} data-state={state} ref={[context.parts.root, props.ref]}>
      {[
        <figcaption ref={[context.parts.header]}>
          {[
            provided(title) ? <span ref={[context.parts.title]}>{title}</span> : null,
            provided(caption) ? <span ref={[context.parts.caption]}>{caption}</span> : null,
            <div ref={[context.parts.actions]}>
              {[
                provided(actions) ? actions : null,
                <Button variant="quiet" size="small" disabled={copying} onClick={copy}>
                  Copy source
                </Button>,
              ]}
            </div>,
          ]}
        </figcaption>,
        <div
          ref={[
            context.parts.canvas,
            (element: HTMLElement) => {
              canvas = element;
              void draw(unwrap(source));
              return () => {
                canvas = undefined;
              };
            },
          ]}
        ></div>,
        <p
          role={"status"}
          hidden={derived(() => state.value !== "error")}
          ref={[context.parts.error]}
        >
          {errorText}
        </p>,
        <pre
          tabIndex={0}
          aria-label={"Diagram source"}
          hidden={derived(() => state.value === "ready")}
          ref={[context.parts.source]}
        >
          {source}
        </pre>,
        <span aria-live={"polite"} ref={[context.parts.feedback]}>
          {feedback}
        </span>,
      ]}
    </figure>
  );
}
MermaidDiagram.meta = {
  name: "mermaid-diagram",
  parts: ["root", "header", "title", "caption", "actions", "feedback", "canvas", "source", "error"],
} as const;
