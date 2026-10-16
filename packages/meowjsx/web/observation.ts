import { createContext, useContext, type ComponentObservation } from "../src/index";

/** One explicitly observed render tree; no process-wide or runtime-wide owner. */
export const WebObservationContext = createContext<ComponentObservation<Node> | undefined>(
  undefined,
);

/** Capture synchronously during component invocation, before deferred callbacks. */
export function useWebObservation(): ComponentObservation<Node> | undefined {
  return useContext(WebObservationContext);
}
