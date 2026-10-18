import { defineComponent, h, type Child, type ComponentContract } from "meowjsx";
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

export const presentationImageContract = {
  name: "presentation-image",
  parts: ["root", "frame", "caption"],
} as const satisfies ComponentContract;

/** A passive presentation figure; ImagePreview owns loading and failure feedback. */
export const PresentationImage = defineComponent<
  PresentationImageProps,
  "presentation-image",
  (typeof presentationImageContract.parts)[number]
>(
  presentationImageContract,
  (
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
      ...props
    },
    context,
  ) => {
    if (ratio !== "fill" && (!Number.isFinite(ratio) || ratio <= 0))
      throw new Error("PresentationImage requires a finite positive ratio or fill");
    return context.part(
      "root",
      "figure",
      { ...props, "data-sizing": ratio === "fill" ? "fill" : "ratio" },
      context.part(
        "frame",
        "div",
        {
          style: {
            ...(ratio === "fill" ? {} : { aspectRatio: String(ratio) }),
            objectFit: fit,
            objectPosition: position,
          },
        },
        <ImagePreview
          src={src}
          alt={alt}
          loading={loading}
          loadingLabel={loadingLabel}
          failedLabel={failedLabel}
          onLoad={onLoad}
          onError={onError}
        />,
      ),
      caption !== undefined && caption !== null
        ? context.part("caption", "figcaption", null, caption)
        : null,
    );
  },
);
