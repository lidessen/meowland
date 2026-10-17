import {
  batch,
  defineComponent,
  h,
  mapSignal,
  unwrap,
  type Child,
  type ComponentContract,
  type Props,
  type ReadableSignal,
  type WritableSignal,
} from "meowjsx";
import { Button } from "../components/button";
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
} from "./types";

export const presentationContract = {
  name: "presentation",
  parts: [
    "root",
    "header",
    "title",
    "viewport",
    "stage",
    "slide",
    "controls",
    "position",
    "soundtrack",
    "diagnostic",
  ],
} as const satisfies ComponentContract;

interface CurrentSlideProps extends Props {
  slide: SlideDefinition;
  position: WritableSignal<SlidePosition>;
  enabled: ReadableSignal<boolean>;
  focusFallback(): void;
}

const SlideContent = ({ slide, position }: CurrentSlideProps): Child =>
  slide.render({ step: mapSignal(position, (value) => value.step) });

const CurrentSlide = defineComponent<CurrentSlideProps, "presentation-current-slide", never>(
  { name: "presentation-current-slide", parts: [] },
  (props, context) => {
    const parent = usePresentationActivity();
    const activity = activitySignal(context, () => parent.value && props.enabled.value);
    const environment = {
      step: mapSignal(props.position, (value) => value.step),
      steps: props.slide.steps ?? 0,
      focusFallback: props.focusFallback,
    };
    return (
      <PresentationActivity.Provider value={activity}>
        <PresentationSlide.Provider value={environment}>
          <SlideContent {...props} />
        </PresentationSlide.Provider>
      </PresentationActivity.Provider>
    );
  },
);

/** One mounted page; authored experiment signals remain owned by the work's host. */
export const Presentation = defineComponent<
  PresentationProps,
  "presentation",
  (typeof presentationContract.parts)[number]
