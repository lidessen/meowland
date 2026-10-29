import type { GallerySettings, StoryEntry } from "../types";
import { mountGallery } from "./gallery-shell";

// The canvas and the manifest sit next to the gallery, whatever path it is served from.
const manifest = fetch("./manifest.json").then(async (response) => {
  if (!response.ok) throw new Error("Failed to load the scenario manifest");
  return (await response.json()) as StoryEntry[];
});
let settings: GallerySettings = {};
try {
  const response = await fetch("./gallery.json");
  if (response.ok) settings = await response.json();
} catch {
  /* Without host settings the gallery keeps its own chrome. */
}
mountGallery({ settings, manifest });
