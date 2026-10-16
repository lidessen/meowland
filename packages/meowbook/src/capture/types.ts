import type { StoryEntry } from "../types";
import type { SkeletonSnapshot } from "meowjsx/web";
import type { GuideOptions, GuideResult } from "./guides";
import type { FocusOptions, FocusResult } from "./focus";
export type { FocusOptions, FocusResult, FocusTarget } from "./focus";
export type { GuideLine, GuideOptions, GuideResult, GuideTarget } from "./guides";

/** All geometry is in CSS pixels in the current viewport. */
export interface CaptureRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type CaptureVisibility = "visible" | "hidden" | "offscreen" | "clipped" | "no-visual-output";

export interface CaptureInstance {
  id: string;
  parentId: string | null;
  name: string;
  originalName?: string;
  transparent: boolean;
  transparentReason?: string;
  rects: CaptureRect[];
  visibleRects: CaptureRect[];
  visibility: CaptureVisibility;
  approximate?: string[];
}

export type CaptureFactReason =
  | "unmapped-node"
  | "ambiguous-owner"
  | "iframe-content-unobserved"
  | "shadow-content-unobserved";

/** Current DOM facts, not input values, readiness or an accessibility verdict. */
export interface CaptureActiveFocus {
  status: "observed" | "none" | "unknown";
  instanceId?: string;
  /** Nearest containing part; not necessarily the active element itself. */
  part?: string;
  reason?: CaptureFactReason;
}

export interface CaptureScrollView {
  status: "observed" | "unknown";
  instanceId?: string;
  part?: string;
  region?: string;
  declaredOwner?: "layout" | "content";
  reason?: CaptureFactReason;
  overflowX: string;
  overflowY: string;
  clientWidth: number;
  clientHeight: number;
  scrollWidth: number;
  scrollHeight: number;
  scrollLeft: number;
  scrollTop: number;
}

export interface CaptureSnapshot {
  story: StoryEntry;
  nodes: CaptureInstance[];
  viewport: { width: number; height: number };
  dpr: number;
  boundaries?: string[];
  replacements?: { component: string; replacement?: string; hits: number }[];
  activeFocus?: CaptureActiveFocus;
  scrollViews?: CaptureScrollView[];
}

/** Shared browser-side contract, also imported by the Playwright consumer. */
export interface CaptureCanvasAPI {
  snapshot(): CaptureSnapshot;
  paintSkeleton(id: string): SkeletonSnapshot;
  clearSkeleton(id: string): void;
}

declare global {
  interface Window {
    __MEOWBOOK_CAPTURE__?: CaptureCanvasAPI;
  }
}

export type CaptureSelection = "selected" | "transparent" | "depth" | "outside-selection";

export interface CaptureNode extends CaptureInstance {
  selection: CaptureSelection;
  captureParentId: string | null;
  captureDepth?: number;
  matched: boolean;
  image?: string;
  contentRect?: CaptureRect;
  cropRect?: CaptureRect;
  pixelRect?: CaptureRect;
}

export interface CaptureScene {
  story: StoryEntry;
  /** Live pages use DOM regions, not an inferred component tree. */
  source?: { kind: "page"; url: string; root: string };
  name?: string;
  testLocation?: string;
  status: "success" | "failed" | "unmatched" | "unexecuted";
  matched: number;
  nodes: CaptureNode[];
  frame?: string;
  /** Supplemental document image; node geometry remains relative to frame. */
  fullPage?: string;
  /** Supplemental annotations; original photographs remain unchanged. */
  guides?: GuideResult;
  focus?: FocusResult;
  aria?: string;
  diagnostic?: string;
  error?: string;
  environment?: Record<string, unknown>;
  boundaries?: string[];
  replacements?: CaptureSnapshot["replacements"];
  activeFocus?: CaptureActiveFocus;
  scrollViews?: CaptureScrollView[];
  replay?: string;
  durationMs?: number;
}

export interface CaptureSummary {
  requested: number;
  successful: number;
  failed: number;
  unmatched: number;
  unexecuted: number;
  matched: number;
  images: number;
  outsideSelection: number;
  transparent: number;
  hidden: number;
  offscreen: number;
  clipped: number;
  noVisualOutput: number;
}

export interface CaptureManifest {
  version: 1;
  createdAt: string;
  status: "complete" | "partial" | "cancelled";
  input: Record<string, unknown>;
  environment?: Record<string, unknown>;
  references?: Record<string, unknown>;
  git?: { revision?: string; dirty?: boolean };
  timings?: { buildMs?: number; browserMs?: number; totalMs: number };
  scenes: CaptureScene[];
  summary?: CaptureSummary;
}

export interface CaptureSceneOptions {
  target?: CapturePageTarget;
  focus?: FocusOptions;
  guides?: GuideOptions;
  /** Existing run's scene directory. Files are never overwritten. */
  directory: string;
  /** Manifest-relative directory, such as s001. */
  pathPrefix: string;
  story?: StoryEntry;
  depth?: number | "all";
  select?: string;
  timeout?: number;
  signal?: AbortSignal;
  name?: string;
  testLocation?: string;
  /** Also save the whole document without changing viewport crops. */
  fullPage?: boolean;
}

export interface CapturePageOptions {
  /** Explicit live-page mode; does not require a Storybook canvas or observer. */
  target?: CapturePageTarget;
  focus?: FocusOptions;
  guides?: GuideOptions;
  /** Parent directory; each invocation creates its own run below it. */
  out?: string;
  depth?: number | "all";
  select?: string;
  timeout?: number;
  signal?: AbortSignal;
  name?: string;
  fullPage?: boolean;
  /** Script or test recording the interaction steps, not a story CLI command. */
  testLocation?: string;
}

export interface CapturePageTarget {
  id: string;
  title: string;
  /** A visible CSS target that the application considers ready. */
  ready: string;
  /** Root for ARIA and DOM-region discovery; the original still shows the viewport. */
  root?: string;
}

export interface CaptureResult {
  directory: string;
  manifestPath: string;
  reportPath: string;
  manifest: CaptureManifest;
}
