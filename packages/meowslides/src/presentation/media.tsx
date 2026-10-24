import { h, type Child, type Context, type Props, type RefBinding } from "meowjsx";
import { mapSignal, signal, unwrap, type MaybeSignal } from "meowjsx/signal";
import { Button } from "meowtail";
import { usePresentationActivity } from "./context";

export interface PresentationMediaProps<T extends HTMLMediaElement> extends Props {
  src: MaybeSignal<string>;
  label: string;
  ref?: RefBinding<T>;
  controls?: boolean;
  preload?: "none" | "metadata" | "auto";
  children?: Child;
  onPlay?: (event: Event) => void;
  onPause?: (event: Event) => void;
  onLoadedMetadata?: (event: Event) => void;
  onError?: (event: Event) => void;
}

export interface PresentationVideoProps extends PresentationMediaProps<HTMLVideoElement> {
  poster?: string;
  playsInline?: boolean;
}

export type PresentationAudioProps = PresentationMediaProps<HTMLAudioElement>;

function mediaComponent<T extends HTMLMediaElement>(
  tag: "video" | "audio",
  props: PresentationMediaProps<T>,
  context: Context<typeof PresentationVideo> | Context<typeof PresentationAudio>,
) {
  const {
    src,
    label,
    ref: hostRef,
    controls = true,
    preload = "metadata",
    children,
    className,
    onPlay,
    onPause,
    onLoadedMetadata,
    onError,
    ...native
  } = props;
  const parts = context.parts;
  const activity = usePresentationActivity();
  const state = signal<"loading" | "ready" | "failed">("loading");
  const feedback = signal("");
  let media: T | undefined;
  let mounted = true;
  let generation = 0;
  let source = unwrap(src);
  const pause = () => {
    generation += 1;
    media?.pause();
  };
  context.effect(() => {
    if (!activity.value) pause();
  });
  context.effect(() => {
    const next = unwrap(src);
    if (next === source) return;
    source = next;
    pause();
    state.value = "loading";
    feedback.value = "";
  });
  context.onCleanup(() => {
    mounted = false;
    generation += 1;
  });
  const play = () => {
    const element = media;
    if (!element || !mounted) return;
    if (!activity.value) {
      element.pause();
      feedback.value = "Playback is unavailable while the presentation is inactive or paused.";
      return;
    }
    feedback.value = "";
    const attempt = ++generation;
    try {
      const pending = element.play();
      if (pending)
        void pending.then(
          () => {
            if (!mounted || media !== element || generation !== attempt || !activity.value)
              element.pause();
          },
          (error: unknown) => {
            if (!mounted || media !== element || generation !== attempt) return;
            feedback.value =
              error instanceof Error
                ? `Unable to play: ${error.message}`
                : "Unable to play. Retry or use the native media controls.";
          },
        );
    } catch (error) {
      feedback.value =
        error instanceof Error
          ? `Unable to play: ${error.message}`
          : "Unable to play. Please retry.";
    }
  };
  const mediaProps: Props = {
    ...native,
    ref: [
      parts.media,
      (element: T) => {
        media = element;
        if (!activity.value) element.pause();
        return () => {
          mounted = false;
          generation += 1;
          element.pause();
          element.removeAttribute("src");
          element.load();
          if (media === element) media = undefined;
        };
      },
      hostRef,
    ],
    src,
    controls,
    preload,
    autoPlay: false,
    playsInline: tag === "video" ? (native.playsInline ?? true) : undefined,
    "aria-label": native["aria-label"] ?? label,
    onPlay: (event: Event) => {
      if (!mounted || !activity.value) {
        (event.currentTarget as HTMLMediaElement).pause();
        if (mounted) onPlay?.(event);
        return;
      }
      feedback.value = "";
      onPlay?.(event);
    },
    onPause,
    onLoadedMetadata: (event: Event) => {
      if (!mounted) return;
      state.value = "ready";
      if (!activity.value) (event.currentTarget as HTMLMediaElement).pause();
      onLoadedMetadata?.(event);
    },
    onError: (event: Event) => {
      if (!mounted) return;
      state.value = "failed";
      feedback.value = "Media could not load. Retry or read the text alternative.";
      onError?.(event);
    },
  };
  return (
    <figure ref={parts.root} className={className} data-media-state={state}>
      {h(tag, mediaProps, children)}
      <figcaption ref={parts.status} role="status" aria-live="polite">
        <span>
          {mapSignal(state, (value) => (value === "loading" ? `${label} · Loading media…` : label))}
        </span>
        <span hidden={mapSignal(feedback, (value) => !value)}>{feedback}</span>
      </figcaption>
      <div ref={parts.actions}>
        <Button variant="outline" onClick={play}>
          Play / continue
        </Button>
        <Button variant="outline" onClick={pause}>
          Pause
        </Button>
        <Button
          variant="quiet"
          onClick={() => {
            pause();
            if (!media || state.value !== "ready") return;
            try {
              media.currentTime = 0;
              feedback.value = "";
            } catch {
              feedback.value =
                "Unable to return to the start. Wait for the media to load or retry.";
            }
          }}
        >
          Back to start
        </Button>
        <Button
          variant="quiet"
          size="small"
          hidden={mapSignal(state, (value) => value !== "failed")}
          onClick={() => {
            if (!media) return;
            state.value = "loading";
            feedback.value = "";
            media.load();
          }}
        >
          Retry loading
        </Button>
      </div>
    </figure>
  );
}

export function PresentationVideo(
  props: PresentationVideoProps,
  context: Context<typeof PresentationVideo>,
) {
  return mediaComponent<HTMLVideoElement>("video", props, context);
}
PresentationVideo.meta = {
  name: "presentation-video",
  parts: ["root", "media", "status", "actions"],
} as const;

export function PresentationAudio(
  props: PresentationAudioProps,
  context: Context<typeof PresentationAudio>,
) {
  return mediaComponent<HTMLAudioElement>("audio", props, context);
}
PresentationAudio.meta = {
  name: "presentation-audio",
  parts: ["root", "media", "status", "actions"],
} as const;
