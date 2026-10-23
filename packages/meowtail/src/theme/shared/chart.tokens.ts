import { defineTokens } from "meowcss";

/**
 * The categorical series colors every chart shares, in a fixed order: a series takes the next
 * slot and keeps it, never a cycled or generated hue. Eight hues validated for color-vision
 * deficiency in both schemes (adjacent pairs at least 9.1 ΔE light and 8.4 dark, normal vision at
 * least 19.3). In the dark scheme every slot reaches 3:1 on the raised surface; in the light
 * scheme aqua, yellow and magenta fall below it, so a chart that uses them labels its marks or
 * draws a legend rather than relying on color alone.
 */
export const chartTokens = defineTokens("chart", {
  series1: ["#2a78d6", "#3987e5"],
  series2: ["#eb6834", "#d95926"],
  series3: ["#1baf7a", "#199e70"],
  series4: ["#eda100", "#c98500"],
  series5: ["#e87ba4", "#d55181"],
  series6: ["#008300", "#008300"],
  series7: ["#6250d6", "#9085e9"],
  series8: ["#e34948", "#e66767"],
});
