import {
  createRuntime,
  defineComponent,
  h,
  mapSignal,
  signal,
  type Child,
  type VNode,
} from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { Button, createMeowUI } from "meowtail";
import { applyTheme, mountStyles } from "meowcss/web";
import { standardOptions, standardTheme } from "meowtail/theme";
import {
  Presentation,
  PresentationAudio,
  PresentationVideo,
  Reveal,
  usePresentationActivity,
  type SlideDefinition,
  type SlidePosition,
} from "meowtail/presentation";
import { createImageTalk } from "../../../../../examples/presentation/talk";
import { talkCss } from "../../../../../examples/presentation/talk.styles";

interface DeckFacts {
  renders: Record<string, number>;
  disposed: number;
  ticks: number;
  nestedTicks: number;
  refs: string[];
  events: string[];
  nativeTime: number;
}

export interface PresentationTestAPI {
  jump(instance: number, position: SlidePosition): void;
  allow(instance: number, value: boolean): void;
  dispose(): void;
  facts(instance: number): DeckFacts & { position: SlidePosition; speed: number };
}

declare global {
  interface Window {
    presentationTest: PresentationTestAPI;
  }
}

const timers = defineComponent<{ facts: DeckFacts; nested?: boolean }, "test-clock", never>(
  { name: "test-clock", parts: [] },
  ({ facts, nested }, context) => {
    const activity = usePresentationActivity();
    context.effect(() => {
      if (!activity.value) return;
      const timer = setInterval(() => {
        if (nested) facts.nestedTicks++;
        else facts.ticks++;
      }, 20);
      return () => clearInterval(timer);
    });
    context.onCleanup(() => facts.disposed++);
    return <span>{nested ? "Nested timer" : "Page timer"}</span>;
  },
);
const Clock = timers;

function createDeck(instance: number) {
  const query = new URL(location.href).searchParams;
  const position = signal<SlidePosition>({
    slideId: query.get("slide") ?? "experiment",
    step: Number(query.get("step") ?? 0),
  });
  const active = signal(query.get("active") !== "false");
  const speed = signal(30);
  const facts: DeckFacts = {
    renders: {},
    disposed: 0,
    ticks: 0,
    nestedTicks: 0,
    refs: [],
    events: [],
    nativeTime: 0,
  };
  const rendered = (id: string, child: () => Child) => {
    facts.renders[id] = (facts.renders[id] ?? 0) + 1;
    return child();
  };
  const slides: SlideDefinition[] = [
    {
      id: "experiment",
      title: "Experiment",
      steps: 3,
      render: ({ step }) =>
        rendered("experiment", () => (
          <section data-fixture-slide="experiment">
            <h2>Experiment content</h2>
            <Clock facts={facts} />
            <label>
              Network speed
              <input
                aria-label="Network speed"
                type="range"
                min="1"
                max="101"
                value={speed}
                onInput={(event: Event) => {
                  speed.value = Number((event.currentTarget as HTMLInputElement).value);
                }}
              />
            </label>
            <output aria-label="Experiment result">
              {mapSignal(speed, (value) => `Speed ${value}`)}
            </output>
            <p aria-label="Current step">{step}</p>
            <button type="button" onClick={() => position.set({ slideId: "discussion", step: 0 })}>
              Visit discussion
            </button>
            <Reveal at={2}>
              <button type="button">Revealed action</button>
            </Reveal>
            <Reveal at={3} data-testid="outer-reveal">
              <Reveal at={1} data-testid="inner-reveal">
                <button type="button">Nested action</button>
                <Clock facts={facts} nested />
              </Reveal>
            </Reveal>
          </section>
        )),
    },
    {
      id: "media",
      title: "Media",
      render: () =>
        rendered("media", () => (
          <section data-fixture-slide="media">
            <h2>Media content</h2>
            <PresentationVideo
              src="/silence.wav"
              label="Evidence recording"
              ref={(element: HTMLVideoElement) => {
                facts.refs.push(element.tagName);
                return () => {
                  facts.nativeTime = element.currentTime;
                  facts.refs.push("released");
                };
              }}
              onLoadedMetadata={(event: Event) => {
                facts.events.push(`metadata:${(event.currentTarget as HTMLElement).tagName}`);
                (event.currentTarget as HTMLMediaElement).currentTime = facts.nativeTime;
              }}
              onTimeUpdate={(event: Event) => {
                facts.nativeTime = (event.currentTarget as HTMLMediaElement).currentTime;
              }}
              onPause={(event: Event) => {
                facts.events.push(`pause:${(event.currentTarget as HTMLElement).tagName}`);
                facts.nativeTime = (event.currentTarget as HTMLMediaElement).currentTime;
              }}
              onEnded={() => facts.events.push("ended")}
            />
            <button type="button" onClick={() => position.set({ slideId: "discussion", step: 0 })}>
              Visit discussion
            </button>
          </section>
        )),
    },
    {
      id: "discussion",
      title: "Discussion",
      render: () =>
        rendered("discussion", () => (
          <section data-fixture-slide="discussion">
            <h2>Discussion content</h2>
            <output aria-label="Shared result">
              {mapSignal(speed, (value) => `Speed ${value}`)}
            </output>
            <button type="button" onClick={() => position.set({ slideId: "experiment", step: 0 })}>
              Return to experiment
            </button>
            <button type="button" onClick={() => position.set({ slideId: "media", step: 0 })}>
              Return to media
            </button>
          </section>
        )),
    },
  ];
  return {
    position,
    active,
    speed,
    facts,
    node: (
      <Presentation
        title={`${instance === 0 ? "First" : "Second"} test deck`}
        position={position}
        active={active}
        slides={slides}
        soundtrack={<PresentationAudio src="/silence.wav" label="Test soundtrack" />}
      />
    ),
  };
}

