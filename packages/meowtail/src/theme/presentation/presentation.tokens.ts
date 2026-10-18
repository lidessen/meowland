import { defineTokens } from "meowcss";

/** Presentation content has its own reading scale, independent of toolbar controls. */
export const presentationTokens = defineTokens("presentation", {
  paper: ["#fbfaf6", "#1d252c"],
  ink: ["#182932", "#f4f4ed"],
  muted: ["#596974", "#bdcbd2"],
  accent: ["#136c68", "#7bd2c6"],
  fontBody: "28px",
  fontTitle: "60px",
  fontSubtitle: "46px",
  fontCaption: "20px",
  lineHeight: "1.4",
  insetBlock: "52px",
  insetInline: "64px",
  spaceGroup: "16px",
  spaceSection: "28px",
  spacePanel: "40px",
  chromeBackdrop: ["#e6ebe4", "#131f1b"],
  chromeSurface: ["#f4f5ee", "#1e3028"],
  chromeInk: ["#203d35", "#edf2e8"],
  chromeMuted: ["#586a5d", "#afc1b2"],
  chromeLine: ["#cbd4c9", "#40574a"],
});
