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
});
