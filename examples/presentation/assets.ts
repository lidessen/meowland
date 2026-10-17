import original from "./assets/coast-original.png" with { type: "file" };
import delivery from "./assets/coast-delivery.jpg" with { type: "file" };
import recording from "./assets/local-transfer.webm" with { type: "file" };
import captions from "./assets/local-transfer.vtt" with { type: "file" };
import tone from "./assets/quiet-tone.wav" with { type: "file" };

export const assets = { original, delivery, recording, captions, tone };
// Generated files measured on disk; decimal MB/Mbit, not MiB/Mibit.
export const imageFacts = {
  width: 2200,
  height: 1400,
  originalBytes: 3597630,
  deliveryBytes: 67108,
} as const;
export const transferSeconds = (bytes: number, mbps: number) => (bytes * 8) / (mbps * 1_000_000);
export const secondsLabel = (seconds: number) =>
  seconds < 0.01 ? "<0.01 s" : `${seconds.toFixed(2)} s`;
export const bytesLabel = (bytes: number) =>
  bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(2)} MB` : `${(bytes / 1_000).toFixed(1)} kB`;
