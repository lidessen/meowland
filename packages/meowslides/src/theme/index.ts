import { defineTheme } from "meowcss/meowjsx";
import {
  standardFoundationStyles,
  standardOptions,
  standardThemeTokens,
  standardThemeStyles,
  utilityStyles,
} from "meowtail/theme";
import { mdxSlideStyles } from "./mdx.styles";
import { presentationStyles } from "./presentation/presentation.styles";
import { presentationLayoutStyles } from "./presentation/layout.styles";
import { presentationTextStyles } from "./presentation/presentation-text.styles";
import { presentationListStyles } from "./presentation/list.styles";
import { presentationImageStyles } from "./presentation/image.styles";
import { presentationTokens } from "./presentation/presentation.tokens";

export { presentationTokens } from "./presentation/presentation.tokens";
/** The same options object as Meowtail's standard theme, including local scheme inheritance. */
export const presentationOptions = standardOptions;
export const presentationThemeTokens = [...standardThemeTokens, presentationTokens] as const;
// The floor comes first, then presentation rules, then shared utilities at the end.
export const presentationThemeStyles = [
  standardFoundationStyles,
  ...standardThemeStyles.filter(
    (fragment) => fragment !== standardFoundationStyles && fragment !== utilityStyles,
  ),
  presentationStyles,
  presentationLayoutStyles,
  presentationTextStyles,
  presentationListStyles,
  presentationImageStyles,
  mdxSlideStyles,
  utilityStyles,
] as const;

/** One complete theme, assembled from the original UI token and fragment objects. */
export const presentationTheme = defineTheme({
  options: presentationOptions,
  defaults: { scheme: "auto" },
  tokens: presentationThemeTokens,
  styles: presentationThemeStyles,
});
