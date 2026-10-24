import { h, type Context } from "meowjsx";
import { mapSignal, signal, type ReadableSignal } from "meowjsx/signal";
import type { WebRef } from "meowjsx/web";
import "meowjsx/web";
import { Button } from "meowtail";
import { usePresentationActivity } from "meowslides";
import { bytesLabel, imageFacts, transferSeconds } from "./assets";

export interface TransferEstimateProps {
  speed: ReadableSignal<number>;
  ref?: WebRef<HTMLElement>;
}

export function TransferEstimate(
  { speed, ref }: TransferEstimateProps,
  context: Context<typeof TransferEstimate>,
) {
  const active = usePresentationActivity();
  const progress = signal(1);
  const replay = signal(0);
  const reduceMotion = signal(false);
  context.effect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reduceMotion.value = query.matches;
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  });
  context.effect(() => {
    const permitted = active.value;
    const reduced = reduceMotion.value;
    const duration = transferSeconds(imageFacts.originalBytes, speed.value) * 1000;
    void replay.value;
    progress.value = 1;
    if (!permitted || reduced) return;
    let frame = 0;
    const started = performance.now();
    progress.value = 0;
    const tick = (now: number) => {
      progress.value = Math.min(1, (now - started) / duration);
      if (progress.value < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  });
  const compactRatio = imageFacts.originalBytes / imageFacts.deliveryBytes;
  return (
    <section
      aria-label="Illustrative transfer comparison"
      data-transfer-active={active}
      ref={[context.parts.root, ref]}
    >
      <p className="fine-print">Same connection · animation follows the estimate</p>
      <div className="transfer-name">
        <span>Original PNG</span>
        <span>{bytesLabel(imageFacts.originalBytes)}</span>
      </div>
      <div className="transfer-track">
        <div
          className="transfer-fill"
          style={{ width: mapSignal(progress, (p) => `${p * 100}%`) }}
        />
      </div>
      <div className="transfer-name">
        <span>Delivery JPEG</span>
        <span>{bytesLabel(imageFacts.deliveryBytes)}</span>
      </div>
      <div className="transfer-track">
        <div
          className="transfer-fill delivery"
          style={{ width: mapSignal(progress, (p) => `${Math.min(1, p * compactRatio) * 100}%`) }}
        />
      </div>
      <Button
        variant="outline"
        onClick={() => replay.update((v) => v + 1)}
        disabled={mapSignal(active, (value) => !value)}
      >
        Replay estimate
      </Button>
      <p className="fine-print">
        Animation is an illustration, not a live network measurement. Reduced motion shows the
        complete bars.
      </p>
    </section>
  );
}
TransferEstimate.meta = { name: "image-talk-transfer", parts: ["root"] } as const;
