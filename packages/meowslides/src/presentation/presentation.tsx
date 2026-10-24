import { h, type Child, type Context, type Props } from "meowjsx";
import {
  batch,
  mapSignal,
  signal,
  unwrap,
  type ReadableSignal,
  type WritableSignal,
} from "meowjsx/signal";
import { Button, Inline, LayoutItem, Popover, Stack, Icon } from "meowtail";
import {
  PresentationActivity,
  PresentationSlide,
  activitySignal,
  usePresentationActivity,
} from "./context";
import {
  positionIndex,
  validateSlides,
  type PresentationProps,
  type SlideDefinition,
  type SlidePosition,
  type SlideBackground,
} from "./types";
import { entranceMotion, pendingEntranceAnimations } from "./transition";
import { hasPresentationOverflow } from "./diagnostics";

const presentationMeta = {
  name: "presentation",
  parts: [
    "root",
    "header",
    "title",
    "viewport",
    "stage",
    "slide",
    "background",
    "background-image",
    "background-overlay",
    "controls",
    "navigation",
    "page-number",
    "step",
    "slide-picker",
    "tools",
    "position",
    "soundtrack",
    "diagnostic",
  ],
} as const;

let nextPresentationId = 0;

interface CurrentSlideProps extends Props {
  slide: SlideDefinition;
  position: WritableSignal<SlidePosition>;
  enabled: ReadableSignal<boolean>;
  focusFallback(): void;
}

const SlideContent = ({ slide, position }: CurrentSlideProps): Child =>
  slide.render({ step: mapSignal(position, (value) => value.step) });

function CurrentSlide(
  { slide, position, enabled, focusFallback }: CurrentSlideProps,
  context: Context<typeof CurrentSlide>,
): Child {
  const parent = usePresentationActivity();
  const activity = activitySignal(context, () => parent.value && enabled.value);
  const environment = {
    step: mapSignal(position, (value) => value.step),
    steps: slide.steps ?? 0,
    focusFallback,
  };
  return (
    <PresentationActivity.Provider value={activity}>
      <PresentationSlide.Provider value={environment}>
        <SlideContent
          slide={slide}
          position={position}
          enabled={enabled}
          focusFallback={focusFallback}
        />
      </PresentationSlide.Provider>
    </PresentationActivity.Provider>
  );
}
CurrentSlide.meta = { name: "presentation-current-slide", parts: [] } as const;

