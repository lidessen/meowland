import type { LifecycleScope } from "meowjsx";
import type { ReadableSignal } from "meowjsx/signal";

export type PresentationTransitionEffect = "none" | "fade" | "slide" | "zoom";
export type PresentationTransitionDirection = "left" | "right" | "up" | "down";
export type PresentationTransition =
  | PresentationTransitionEffect
  | {
      effect: PresentationTransitionEffect;
      /** Physical movement: left enters from the right, up enters from below. */
      direction?: PresentationTransitionDirection;
      speed?: "fast" | "normal" | "slow";
    };

const entranceAnimations = new WeakSet<Animation>();

/** Only our bounded decorations may postpone a logical overflow measurement. */
export function pendingEntranceAnimations(element: HTMLElement): Animation[] {
  return typeof element.getAnimations === "function"
    ? element
        .getAnimations({ subtree: true })
        .filter((animation) => entranceAnimations.has(animation))
    : [];
}

/** Entrance decoration never owns presentation position, visibility or activity. */
export function entranceMotion(scope: LifecycleScope, active: ReadableSignal<boolean>) {
  let stop: (() => void) | undefined;
  const cancel = () => {
    stop?.();
    stop = undefined;
  };
  scope.effect(() => {
    if (!active.value) cancel();
  });
  scope.onCleanup(cancel);
  return {
    cancel,
    play(
      element: HTMLElement,
      transition: PresentationTransition,
      direction: PresentationTransitionDirection,
      clip?: HTMLElement,
    ) {
      cancel();
      const options = typeof transition === "string" ? { effect: transition } : transition;
      if (options.effect === "none" || !active.value || !element.isConnected) return;
      const reduced = element.ownerDocument.defaultView?.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );
      if (reduced?.matches || typeof element.animate !== "function") return;
      const movement = {
        left: "32px 0",
        right: "-32px 0",
        up: "0 32px",
        down: "0 -32px",
      }[options.direction ?? direction];
      const frames: Keyframe[] =
        options.effect === "slide"
          ? [
              { opacity: 0, translate: movement },
              { opacity: 1, translate: "0 0" },
            ]
          : options.effect === "zoom"
            ? [
                { opacity: 0, scale: "0.96" },
                { opacity: 1, scale: "1" },
              ]
            : [{ opacity: 0 }, { opacity: 1 }];
      const overflow = clip?.style.overflow;
      if (clip) clip.style.overflow = "clip";
      let animation: Animation;
      try {
        animation = element.animate(frames, {
          duration: { fast: 160, normal: 280, slow: 420 }[options.speed ?? "normal"],
          easing: "cubic-bezier(0.2, 0.7, 0.2, 1)",
        });
      } catch {
        if (clip) clip.style.overflow = overflow ?? "";
        return;
      }
      entranceAnimations.add(animation);
      const finish = () => {
        if (stop !== finish) return;
        stop = undefined;
        entranceAnimations.delete(animation);
        animation.cancel();
        if (clip) clip.style.overflow = overflow ?? "";
        reduced?.removeEventListener("change", change);
      };
      const change = () => {
        if (reduced?.matches) finish();
      };
      stop = finish;
      reduced?.addEventListener("change", change);
      void animation.finished.then(finish, finish);
    },
  };
}
