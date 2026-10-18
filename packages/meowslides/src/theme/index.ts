import { defineTheme } from "meowcss/meowjsx";
import { standardOptions, standardThemeTokens, standardThemeStyles } from "meowtail/theme";
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
export const presentationThemeStyles = [
  presentationStyles,
  presentationLayoutStyles,
  presentationTextStyles,
  presentationListStyles,
  ...standardThemeStyles,
  presentationImageStyles,
  mdxSlideStyles,
] as const;

/** One complete theme, assembled from the original UI token and fragment objects. */
export const presentationTheme = defineTheme({
  options: presentationOptions,
  defaults: { scheme: "auto" },
  tokens: presentationThemeTokens,
  styles: presentationThemeStyles,
});
