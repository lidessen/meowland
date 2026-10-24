import type { Child, MaybeSignal, Props, ReadableSignal, WritableSignal } from "meowjsx";
import type { PresentationTransition } from "./transition";

export interface SlidePosition {
  readonly slideId: string;
  readonly step: number;
}

export interface SlideSession {
  readonly step: ReadableSignal<number>;
}

export interface SlideBackgroundImage {
  readonly src: string;
  readonly fit?: "cover" | "contain";
  readonly position?:
    | "center"
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "top left"
    | "top right"
    | "bottom left"
    | "bottom right";
}

/** A complete decorative background; objects replace rather than merge defaults. */
export type SlideBackground =
  | "theme"
  | {
      /** CSS color or gradient; also visible while an image loads or fails. */
      readonly fill?: string;
      readonly image?: SlideBackgroundImage;
      /** CSS color or gradient, retained even when the image fails. */
      readonly overlay?: string;
      /** Text color preset. Omit to keep the theme's ink and muted text. */
      readonly foreground?: "light" | "dark";
    };

export interface SlideDefinition {
  readonly id: string;
  readonly title: string;
  /** Additional advances after the initial step, which is always zero. */
  readonly steps?: number;
  readonly notes?: string;
  /** Undefined inherits the deck; "theme" resets it. Signals do not remount content. */
  readonly background?: MaybeSignal<SlideBackground | undefined>;
  render(session: SlideSession): Child;
}

export interface PresentationProps extends Props {
  title: string;
  slides: readonly SlideDefinition[];
  /** The supplied signal is the only position owner. Keep its identity stable. */
  position?: WritableSignal<SlidePosition>;
  /** Host permission, independent of the viewer's own pause control. */
  active?: MaybeSignal<boolean>;
  /** New-page entrance only. Old pages still stop and unmount immediately. */
  transition?: PresentationTransition;
  /** Deck default. Omitted or "theme" uses the theme's paper and text. */
  background?: MaybeSignal<SlideBackground | undefined>;
  soundtrack?: Child;
  /** Styles only the logical slide canvas and its authored content. */
  slideClassName?: string;
}

export function validateSlides(slides: readonly SlideDefinition[]): void {
  if (!slides.length) throw new Error("Presentation requires at least one slide");
  const ids = new Set<string>();
  for (const slide of slides) {
    if (!slide.id.trim() || ids.has(slide.id))
      throw new Error("Presentation slide ids must be nonempty and unique");
    ids.add(slide.id);
    if (!Number.isInteger(slide.steps ?? 0) || (slide.steps ?? 0) < 0)
      throw new Error("Presentation steps must be nonnegative integers");
  }
}

export function positionIndex(slides: readonly SlideDefinition[], position: SlidePosition): number {
  const index = slides.findIndex((slide) => slide.id === position.slideId);
  if (index < 0) throw new Error(`Unknown presentation slide: ${position.slideId}`);
  if (
    !Number.isInteger(position.step) ||
    position.step < 0 ||
    position.step > (slides[index]!.steps ?? 0)
  )
    throw new Error(`Invalid presentation step for ${position.slideId}: ${position.step}`);
  return index;
}
