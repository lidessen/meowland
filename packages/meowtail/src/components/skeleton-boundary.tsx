import {
  defineComponent,
  derived,
  unwrap,
  type ComponentContract,
  type MaybeSignal,
  type Props,
} from "meowjsx";
import { createSkeletonController, useWebObservation } from "meowjsx/web";

export const skeletonBoundaryContract = {
  name: "skeleton-boundary",
  parts: ["root", "content", "status"],
} as const satisfies ComponentContract;

export interface SkeletonBoundaryProps extends Props {
  active: MaybeSignal<boolean>;
  label: string;
  className?: string;
}

/** Loading presentation preserves the mounted subtree; the caller owns request state. */
export const SkeletonBoundary = defineComponent<
  SkeletonBoundaryProps,
  "skeleton-boundary",
  (typeof skeletonBoundaryContract.parts)[number]
>(skeletonBoundaryContract, ({ active, label, children, ...props }, context) => {
  const observation = useWebObservation();
  const mounted = context.signal<HTMLElement | null>(null);
  const busy = derived(() => unwrap(active));
  const busyAttribute = derived(() => String(unwrap(active)));
  const announcement = derived(() => (unwrap(active) ? label : ""));
  let controller: ReturnType<typeof createSkeletonController> | undefined;
  const clear = () => {
    controller?.dispose();
    controller = undefined;
  };
  context.effect(() => {
    const loading = unwrap(active);
    const element = mounted.value;
    if (!element) return;
    if (!loading) {
      clear();
      return;
    }
    if (!controller) {
      // Inert removes focusability without moving focus to another control.
      const focused = element.ownerDocument.activeElement;
      if (focused instanceof HTMLElement && element.contains(focused)) focused.blur();
      const candidates =
        observation
          ?.read()
          .filter(
            (instance) =>
              instance.component.contract === skeletonBoundaryContract &&
              instance.nodes.has(element),
          ) ?? [];
      const root = candidates.find(
        (candidate) =>
          !candidates.some((other) => {
            for (let parent = other.parent; parent; parent = parent.parent)
              if (parent === candidate) return true;
            return false;
          }),
      );
      controller = createSkeletonController({
        scope: element,
        observation: root && observation ? { source: observation, root } : undefined,
      });
      controller.activate();
    }
  });
  context.onCleanup(clear);
  return [
    context.part(
      "root",
      "div",
      { ...props, "aria-busy": busyAttribute },
      context.part(
        "content",
        "div",
        {
          inert: busy,
          ref: (element: HTMLElement) => {
            let alive = true;
            queueMicrotask(() => {
              if (alive) mounted.value = element;
            });
            return () => {
              alive = false;
              clear();
              mounted.value = null;
            };
          },
        },
        children,
      ),
    ),
    // Keep announcements outside the busy region so its updates are not deferred.
    context.part("status", "span", { role: "status", "aria-atomic": "true" }, announcement),
  ];
});
