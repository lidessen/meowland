import { h, type Child, type Context } from "meowjsx";
import { ImagePreview, type ImagePreviewProps } from "meowtail";
import type { SlideBackgroundImage } from "./types";

export type PresentationImagePosition = NonNullable<SlideBackgroundImage["position"]>;

export interface PresentationImageProps extends ImagePreviewProps {
  /** Preferred image-frame ratio, or the remaining height assigned by a finite parent. */
  ratio?: number | "fill";
  /** Preserve every edge by default. Choose cover explicitly for a crop-safe image. */
  fit?: "contain" | "cover";
  position?: PresentationImagePosition;
  caption?: Child;
  children?: never;
}

/** A passive presentation figure; ImagePreview owns loading and failure feedback. */
export function PresentationImage(
  {
    src,
    alt,
    ratio = 16 / 9,
    fit = "contain",
    position = "center",
    caption,
    loading = "eager",
    loadingLabel,
    failedLabel,
    onLoad,
    onError,
    children: _children,
    ref,
    ...props
  }: PresentationImageProps,
  context: Context<typeof PresentationImage>,
) {
  const parts = context.parts;
  if (ratio !== "fill" && (!Number.isFinite(ratio) || ratio <= 0))
    throw new Error("PresentationImage requires a finite positive ratio or fill");
  return (
    <figure {...props} data-sizing={ratio === "fill" ? "fill" : "ratio"} ref={[parts.root, ref]}>
      <div
        ref={parts.frame}
        style={{
          ...(ratio === "fill" ? {} : { aspectRatio: String(ratio) }),
          objectFit: fit,
          objectPosition: position,
        }}
      >
        <ImagePreview
          src={src}
          alt={alt}
          loading={loading}
          loadingLabel={loadingLabel}
          failedLabel={failedLabel}
          onLoad={onLoad}
          onError={onError}
        />
      </div>
      {caption !== undefined && caption !== null ? (
        <figcaption ref={parts.caption}>{caption}</figcaption>
      ) : null}
    </figure>
  );
}

PresentationImage.meta = {
  name: "presentation-image",
  parts: ["root", "frame", "caption"],
} as const;