>(
  presentationContract,
  (
    { title, slides, position: suppliedPosition, active = true, soundtrack, className, ...props },
    context,
  ) => {
    validateSlides(slides);
    const position =
      suppliedPosition ?? context.signal<SlidePosition>({ slideId: slides[0]!.id, step: 0 });
    positionIndex(slides, position.value);
    const paused = context.signal(false);
    const visible = context.signal(false);
    const activity = activitySignal(
      context,
      () => unwrap(active) && visible.value && !paused.value,
    );
    const scale = context.signal(1);
    const actualSize = context.signal(false);
    const overflow = context.signal(false);
    let viewport: HTMLElement | undefined;
    let stage: HTMLElement | undefined;
    let heading: HTMLElement | undefined;
    let currentId = position.value.slideId;
    let currentEnabled = context.signal(true);
    const focusFallback = () => heading?.focus();
    // Use the first child as the signal's initial value: setting it before mount
    // would queue a notification and mount the same page again for new subscribers.
    const page = context.signal<Child>(
      <CurrentSlide
        slide={slides[positionIndex(slides, position.value)]!}
        position={position}
        enabled={currentEnabled}
        focusFallback={focusFallback}
      />,
    );
    const fit = () => {
      const originalSize = actualSize.value;
      if (!viewport) return;
      scale.value = originalSize
        ? 1
        : Math.min(viewport.clientWidth / 1280, viewport.clientHeight / 720, 1);
      if (stage) overflow.value = stage.scrollWidth > 1280 || stage.scrollHeight > 720;
    };
    context.effect(fit);
    context.effect(() => {
      const value = position.value;
      const index = positionIndex(slides, value);
      if (currentId === value.slideId) return;
      // Flush the old activity gate before the renderer mounts a replacement.
      batch(() => {
        currentEnabled.value = false;
      });
      const hadPageFocus = stage && stage.contains(stage.ownerDocument.activeElement);
      if (hadPageFocus) focusFallback();
      currentId = value.slideId;
      currentEnabled = context.signal(true);
      page.value = (
        <CurrentSlide
          slide={slides[index]!}
          position={position}
          enabled={currentEnabled}
          focusFallback={focusFallback}
        />
      );
      queueMicrotask(fit);
    });
    context.onCleanup(() => {
      currentEnabled.set(false);
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
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      )
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
        {context.part(
          "root",
          "section",
          {
            ...props,
            className,
            "aria-label": title,
            tabIndex: 0,
            onKeyDown: (event: KeyboardEvent) => {
              if (typeof props.onKeyDown === "function") props.onKeyDown(event);
              keydown(event);
            },
            ref: (element: HTMLElement) => {
              const document = element.ownerDocument;
              const updateVisibility = () => {
                visible.value = document.visibilityState !== "hidden";
              };
              updateVisibility();
              document.addEventListener("visibilitychange", updateVisibility);
              let hostCleanup: unknown;
              try {
                hostCleanup = typeof props.ref === "function" ? props.ref(element) : undefined;
              } catch (error) {
                document.removeEventListener("visibilitychange", updateVisibility);
                visible.value = false;
                throw error;
              }
              return () => {
                try {
                  if (typeof hostCleanup === "function") hostCleanup();
                } finally {
                  document.removeEventListener("visibilitychange", updateVisibility);
                  visible.value = false;
                }
              };
            },
          },
          context.part(
            "header",
            "header",
            null,
            context.part(
              "title",
              "h1",
              {
                tabIndex: -1,
                ref: (element: HTMLElement) => {
                  heading = element;
                  return () => {
                    heading = undefined;
                  };
                },
              },
              title,
            ),
            context.part(
              "position",
              "p",
              { role: "status", "aria-live": "polite", "aria-atomic": "true" },
              mapSignal(
                position,
                (value) =>
                  `${positionIndex(slides, value) + 1} / ${slides.length} · ${slides[positionIndex(slides, value)]!.title} · ${value.step} / ${slides[positionIndex(slides, value)]!.steps ?? 0}`,
              ),
            ),
          ),
          context.part(
            "viewport",
            "div",
            {
              "data-actual-size": actualSize,
              ref: (element: HTMLElement) => {
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
            },
            context.part(
              "stage",
              "div",
              { style: frameStyle },
              context.part(
                "slide",
                "article",
                {
                  style: { transform: mapSignal(scale, (value) => `scale(${value})`) },
                  ref: (element: HTMLElement) => {
                    stage = element;
                    const Resize = element.ownerDocument.defaultView?.ResizeObserver;
                    const observer = Resize ? new Resize(fit) : undefined;
                    observer?.observe(element);
                    return () => {
                      observer?.disconnect();
                      stage = undefined;
                    };
                  },
                },
                page,
              ),
            ),
          ),
          context.part(
            "diagnostic",
            "p",
            { role: "status", hidden: mapSignal(overflow, (value) => !value) },
            "Content exceeds the slide. Check the layout or use actual size.",
          ),
          context.part(
            "controls",
            "nav",
            { "aria-label": "Presentation controls" },
            <Button variant="outline" onClick={() => move(-1)} disabled={previousDisabled}>
              Previous
            </Button>,
            <Button onClick={() => move(1)} disabled={nextDisabled}>
              Next
            </Button>,
            <label>
              Slide{" "}
              <select
                aria-label="Choose slide"
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
            </label>,
            <Button
              variant="quiet"
              aria-pressed={mapSignal(paused, String)}
              onClick={() => {
                paused.value = !paused.value;
              }}
            >
              {mapSignal(paused, (value) => (value ? "Resume effects" : "Pause effects"))}
            </Button>,
            <Button
              variant="quiet"
              aria-pressed={mapSignal(actualSize, String)}
              onClick={() => {
                actualSize.value = !actualSize.value;
              }}
            >
              {mapSignal(actualSize, (value) => (value ? "Fit to window" : "Actual size"))}
            </Button>,
          ),
          soundtrack ? context.part("soundtrack", "div", null, soundtrack) : null,
        )}
      </PresentationActivity.Provider>
    );
  },
);
