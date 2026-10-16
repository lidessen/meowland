import { h, signal, type Child } from "meowjsx";
import { createSkeletonController } from "meowjsx/web";
import { defineStory } from "meowbook";
import { SkeletonBoundary } from "../../src/components";

export const SkeletonLifecycle = defineStory({
  id: "skeleton-lifecycle",
  title: "Skeleton lifecycle fixture",
  render({ onCleanup }) {
    const active = signal(false);
    const secondActive = signal(false);
    const appended = signal<Child>(null);
    const first = signal<Child>(
      <SkeletonBoundary id="first-boundary" active={active} label="Loading first panel">
        <div id="first-content" style="padding:20px;width:320px;background:#fff;color:#111">
          <p id="first-text">MMMMMMMM WWWWWWWW</p>
          <input
            id="kept-input"
            aria-label="Editable draft"
            defaultValue="Initial draft"
            style="border:2px solid #456;caret-color:transparent"
          />
          <input id="disabled-input" aria-label="Disabled draft" disabled value="Disabled value" />
          <img
            id="kept-image"
            alt="Blue square"
            width="40"
            height="40"
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23123456'/%3E%3C/svg%3E"
          />
          <svg id="kept-icon" width="32" height="32" viewBox="0 0 32 32" aria-label="Arrow">
            <path
              d="M4 16H28M18 6L28 16L18 26"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
            />
          </svg>
          {appended}
        </div>
      </SkeletonBoundary>,
    );
    let controller: ReturnType<typeof createSkeletonController> | undefined;
    let transient: ReturnType<typeof createSkeletonController> | undefined;
    const overlapResult = signal("Not started");
    onCleanup(() => controller?.dispose());
    onCleanup(() => transient?.dispose());
    return (
      <div>
        <button
          id="overlap-default"
          onclick={() => {
            transient = createSkeletonController({
              scope: document.getElementById("first-boundary")!,
            });
            try {
              transient.activate();
              overlapResult.value = "Unexpected success";
            } catch {
              overlapResult.value = "Rejected overlap";
            }
          }}
        >
          Try overlapping scope
        </button>
        <button
          id="overlap-preserve"
          onclick={() => {
            transient?.dispose();
            transient = createSkeletonController({
              scope: document.getElementById("first-boundary")!,
              preserveExisting: true,
            });
            transient.activate();
            overlapResult.value = "Preserved existing scope";
          }}
        >
          Preserve existing scope
        </button>
        <button
          id="overlap-stop"
          onclick={() => {
            transient?.dispose();
          }}
        >
          Stop transient scope
        </button>
        <output id="overlap-result">{overlapResult}</output>
        <button
          id="start-first"
          onclick={() => {
            active.value = true;
          }}
        >
          Start first
        </button>
        <button
          id="finish-first"
          onclick={() => {
            active.value = false;
          }}
        >
          Finish first
        </button>
        <button
          id="append-content"
          onclick={() => {
            appended.value = <p id="appended-text">WWWWWWWW MMMMMMMM</p>;
          }}
        >
          Append content
        </button>
        <button
          id="start-second"
          onclick={() => {
            secondActive.value = true;
          }}
        >
          Start second
        </button>
        <button
          id="finish-second"
          onclick={() => {
            secondActive.value = false;
          }}
        >
          Finish second
        </button>
        <button
          id="remove-first"
          onclick={() => {
            first.value = null;
          }}
        >
          Remove first
        </button>
        <button
          id="plugin-start"
          onclick={() => {
            controller?.dispose();
            controller = createSkeletonController({
              scope: document.getElementById("plugin-scope")!,
              exclude: [document.getElementById("excluded-text")!],
            });
            controller.activate();
          }}
        >
          Start plugin
        </button>
        <button
          id="plugin-stop"
          onclick={() => {
            controller?.dispose();
          }}
        >
          Stop plugin
        </button>
        {first}
        <SkeletonBoundary id="second-boundary" active={secondActive} label="Loading second panel">
          <p id="second-text">Second independent panel</p>
        </SkeletonBoundary>
        <div
          id="plugin-scope"
          aria-busy="false"
          inert
          style="padding:10px;background:#fafafa;color:#222;border:1px solid #789"
        >
          <p id="plugin-text">Plugin text remains in the original node</p>
          <p id="excluded-text">Excluded text stays readable</p>
        </div>
      </div>
    );
  },
});
