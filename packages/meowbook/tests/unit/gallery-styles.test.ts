import { expect, test } from "bun:test";
import { auditCSS } from "meowcss";
import { standardAuditRules } from "meowtail/theme";
import { galleryStyles } from "../../src/web/gallery.styles";

// The canvas styles are left out: the measurement overlay is an instrument with its own palette
// that also runs where no theme is loaded.
test("the gallery chrome holds to the standard scales, the type ramp included", () => {
  expect(auditCSS(galleryStyles, standardAuditRules)).toEqual([]);
});
