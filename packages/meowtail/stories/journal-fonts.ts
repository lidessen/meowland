import interLatin from "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2";
import jetbrainsMonoLatin from "@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2";
import newsreaderLatin from "@fontsource-variable/newsreader/files/newsreader-latin-wght-normal.woff2";
import newsreaderLatinItalic from "@fontsource-variable/newsreader/files/newsreader-latin-wght-italic.woff2";

/** Fontsource's Latin subset; gallery copy is English, so the other subsets are never needed. */
const latin =
  "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";

const face = (family: string, url: string, weight: string, style = "normal") =>
  `@font-face{font-family:"${family}";font-style:${style};font-display:swap;font-weight:${weight};src:url(${url}) format("woff2-variations");unicode-range:${latin}}`;

/**
 * The faces `journalFonts` names, for the gallery. Importing the font CSS would make the bundler
 * inline every subset into each canvas, so the gallery imports only the Latin files, which the
 * bundler publishes as files, and mounts these rules when a story is painted with Journal.
 */
export const journalFontFaces = [
  face("Newsreader Variable", newsreaderLatin, "200 800"),
  face("Newsreader Variable", newsreaderLatinItalic, "200 800", "italic"),
  face("Inter Variable", interLatin, "100 900"),
  face("JetBrains Mono Variable", jetbrainsMonoLatin, "100 800"),
].join("\n");
