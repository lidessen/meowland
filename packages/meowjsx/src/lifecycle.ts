import { createReactiveEffect, signal } from "./reactive";
import type { Cleanup, LifecycleScope, Runtime } from "./types";

/**
 * Create a lifecycle scope. Components receive one per invocation; a target
 * that mounts a shadow uses the same primitive so signals, effects, and
 * cleanups follow one ownership rule.
 */
export function createLifecycleScope(runtime: Runtime): LifecycleScope & { dispose(): void } {
  let active = true;
  const cleanups: Cleanup[] = [];

  const onCleanup = (cleanup: Cleanup): void => {
    if (!active) {
      cleanup();
      return;
    }

    let disposed = false;
    const once: Cleanup = () => {
      if (disposed) return;
      disposed = true;
      cleanup();
    };
    cleanups.push(once);
  };

  return {
    runtime,
    signal,
    effect(run): Cleanup {
      const stop = createReactiveEffect(run);
      onCleanup(stop);
      return stop;
    },
    onCleanup,
    dispose(): void {
      if (!active) return;
      active = false;
      const pending = cleanups.splice(0);
      disposeCleanups(pending);
    },
  };
}

export function disposeCleanups(cleanups: Cleanup[]): void {
  let firstError: unknown;
  for (const cleanup of cleanups.reverse()) {
    try {
      cleanup();
    } catch (error) {
      firstError ??= error;
    }
  }
  if (firstError) throw firstError;
}
