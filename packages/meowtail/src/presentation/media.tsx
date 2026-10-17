import {
  defineComponent,
  h,
  mapSignal,
  unwrap,
  type Child,
  type Cleanup,
  type ComponentContract,
  type MaybeSignal,
  type Props,
} from "meowjsx";
import { Button } from "../components/button";
import { usePresentationActivity } from "./context";

export const presentationVideoContract = {
  name: "presentation-video",
  parts: ["root", "media", "status", "actions"],
} as const satisfies ComponentContract;

export const presentationAudioContract = {
  name: "presentation-audio",
  parts: ["root", "media", "status", "actions"],
} as const satisfies ComponentContract;

export interface PresentationMediaProps<T extends HTMLMediaElement> extends Props {
  src: MaybeSignal<string>;
  label: string;
  ref?: (element: T) => void | Cleanup;
  controls?: boolean;
  preload?: "none" | "metadata" | "auto";
  className?: string;
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
  contract: typeof presentationVideoContract | typeof presentationAudioContract,
) {
  return defineComponent<
    PresentationMediaProps<T>,
    typeof contract.name,
    (typeof contract.parts)[number]
  >(
    contract,
    (
      {
        src,
        label,
        ref,
        controls = true,
        preload = "metadata",
        children,
        className,
        onPlay,
        onPause,
        onLoadedMetadata,
        onError,
        ...native
      },
      context,
    ) => {
      const activity = usePresentationActivity();
      const state = context.signal<"loading" | "ready" | "failed">("loading");
      const feedback = context.signal("");
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
      return context.part(
        "root",
        "figure",
        { className, "data-media-state": state },
        context.part(
          "media",
          tag,
          {
            ...native,
            src,
            controls,
            preload,
            autoPlay: false,
            ...(tag === "video" ? { playsInline: native.playsInline ?? true } : {}),
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
            onPause: (event: Event) => {
              onPause?.(event);
            },
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
            ref: (element: T) => {
              media = element;
              const cleanup = ref?.(element);
              if (!activity.value) element.pause();
              return () => {
                // The host samples currentTime before the component releases the resource.
                try {
                  cleanup?.();
                } finally {
                  mounted = false;
                  generation += 1;
                  element.pause();
                  element.removeAttribute("src");
                  element.load();
                  if (media === element) media = undefined;
                }
              };
            },
          },
          children,
        ),
        context.part(
          "status",
          "figcaption",
          { role: "status", "aria-live": "polite" },
          mapSignal(state, (value) => (value === "loading" ? `${label} · Loading media…` : label)),
          feedback,
        ),
        context.part(
          "actions",
          "div",
          null,
          <Button variant="outline" size="small" onClick={play}>
            Play / continue
          </Button>,
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
          </Button>,
        ),
      );
    },
  );
}

export const PresentationVideo = mediaComponent<HTMLVideoElement>(
  "video",
  presentationVideoContract,
);
export const PresentationAudio = mediaComponent<HTMLAudioElement>(
  "audio",
  presentationAudioContract,
);
