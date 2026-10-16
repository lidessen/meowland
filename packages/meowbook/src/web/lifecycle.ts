import type { Cleanup } from "meowjsx";

/** Registration after cancellation disposes late resources immediately. */
export function cleanupScope(onError: (error: unknown) => void) {
  const cleanups: Cleanup[] = [];
  let closed = false;
  const run = (cleanup: Cleanup) => {
    try {
      cleanup();
    } catch (error) {
      onError(error);
    }
  };
  return {
    add(cleanup: Cleanup) {
      if (closed) run(cleanup);
      else cleanups.push(cleanup);
    },
    dispose() {
      if (closed) return;
      closed = true;
      for (const cleanup of cleanups.reverse()) run(cleanup);
      cleanups.length = 0;
    },
  };
}
