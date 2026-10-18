import {
  defineComponent,
  h,
  mapSignal,
  signal,
  type Child,
  type MaybeSignal,
  type ReadableSignal,
} from "meowjsx";
import { Button, Grid, ImagePreview, Inline, Stack } from "meowtail";
import {
  Presentation,
  PresentationAudio,
  PresentationVideo,
  Reveal,
  usePresentationActivity,
  type SlideDefinition,
  type SlidePosition,
} from "meowslides";
import { assets, bytesLabel, imageFacts, secondsLabel, transferSeconds } from "./assets";

export const talkVersion = "image-waiting-b3";
export interface TalkOptions {
  initialPosition?: SlidePosition;
  speed?: number;
  active?: MaybeSignal<boolean>;
}

const TransferPreview = defineComponent<
  { speed: ReadableSignal<number> },
  "image-talk-transfer",
  "root"
>({ name: "image-talk-transfer", parts: ["root"] }, ({ speed }, context) => {
  const active = usePresentationActivity();
  const progress = context.signal(1);
  const replay = context.signal(0);
  const reduceMotion = context.signal(false);
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
  return context.part(
    "root",
    "section",
    { "aria-label": "Illustrative transfer comparison", "data-transfer-active": active },
    [
      <p className="fine-print">Same connection · animation follows the estimate</p>,
      <div className="transfer-name">
        <span>Original PNG</span>
        <span>{bytesLabel(imageFacts.originalBytes)}</span>
      </div>,
      <div className="transfer-track">
        <div
          className="transfer-fill"
          style={{ width: mapSignal(progress, (p) => `${p * 100}%`) }}
        />
      </div>,
      <div className="transfer-name">
        <span>Delivery JPEG</span>
        <span>{bytesLabel(imageFacts.deliveryBytes)}</span>
      </div>,
      <div className="transfer-track">
        <div
          className="transfer-fill delivery"
          style={{ width: mapSignal(progress, (p) => `${Math.min(1, p * compactRatio) * 100}%`) }}
        />
      </div>,
      <Button
        variant="outline"
        onClick={() => replay.update((v) => v + 1)}
        disabled={mapSignal(active, (value) => !value)}
      >
        Replay estimate
      </Button>,
      <p className="fine-print">
        Animation is an illustration, not a live network measurement. Reduced motion shows the
        complete bars.
      </p>,
    ],
  );
});