/** One mounted page; authored experiment signals remain owned by the work's host. */
export function Presentation(
  {
    title,
    slides,
    position: suppliedPosition,
    active = true,
    transition = "none",
    background,
    soundtrack,
    className,
    slideClassName,
    ...props
  }: PresentationProps,
  context: Context<typeof Presentation>,
) {
  const parts = context.parts;
  validateSlides(slides);
  const position = suppliedPosition ?? signal<SlidePosition>({ slideId: slides[0]!.id, step: 0 });
  positionIndex(slides, position.value);
  const resolveBackground = (): SlideBackground =>
    unwrap(slides[positionIndex(slides, position.value)]!.background) ??
    unwrap(background) ??
    "theme";
  const resolvedBackground = signal(resolveBackground());
  context.effect(() => {
    resolvedBackground.value = resolveBackground();
  });
  const paused = signal(false);
  const optionsOpen = signal(false);
  const optionsId = `meowui-presentation-options-${++nextPresentationId}`;
  let firstOption: HTMLButtonElement | undefined;
  const visible = signal(false);
  const activity = activitySignal(context, () => unwrap(active) && visible.value && !paused.value);
  const scale = signal(1);
  const actualSize = signal(false);
  const overflow = signal(false);
  let viewport: HTMLElement | undefined;
  let stage: HTMLElement | undefined;
  let frame: HTMLElement | undefined;
  let heading: HTMLElement | undefined;
  let currentId = position.value.slideId;
  let currentEnabled = signal(true);
  const motion = entranceMotion(context, activity);
  let reducedMotion: MediaQueryList | undefined;
  let entranceFrame: number | undefined;
  let navigationGeneration = 0;
  const cancelEntrance = () => {
    if (entranceFrame !== undefined)
      stage?.ownerDocument.defaultView?.cancelAnimationFrame(entranceFrame);
    entranceFrame = undefined;
    motion.cancel();
  };
  context.effect(() => {
    if (!activity.value) cancelEntrance();
  });
  const focusFallback = () => heading?.focus();
  // Use the first child as the signal's initial value: setting it before mount
  // would queue a notification and mount the same page again for new subscribers.
  const page = signal<Child>(
    <CurrentSlide
      slide={slides[positionIndex(slides, position.value)]!}
      position={position}
      enabled={currentEnabled}
      focusFallback={focusFallback}
    />,
  );
  let pendingOverflow: Promise<unknown> | undefined;
  const fit = () => {
    const originalSize = actualSize.value;
    if (!viewport) return;
    scale.value = originalSize
      ? 1
      : Math.min(viewport.clientWidth / 1280, viewport.clientHeight / 720, 1);
    if (!stage) return;
    // Reveal movement can briefly enlarge scroll geometry. Measure the logical
    // content once our finite decorations settle, never an author's own clock.
    const animations = pendingEntranceAnimations(stage);
    if (animations.length) {
      if (!pendingOverflow) {
        const pending = Promise.allSettled(animations.map((animation) => animation.finished));
        pendingOverflow = pending;
        void pending.then(() => {
          if (pendingOverflow !== pending) return;
          pendingOverflow = undefined;
          fit();
        });
      }
      return;
    }
    // Signal-bound transforms may flush after this resize callback. Geometry
    // and its one-logical-pixel tolerance must use the same applied scale.
    overflow.value = hasPresentationOverflow(stage, stage.getBoundingClientRect().width / 1280);
  };
  context.effect(fit);
  context.effect(() => {
    const value = position.value;
    const index = positionIndex(slides, value);
    if (currentId === value.slideId) return;
    const direction =
      index > slides.findIndex((slide) => slide.id === currentId) ? "left" : "right";
    const generation = ++navigationGeneration;
    cancelEntrance();
    // Flush the old activity gate before the renderer mounts a replacement.
    batch(() => {
      currentEnabled.value = false;
    });
    const hadPageFocus = stage && stage.contains(stage.ownerDocument.activeElement);
    if (hadPageFocus) focusFallback();
    currentId = value.slideId;
    currentEnabled = signal(true);
    page.value = (
      <CurrentSlide
        slide={slides[index]!}
        position={position}
        enabled={currentEnabled}
        focusFallback={focusFallback}
      />
    );
    // Rendering is flushed before the next frame. A superseded navigation must
    // never decorate a page that has already stopped or been replaced.
    if (activity.value && !reducedMotion?.matches)
      entranceFrame = stage?.ownerDocument.defaultView?.requestAnimationFrame(() => {
        entranceFrame = undefined;
        if (generation !== navigationGeneration || currentId !== position.value.slideId) return;
        if (stage?.isConnected) motion.play(stage, transition, direction, frame);
      });
    queueMicrotask(fit);
  });
  context.onCleanup(() => {
    pendingOverflow = undefined;
    currentEnabled.set(false);
    cancelEntrance();
  });
  const move = (delta: -1 | 1) => {
    const current = position.value;
    const index = positionIndex(slides, current);
    const last = slides[index]!.steps ?? 0;
    if (delta === 1) {
      if (current.step < last) position.value = { ...current, step: current.step + 1 };
      else if (index < slides.length - 1)
        position.value = { slideId: slides[index + 1]!.id, step: 0 };
    } else if (current.step > 0) position.value = { ...current, step: current.step - 1 };
    else if (index > 0)
      position.value = { slideId: slides[index - 1]!.id, step: slides[index - 1]!.steps ?? 0 };
  };
  const previousDisabled = mapSignal(
    position,
    (value) => positionIndex(slides, value) === 0 && value.step === 0,
  );
  const nextDisabled = mapSignal(
    position,
    (value) =>
      positionIndex(slides, value) === slides.length - 1 &&
      value.step === (slides.at(-1)!.steps ?? 0),
  );
  const keydown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
      return;
    const target = event.target as Element | null;
    if (
      target?.closest(
        'input,textarea,select,button,a,video,audio,summary,[contenteditable]:not([contenteditable="false"]),[role="slider"],[role="textbox"],[role="combobox"],[data-presentation-keys="local"]',
      )
    )
      return;
    if (event.key === "ArrowRight" || event.key === "PageDown") {
      event.preventDefault();
      move(1);
    } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
      event.preventDefault();
      move(-1);
    }
  };
  const frameStyle = {
    width: mapSignal(scale, (value) => `${1280 * value}px`),
    height: mapSignal(scale, (value) => `${720 * value}px`),
  };
  return (
    <PresentationActivity.Provider value={activity}>
      <section
        {...props}
        className={className}
        aria-label={title}
        tabIndex={0}
        onKeyDown={(event: KeyboardEvent) => {
          if (typeof props.onKeyDown === "function") props.onKeyDown(event);
          keydown(event);
        }}
        ref={[
          parts.root,
          (element: HTMLElement) => {
            const document = element.ownerDocument;
            reducedMotion = document.defaultView?.matchMedia("(prefers-reduced-motion: reduce)");
            const updateMotionPreference = (event: MediaQueryListEvent) => {
              if (event.matches) cancelEntrance();
            };
            reducedMotion?.addEventListener("change", updateMotionPreference);
            const updateVisibility = () => {
              visible.value = document.visibilityState !== "hidden";
            };
            updateVisibility();
            document.addEventListener("visibilitychange", updateVisibility);
            return () => {
              reducedMotion?.removeEventListener("change", updateMotionPreference);
              reducedMotion = undefined;
              document.removeEventListener("visibilitychange", updateVisibility);
              visible.value = false;
            };
          },
          props.ref,
        ]}
      >
        <header ref={parts.header}>
          <h1
            tabIndex={-1}
            title={title}
            ref={[
              parts.title,
              (element: HTMLElement) => {
                heading = element;
                return () => {
                  heading = undefined;
                };
              },
            ]}
          >
            {title}
          </h1>
          <p ref={parts.position} role="status" aria-live="polite" aria-atomic="true">
            {mapSignal(
              position,
              (value) =>
                `${positionIndex(slides, value) + 1} / ${slides.length} · ${slides[positionIndex(slides, value)]!.title} · ${value.step} / ${slides[positionIndex(slides, value)]!.steps ?? 0}`,
            )}
          </p>
        </header>
        <div
          ref={[
            parts.viewport,
            (element: HTMLElement) => {
              viewport = element;
              const Resize = element.ownerDocument.defaultView?.ResizeObserver;
              const observer = Resize ? new Resize(fit) : undefined;
              observer?.observe(element);
              fit();
              return () => {
                observer?.disconnect();
                viewport = undefined;
              };
            },
          ]}
          data-actual-size={actualSize}
        >
          <div
            ref={[
              parts.stage,
              (element: HTMLElement) => {
                frame = element;
                return () => {
                  frame = undefined;
                };
              },
            ]}
            style={frameStyle}
          >
            <article
              className={slideClassName}
              style={{ transform: mapSignal(scale, (value) => `scale(${value})`) }}
              data-background-foreground={mapSignal(resolvedBackground, (value) =>
                value === "theme" ? "theme" : (value.foreground ?? "theme"),
              )}
              ref={[
                parts.slide,
                (element: HTMLElement) => {
                  stage = element;
                  const view = element.ownerDocument.defaultView;
                  const Resize = view?.ResizeObserver;
                  const observer = Resize ? new Resize(fit) : undefined;
                  observer?.observe(element);
                  const regions = new Set<Element>();
                  const observeRegions = () => {
                    const current = new Set(
                      element.querySelectorAll(
                        '[data-meowui-part="presentation-layout/header"],[data-meowui-part="presentation-layout/body"],[data-meowui-part="presentation-layout/footer"]',
                      ),
                    );
                    for (const region of regions)
                      if (!current.has(region)) {
                        observer?.unobserve(region);
                        regions.delete(region);
                      }
                    for (const region of current)
                      if (!regions.has(region)) {
                        observer?.observe(region);
                        regions.add(region);
                      }
                  };
                  let connected = true;
                  let queued = false;
                  const contentChanged = () => {
                    if (queued) return;
                    queued = true;
                    queueMicrotask(() => {
                      queued = false;
                      if (connected) {
                        observeRegions();
                        fit();
                      }
                    });
                  };
                  const Mutation = view?.MutationObserver;
                  const mutations = Mutation
                    ? new Mutation((records) => {
                        if (
                          records.some(
                            (record) =>
                              record.target !== element ||
                              record.type !== "attributes" ||
                              record.attributeName !== "style",
                          )
                        )
                          contentChanged();
                      })
                    : undefined;
                  mutations?.observe(element, {
                    childList: true,
                    characterData: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ["class", "style", "hidden", "data-revealed"],
                  });
                  element.ownerDocument.fonts?.addEventListener("loadingdone", contentChanged);
                  contentChanged();
                  element.addEventListener("load", contentChanged, true);
                  element.addEventListener("loadedmetadata", contentChanged, true);
                  return () => {
                    connected = false;
                    observer?.disconnect();
                    mutations?.disconnect();
                    regions.clear();
                    element.ownerDocument.fonts?.removeEventListener("loadingdone", contentChanged);
                    element.removeEventListener("load", contentChanged, true);
                    element.removeEventListener("loadedmetadata", contentChanged, true);
                    stage = undefined;
                  };
                },
              ]}
            >
              {mapSignal(resolvedBackground, (value) => {
                if (value === "theme") return null;
                return (
                  <div
                    ref={parts.background}
                    aria-hidden="true"
                    inert
                    style={value.fill ? { background: value.fill } : undefined}
                  >
                    {value.image ? (
                      <img
                        ref={[
                          parts["background-image"],
                          (image: HTMLImageElement) => () => {
                            image.removeAttribute("src");
                          },
                        ]}
                        src={value.image.src}
                        alt=""
                        draggable={false}
                        decoding="async"
                        style={{
                          objectFit: value.image.fit ?? "cover",
                          objectPosition: value.image.position ?? "center",
                        }}
                        onError={(event: Event) => {
                          (event.currentTarget as HTMLImageElement).hidden = true;
                        }}
                      />
                    ) : null}
                    {value.overlay ? (
                      <div
                        ref={parts["background-overlay"]}
                        style={{ background: value.overlay }}
                      />
                    ) : null}
                  </div>
                );
              })}
              {page}
            </article>
          </div>
        </div>
        <p ref={parts.diagnostic} role="status" hidden={mapSignal(overflow, (value) => !value)}>
          Content exceeds the slide or an allocated layout region. Check the content and layout.
        </p>
        <nav ref={parts.controls} aria-label="Presentation controls">
          <Inline gap="compact">
            <div ref={parts.navigation} role="group" aria-label="Presentation navigation">
              <Inline gap="none" wrap={false}>
                <Button
                  variant="quiet"
                  aria-label="Previous"
                  title="Previous"
                  onClick={() => move(-1)}
                  disabled={previousDisabled}
                >
                  <Icon name="chevron-left" aria-hidden="true" />
                </Button>
                <div ref={parts["page-number"]} aria-hidden="true">
                  <span>
                    {mapSignal(position, (value) =>
                      String(positionIndex(slides, value) + 1).padStart(2, "0"),
                    )}
                  </span>
                  <span> / {String(slides.length).padStart(2, "0")}</span>
                  <small
                    ref={parts.step}
                    hidden={mapSignal(
                      position,
                      (value) => (slides[positionIndex(slides, value)]!.steps ?? 0) === 0,
                    )}
                  >
                    {mapSignal(
                      position,
                      (value) =>
                        `Step ${value.step} / ${slides[positionIndex(slides, value)]!.steps ?? 0}`,
                    )}
                  </small>
                </div>
                <Button
                  variant="quiet"
                  aria-label="Next"
                  title="Next"
                  onClick={() => move(1)}
                  disabled={nextDisabled}
                >
                  <Icon name="chevron-right" aria-hidden="true" />
                </Button>
              </Inline>
            </div>
            <label ref={parts["slide-picker"]}>
              <Inline as="span" gap="compact" wrap={false}>
                <LayoutItem as="span" shrink={false}>
                  <Inline as="span" gap="compact" wrap={false}>
                    <Icon name="list" aria-hidden="true" />
                    <span>Contents</span>
                  </Inline>
                </LayoutItem>
                <LayoutItem as="span" grow>
                  <select
                    aria-label="Choose slide"
                    title={mapSignal(
                      position,
                      (value) => slides[positionIndex(slides, value)]!.title,
                    )}
                    value={mapSignal(position, (value) => value.slideId)}
                    onChange={(event: Event) => {
                      position.value = {
                        slideId: (event.currentTarget as HTMLSelectElement).value,
                        step: 0,
                      };
                    }}
                  >
                    {slides.map((slide) => (
                      <option value={slide.id}>{slide.title}</option>
                    ))}
                  </select>
                </LayoutItem>
              </Inline>
            </label>
            <div ref={parts.tools}>
              <Popover
                id={optionsId}
                role="dialog"
                labelledBy={`${optionsId}-trigger`}
                open={optionsOpen}
                align="end"
                onOpenChange={(next) => {
                  optionsOpen.value = next;
                  if (next)
                    queueMicrotask(() => {
                      if (optionsOpen.value) firstOption?.focus();
                    });
                }}
                trigger={(bindings) => (
                  <Button
                    {...bindings}
                    variant="quiet"
                    aria-label="Presentation options"
                    aria-haspopup="dialog"
                    title="Presentation options"
                  >
                    <Icon name="settings" aria-hidden="true" />
                  </Button>
                )}
              >
                <Stack gap="compact">
                  <Button
                    variant="quiet"
                    aria-pressed={mapSignal(paused, String)}
                    ref={(element: HTMLButtonElement) => {
                      firstOption = element;
                      return () => {
                        firstOption = undefined;
                      };
                    }}
                    onClick={() => {
                      paused.value = !paused.value;
                    }}
                  >
                    {mapSignal(paused, (value) => (value ? "Resume effects" : "Pause effects"))}
                  </Button>
                  <Button
                    variant="quiet"
                    aria-pressed={mapSignal(actualSize, String)}
                    onClick={() => {
                      actualSize.value = !actualSize.value;
                    }}
                  >
                    {mapSignal(actualSize, (value) => (value ? "Fit to window" : "Actual size"))}
                  </Button>
                </Stack>
              </Popover>
            </div>
          </Inline>
        </nav>
        {soundtrack ? <div ref={parts.soundtrack}>{soundtrack}</div> : null}
      </section>
    </PresentationActivity.Provider>
  );
}

Presentation.meta = presentationMeta;
