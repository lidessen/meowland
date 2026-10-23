import { expect, test } from "bun:test";
import { auditCSS } from "meowcss";
import { standardAuditRules } from "meowtail/theme";
import { docsStyles } from "../theme";

test("the docs chrome holds to the standard scales, the type ramp included", () => {
  expect(auditCSS(docsStyles, standardAuditRules)).toEqual([]);
});
