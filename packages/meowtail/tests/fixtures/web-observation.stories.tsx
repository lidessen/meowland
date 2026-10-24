import {
  createComponentObservation,
  createRuntime,
  h,
  signal,
  type Child,
  type Context,
  type Props,
} from "meowjsx";
import { createSkeletonController, createWebRenderer, useWebObservation } from "meowjsx/web";
import { defineStory } from "meowbook";

export const WebObservation = defineStory({
  id: "web-observation",
  title: "Web observation consumers",
  render: () => (
    <div>
      <div id="render-a" />
      <div id="render-b" />
      <div id="render-plain" />
      <div id="render-host" />
    </div>
  ),
  setup({ root, onCleanup }) {
    const runtime = createRuntime();
    const sourceA = createComponentObservation<Node>();
    const sourceB = createComponentObservation<Node>();
    const emptySource = createComponentObservation<Node>();
    const added = signal<Child>(null);
    const neighbor = signal<Child>("Unrelated branch");
    function Panel({ name }: { name: string }) {
      const source = useWebObservation();
      return (
        <section
          id={`panel-${name}`}
          data-source={source === sourceA ? "a" : source === sourceB ? "b" : "none"}
          style="padding:12px;background:#fff;color:#111;width:280px"
        >
          <p>MMMMMMMM WWWWWWWW</p>
          {name === "a" ? added : null}
        </section>
      );
    }
    function Neighbor(_props: Props, _context: Context<typeof Neighbor>) {
      return <aside id="neighbor">{neighbor}</aside>;
    }
    Neighbor.meta = { name: "observation-neighbor", parts: [] } as const;
    const rendererA = createWebRenderer(runtime, { observation: sourceA });
    const rendererB = createWebRenderer(runtime, { observation: sourceB });
    const rendererPlain = createWebRenderer(runtime);
    const mountA = rendererA.render(
      [h(Panel, { name: "a" }), h(Neighbor, {})],
      root.querySelector("#render-a")!,
    );
    const mountB = rendererB.render(h(Panel, { name: "b" }), root.querySelector("#render-b")!);
    const mountPlain = rendererPlain.render(
      h(Panel, { name: "plain" }),
      root.querySelector("#render-plain")!,
    );
    const mountHost = rendererPlain.render(
      h("p", { id: "host-text" }, "Pure host text without component ownership"),
      root.querySelector("#render-host")!,
    );
    const hostController = createSkeletonController({
      scope: root.querySelector("#render-host")!,
      observation: { source: emptySource },
    });
    hostController.activate();
    const panelA = root.querySelector("#panel-a")!;
    const panelB = root.querySelector("#panel-b")!;
    const instanceA = sourceA.read().find((instance) => instance.component === Panel)!;
    const instanceB = sourceB.read().find((instance) => instance.component === Panel)!;
    const controllerA = createSkeletonController({
      scope: panelA,
      observation: { source: sourceA, root: instanceA },
    });
    const controllerB = createSkeletonController({
      scope: panelB,
      observation: { source: sourceB, root: instanceB },
    });
    controllerA.activate();
    controllerB.activate();
    let previousA = controllerA.snapshot;
    let previousB = controllerB.snapshot;
    const api = {
      remember() {
        previousA = controllerA.snapshot;
        previousB = controllerB.snapshot;
      },
      read() {
        return {
          a: controllerA.snapshot.ranges,
          b: controllerB.snapshot.ranges,
          host: hostController.snapshot.ranges,
          emptySourceSize: emptySource.read().length,
          sameA: previousA === controllerA.snapshot,
          sameB: previousB === controllerB.snapshot,
          nodesA: sourceA
            .read()
            .flatMap((instance) => [...instance.nodes])
            .filter((node) => node instanceof Element)
            .map((node) => (node as Element).id)
            .filter(Boolean),
          nodesB: sourceB
            .read()
            .flatMap((instance) => [...instance.nodes])
            .filter((node) => node instanceof Element)
            .map((node) => (node as Element).id)
            .filter(Boolean),
        };
      },
      append() {
        added.value = <p id="source-added">New signal content</p>;
      },
      changeNeighbor() {
        neighbor.value = "Updated unrelated branch";
      },
      removeA() {
        controllerA.dispose();
        mountA.unmount();
        sourceA.dispose();
      },
      stopHost() {
        hostController.dispose();
      },
    };
    (window as unknown as { skeletonObservationFixture?: typeof api }).skeletonObservationFixture =
      api;
    onCleanup(() => {
      controllerA.dispose();
      controllerB.dispose();
      hostController.dispose();
      mountA.unmount();
      mountB.unmount();
      mountPlain.unmount();
      mountHost.unmount();
      sourceA.dispose();
      sourceB.dispose();
      emptySource.dispose();
      delete (window as unknown as { skeletonObservationFixture?: typeof api })
        .skeletonObservationFixture;
    });
  },
});
