import {
  defineComponent,
  h,
  mapSignal,
  type ComponentContract,
  type Props,
} from "meowjsx";
import { Icon } from "../icons/icon";

export const imagePreviewContract = {
  name: "image-preview",
  parts: ["root", "image", "status"],
} as const satisfies ComponentContract;

export interface ImagePreviewProps extends Props {
  src: string;
  alt: string;
  loading?: "lazy" | "eager";
  loadingLabel?: string;
  failedLabel?: string;
  onLoad?: (event: Event) => void;
  onError?: (event: Event) => void;
}

/** Passive media display; navigation, preview activation and URL authorization belong to the host. */
export const ImagePreview = defineComponent<
  ImagePreviewProps,
  "image-preview",
  (typeof imagePreviewContract.parts)[number]
>(
  imagePreviewContract,
  (
    {
      src,
      alt,
      loading = "lazy",
      loadingLabel = "正在加载图片",
      failedLabel = "图片加载失败",
      onLoad,
      onError,
      ...props
    },
    context,
  ) => {
    const state = context.signal<"loading" | "ready" | "failed">("loading");
    return context.part("root", "span", { ...props, "data-image-state": state }, [
      context.part("image", "img", {
        src,
        alt,
        loading,
        decoding: "async",
        referrerPolicy: "no-referrer",
        hidden: mapSignal(state, (value) => value === "failed"),
        onLoad: (event: Event) => {
          state.value = "ready";
          onLoad?.(event);
        },
        onError: (event: Event) => {
          state.value = "failed";
          onError?.(event);
        },
        ref: (image: HTMLImageElement) => {
          let disposed = false;
          queueMicrotask(() => {
            if (!disposed && image.complete && image.naturalWidth > 0) state.value = "ready";
          });
          return () => {
            disposed = true;
          };
        },
      }),
      context.part(
        "status",
        "span",
        { role: "status", hidden: mapSignal(state, (value) => value === "ready") },
        [
          mapSignal(state, (value) =>
            value === "loading" ? <Icon name="loader-circle" size={16} aria-hidden="true" /> : null,
          ),
          mapSignal(state, (value) => (value === "failed" ? failedLabel : loadingLabel)),
        ],
      ),
    ]);
  },
);
