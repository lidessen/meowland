import { derived, unwrap, type MaybeSignal, type Props, type Context, h } from "meowjsx";
import { createSkeletonController, useWebObservation } from "meowjsx/web";

export interface SkeletonBoundaryProps extends Props {
  active: MaybeSignal<boolean>;
  label: string;
  className?: Props["className"];
}

/**
 * Shows skeletons in place of a region while it loads. Loading presentation preserves the mounted
 * subtree; the caller owns request state.
 */
export function SkeletonBoundary(
  { active, label, children, ...props }: SkeletonBoundaryProps,
  context: Context<typeof SkeletonBoundary>,
) {
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
              instance.component.meta?.name === SkeletonBoundary.meta.name &&
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
    <div {...props} aria-busy={busyAttribute} ref={[context.parts.root, props.ref]}>
      {
        <div
          inert={busy}
          ref={[
            context.parts.content,
            (element: HTMLElement) => {
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
          ]}
        >
          {children}
        </div>
      }
    </div>,
    // Keep announcements outside the busy region so its updates are not deferred.
    <span role={"status"} aria-atomic={"true"} ref={[context.parts.status]}>
      {announcement}
    </span>,
  ];
}
SkeletonBoundary.meta = {
  name: "skeleton-boundary",
  parts: ["root", "content", "status"],
} as const;
