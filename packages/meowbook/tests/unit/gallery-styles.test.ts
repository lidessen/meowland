import { expect, test } from "bun:test";
import { auditCSS } from "meowcss";
import { standardAuditRules } from "meowtail/theme";
import {
  chromeThemeAttribute,
  chromeThemeStyles,
  chromeThemes,
  galleryStyles,
} from "../../src/web/gallery.styles";

// The canvas styles are left out: the measurement overlay is an instrument with its own palette
// that also runs where no theme is loaded.
test("the gallery chrome holds to the standard scales, the type ramp included", () => {
  expect(auditCSS(galleryStyles, standardAuditRules)).toEqual([]);
});

test("each named chrome theme paints the shared roles under its own attribute", () => {
  for (const theme of chromeThemes.filter((name) => name !== "standard")) {
    expect(chromeThemeStyles).toContain(`[${chromeThemeAttribute}="${theme}"]`);
  }
  expect(chromeThemeStyles).toContain("--ui-surface-canvas");
});
