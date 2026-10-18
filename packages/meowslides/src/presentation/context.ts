import { createContext, useContext, type LifecycleScope, type ReadableSignal } from "meowjsx";
import type { SlideSession } from "./types";

export const PresentationActivity = createContext<ReadableSignal<boolean> | undefined>(undefined);

export interface SlideEnvironment extends SlideSession {
  readonly steps: number;
  focusFallback(): void;
}

export const PresentationSlide = createContext<SlideEnvironment | undefined>(undefined);

/** Capture during synchronous component render; retain the returned signal in effects. */
export function usePresentationActivity(): ReadableSignal<boolean> {
  const activity = useContext(PresentationActivity);
  if (!activity) throw new Error("usePresentationActivity requires a Presentation ancestor");
  return activity;
}

/** Reads are immediate; effect notifications use the existing reactive scheduler. */
export function activitySignal(
  scope: LifecycleScope,
  read: () => boolean,
): ReadableSignal<boolean> {
  const changed = scope.signal(read());
  scope.effect(() => {
    changed.value = read();
  });
  return {
    get value() {
      return read();
    },
    subscribe(listener) {
      return changed.subscribe(() => listener(read()));
    },
  };
}