const root = document.querySelector<HTMLElement>("#test-root")!;
const query = new URL(location.href).searchParams;
if (query.get("chrome") === "single") root.style.height = "100dvh";
const removeStyles = mountStyles(document, standardTheme.cssText + talkCss);
const scheme = query.get("scheme");
const removeTheme = applyTheme(
  root,
  standardTheme,
  scheme === "light" || scheme === "dark" ? standardOptions.select({ scheme }) : undefined,
);
const decks = [createDeck(0), createDeck(1)];
let content: Child =
  query.get("chrome") === "single" ? decks[0]!.node : decks.map((deck) => deck.node);
if (new URL(location.href).searchParams.get("sample") === "reordered") {
  const talk = createImageTalk({
    initialPosition: { slideId: "experiment", step: 3 },
    speed: 71,
    active: false,
  });
  const view = talk.view as VNode;
  const slides = view.props.slides as readonly SlideDefinition[];
  // Reuse the actual authored page functions and state; only change their order.
  const reordered = [
    slides.find((slide) => slide.id === "experiment")!,
    ...slides.filter((slide) => slide.id !== "experiment"),
  ];
  content = h(view.type, { ...view.props, slides: reordered });
}
const web = createWebRenderer(createRuntime({ plugins: [createMeowUI()] }));
const mounted = web.render(content, root);
const referenceRoot = document.createElement("div");
referenceRoot.hidden = true;
referenceRoot.inert = true;
root.append(referenceRoot);
const reference = web.render(
  <Button id="fixture-style-reference" variant="outline">
    Reference content control
  </Button>,
  referenceRoot,
);
window.presentationTest = {
  jump(instance, position) {
    decks[instance]!.position.set(position);
  },
  allow(instance, value) {
    decks[instance]!.active.set(value);
  },
  facts(instance) {
    const deck = decks[instance]!;
    return { ...deck.facts, position: deck.position.value, speed: deck.speed.value };
  },
  dispose() {
    mounted.unmount();
    reference.unmount();
    referenceRoot.remove();
    removeTheme();
    removeStyles();
  },
};
