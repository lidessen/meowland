import { h, type Props, type Context } from "meowjsx";
import { mapSignal, signal } from "meowjsx/signal";
import { Icon } from "../icons/icon";

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
export function ImagePreview(
  {
    src,
    alt,
    loading = "lazy",
    loadingLabel = "Loading image",
    failedLabel = "Failed to load image",
    onLoad,
    onError,
    ...props
  }: ImagePreviewProps,
  context: Context<typeof ImagePreview>,
) {
  const state = signal<"loading" | "ready" | "failed">("loading");
  return (
    <span {...props} data-image-state={state} ref={[context.parts.root, props.ref]}>
      {[
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          referrerPolicy="no-referrer"
          hidden={mapSignal(state, (value) => value === "failed")}
          onLoad={(event: Event) => {
            state.value = "ready";
            onLoad?.(event);
          }}
          onError={(event: Event) => {
            state.value = "failed";
            onError?.(event);
          }}
          ref={[
            context.parts.image,
            (image: HTMLImageElement) => {
              let disposed = false;
              queueMicrotask(() => {
                if (!disposed && image.complete && image.naturalWidth > 0) state.value = "ready";
              });
              return () => {
                disposed = true;
              };
            },
          ]}
        />,
        <span
          role="status"
          hidden={mapSignal(state, (value) => value === "ready")}
          ref={[context.parts.status]}
        >
          {[
            mapSignal(state, (value) =>
              value === "loading" ? (
                <Icon name="loader-circle" size={16} aria-hidden="true" />
              ) : null,
            ),
            mapSignal(state, (value) => (value === "failed" ? failedLabel : loadingLabel)),
          ]}
        </span>,
      ]}
    </span>
  );
}
ImagePreview.meta = { name: "image-preview", parts: ["root", "image", "status"] } as const;