export function createImageTalk(options: TalkOptions = {}) {
  const position = signal<SlidePosition>(
    options.initialPosition ?? { slideId: "opening", step: 0 },
  );
  const speed = signal(options.speed ?? 8);
  const videoTime = signal(0);
  const originalTime = mapSignal(speed, (value) =>
    secondsLabel(transferSeconds(imageFacts.originalBytes, value)),
  );
  const deliveryTime = mapSignal(speed, (value) =>
    secondsLabel(transferSeconds(imageFacts.deliveryBytes, value)),
  );
  const go = (slideId: string, step = 0) => {
    position.value = { slideId, step };
  };
  const slides: readonly SlideDefinition[] = [
    {
      id: "opening",
      title: "The same image. A different wait.",
      steps: 1,
      render: () => (
        <Grid
          columns={2}
          gap="relaxed"
          style={{ gridTemplateColumns: "1.3fr 1fr", alignItems: "center", height: "100%" }}
        >
          <Stack gap="relaxed">
            <p className="eyebrow">A small experiment · 3–5 minutes</p>
            <h1 className="talk-title">
              The same image.
              <br />A different wait.
            </h1>
            <p className="talk-copy">
              A picture’s dimensions tell us how much we can see. Its bytes help explain how long we
              wait.
            </p>
            <Reveal at={1}>
              <p className="result-line">
                Today: change the connection.
                <br />
                <strong>Keep the picture.</strong>
              </p>
            </Reveal>
            <p className="fine-print">
              Original local artwork · no external requests · editable TSX
            </p>
          </Stack>
          <figure>
            <ImagePreview
              className="coast-image opening-image"
              src={assets.delivery}
              alt="Original illustration of a sunlit coastal inlet, layered green hills and textured blue water"
              loading="eager"
            />
            <figcaption>One scene. Two encodings.</figcaption>
          </figure>
        </Grid>
      ),
    },
    {
      id: "compare",
      title: "Same dimensions. Fewer bytes.",
      steps: 1,
      render: () => (
        <Stack gap="relaxed">
          <header>
            <p className="eyebrow">01 / Look closely</p>
            <h2 className="talk-heading">Same dimensions. Fewer bytes.</h2>
          </header>
          <Grid columns={2} gap="relaxed">
            <figure>
              <ImagePreview
                className="coast-image"
                style={{ maxHeight: "245px" }}
                src={assets.original}
                alt="Coastal illustration in the original lossless PNG encoding"
                loading="eager"
              />
              <figcaption>PNG · {bytesLabel(imageFacts.originalBytes)} · 2200 × 1400</figcaption>
            </figure>
            <figure>
              <ImagePreview
                className="coast-image"
                style={{ maxHeight: "245px" }}
                src={assets.delivery}
                alt="The same coastal illustration encoded as a smaller lossy JPEG; fine texture is softened"
                loading="eager"
              />
              <figcaption>JPEG · {bytesLabel(imageFacts.deliveryBytes)} · 2200 × 1400</figcaption>
            </figure>
          </Grid>
          <Reveal at={1}>
            <p className="result-line">
              <strong>
                {Math.round(imageFacts.originalBytes / imageFacts.deliveryBytes)}× fewer bytes.
              </strong>{" "}
              Not identical quality: the fine texture is softened.
            </p>
          </Reveal>
          <p className="fine-print">
            Measured file sizes, not a general claim about PNG versus JPEG. Choose an acceptable
            result for the actual viewing size.
          </p>
        </Stack>
      ),
    },
    {
      id: "experiment",
      title: "Give the connection a speed.",
      steps: 3,
      render: () => (
        <Stack gap="relaxed">
          <header>
            <p className="eyebrow">02 / Try the tradeoff</p>
            <h2 className="talk-heading">Give the connection a speed.</h2>
          </header>
          <Grid columns={2} gap="relaxed" style={{ gridTemplateColumns: ".9fr 1.1fr" }}>
            <Stack className="experiment-panel" gap="compact">
              <label className="speed-label" htmlFor="network-speed">
                Network speed <span>(Mbit/s)</span>
              </label>
              <output
                className="stat accent"
                htmlFor="network-speed"
                aria-label="Selected network speed"
              >
                {speed} <span style={{ fontSize: "20px", letterSpacing: "0" }}>Mbit/s</span>
              </output>
              <input
                id="network-speed"
                aria-label="Network speed (Mbit/s)"
                type="range"
                min="1"
                max="101"
                step="1"
                value={speed}
                onInput={(event: Event) => {
                  speed.value = Number((event.currentTarget as HTMLInputElement).value);
                }}
              />
              <div className="speed-endpoints">
                <span>1 · slower</span>
                <span>101 · faster</span>
              </div>
              <div className="estimate">
                <p className="metric-label">Estimated transfer · original / delivery</p>
                <output aria-label="Estimated transfer time">
                  {originalTime} / {deliveryTime}
                </output>
              </div>
              <Inline className="talk-actions" gap="compact">
                <Button variant="outline" onClick={() => go("evidence")}>
                  Open evidence
                </Button>
                <Button
                  variant="quiet"
                  onClick={() => {
                    speed.value = 8;
                  }}
                >
                  Reset experiment
                </Button>
              </Inline>
            </Stack>
            <Stack gap="normal">
              <Reveal at={1}>
                <p className="formula">seconds ≈ bytes × 8 ÷ (Mbit/s × 1,000,000)</p>
              </Reveal>
              <Reveal at={2}>
                <TransferPreview speed={speed} />
              </Reveal>
              <Reveal at={3}>
                <p className="fine-print">
                  Transfer-only estimate for an uncached response at fixed throughput. Latency,
                  server work, decoding and network variation change the result; a warm cache can
                  avoid transfer.
                </p>
              </Reveal>
            </Stack>
          </Grid>
        </Stack>
      ),
    },
    {
      id: "evidence",
      title: "A controlled load, not a benchmark.",
      steps: 1,
      render: () => (
        <Stack gap="normal">
          <header>
            <p className="eyebrow">03 / Check the evidence</p>
            <h2 className="talk-heading">A controlled load, not a benchmark.</h2>
          </header>
          <Grid columns={2} gap="relaxed" style={{ gridTemplateColumns: "1.3fr 1fr" }}>
            <Stack gap="compact">
              <PresentationVideo
                className="evidence-video"
                label="Local image transfer recording"
                src={assets.recording}
                poster={assets.delivery}
                preload="metadata"
                ref={(video: HTMLVideoElement) => {
                  const restore = () => {
                    if (videoTime.value > 0 && Number.isFinite(video.duration))
                      video.currentTime = Math.min(videoTime.value, video.duration);
                  };
                  if (video.readyState >= 1) restore();
                  video.addEventListener("loadedmetadata", restore, { once: true });
                  return () => {
                    if (Number.isFinite(video.currentTime)) videoTime.value = video.currentTime;
                    video.removeEventListener("loadedmetadata", restore);
                  };
                }}
                onTimeUpdate={(event: Event) => {
                  videoTime.value = (event.currentTarget as HTMLVideoElement).currentTime;
                }}
              >
                <track kind="captions" src={assets.captions} srcLang="en" label="English" default />
                <p>
                  Video unavailable. A local server sends the same two image files in controlled
                  chunks. The smaller file completes first.
                </p>
              </PresentationVideo>
              <p className="video-caption">
                12-second browser recording. Local HTTP; deliberately paced chunks. It demonstrates
                transfer, not public-network performance. Silent video with captions.
              </p>
            </Stack>
            <Stack gap="normal">
              <p className="talk-copy">
                The browser really requests and decodes both local files. The server controls the
                wait.
              </p>
              <Reveal at={1}>
                <p className="fine-print">
                  What the estimate leaves out: round trips, server time, decode work and cache
                  hits. A warm cache can avoid the transfer entirely.
                </p>
              </Reveal>
              <Button variant="outline" onClick={() => go("experiment", 3)}>
                Return to experiment
              </Button>
              <p className="fine-print">
                Your selected speed is still {speed} Mbit/s. Returning restores the video time,
                never its sound.
              </p>
            </Stack>
          </Grid>
        </Stack>
      ),
    },
    {
      id: "summary",
      title: "Choose detail. Then send fewer bytes.",
      steps: 1,
      render: () => (
        <Stack gap="relaxed">
          <header>
            <p className="eyebrow">04 / Take it with you</p>
            <h2 className="talk-heading">Choose detail. Then send fewer bytes.</h2>
          </header>
          <p className="result-line">
            At <strong>{speed} Mbit/s</strong>, the transfer-only estimate is
            <br />
            <strong>{originalTime}</strong> for the original and <strong>{deliveryTime}</strong> for
            delivery.
          </p>
          <Reveal at={1}>
            <ul className="source-list">
              <li>Choose dimensions for the display.</li>
              <li>Keep the smaller file only when its detail is enough.</li>
              <li>Measure the real experience; use the estimate to ask better questions.</li>
            </ul>
          </Reveal>
          <Inline className="talk-actions" gap="normal">
            <Button onClick={() => go("experiment", 3)}>Revisit your experiment</Button>
            <Button variant="outline" onClick={() => go("evidence", 1)}>
              Check evidence
            </Button>
          </Inline>
          <p className="fine-print">
            Source: original procedural artwork, PNG → JPEG on this machine. Decimal bytes and
            Mbit/s. No claim that this ratio applies to every image.
          </p>
        </Stack>
      ),
    },
  ];
  const view: Child = (
    <Presentation
      className="image-talk"
      title="Why the same image can feel slow"
      slides={slides}
      position={position}
      active={options.active}
    />
  );
  return { view, position, speed, version: talkVersion };
}

export function createMusicDemo(active: MaybeSignal<boolean> = true) {
  return (
    <Presentation
      className="image-talk"
      title="Optional single-track audio"
      active={active}
      soundtrack={
        <PresentationAudio src={assets.tone} label="Original quiet tone" preload="metadata" />
      }
      slides={[
        {
          id: "music-first",
          title: "Music is optional.",
          render: () => (
            <Stack gap="relaxed">
              <p className="eyebrow">Separate media check</p>
              <h1 className="talk-title">Music is optional.</h1>
              <p className="music-copy">
                Play the quiet six-second tone using its native controls. It can continue while
                navigating between these two pages. Pausing the presentation closes its activity
                permission.
              </p>
              <p className="fine-print">
                Original synthesized 220 Hz tone. No autoplay. Keep your system volume low.
              </p>
            </Stack>
          ),
        },
        {
          id: "music-second",
          title: "One track. Two pages.",
          render: () => (
            <Stack gap="relaxed">
              <p className="eyebrow">Separate media check</p>
              <h2 className="talk-heading">One track. Two pages.</h2>
              <p className="music-copy">
                The root audio element belongs to this presentation, rather than either page.
                Leaving the work releases it.
              </p>
            </Stack>
          ),
        },
      ]}
    />
  );
}
