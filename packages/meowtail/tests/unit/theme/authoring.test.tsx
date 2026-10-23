import { describe, expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { renderToHtmlWithRuntime } from "meowjsx/web";
import { auditCSS } from "meowcss";
import { css, partSelector } from "meowcss/meowjsx";
import { createMeowUI } from "meowtail";
import {
  interactive,
  standardAuditRules,
  standardFoundationStyles,
  standardTheme,
  standardThemeStyles,
  surface,
  uiTokens,
} from "meowtail/theme";
import { appComponents, appStyles, appTheme } from "../../fixtures/authoring/app-theme";
import { ListRow } from "../../fixtures/authoring/list-row";
import { PlanBadge, planBadgeContract } from "../../fixtures/authoring/plan-badge";
import { StatCard } from "../../fixtures/authoring/stat-card";

const runtime = () => createRuntime({ plugins: [createMeowUI(), appComponents] });

describe("host authoring floor", () => {
  test("host components get their parts and options through the one installed plugin", () => {
    const html = renderToHtmlWithRuntime(
      runtime(),
      h("div", null, [
        h(PlanBadge, { tone: "pro", children: "Pro" }),
        h(StatCard, { label: "Active users", value: "1,204", delta: "+4%", trend: "up" }),
        h(ListRow, { title: "Billing", detail: "Plan and invoices", current: true }),
      ]),
    );
    expect(html).toContain('data-meowui-part="app-plan-badge/root"');
    expect(html).toContain('data-option-app-plan-badge-tone="pro"');
    expect(html).not.toMatch(/\stone=/);
    expect(html).toContain('data-meowui-part="app-stat-card/value"');
    expect(html).toContain('data-trend="up"');
    expect(html).toContain('data-meowui-part="app-list-row/root"');
    expect(html).toContain('aria-current="true"');
  });

  test("the worked ports hold to the standard scales", () => {
    for (const fragment of appStyles) expect(auditCSS(fragment, standardAuditRules)).toEqual([]);
    expect(auditCSS(standardTheme.cssText, standardAuditRules)).toEqual([]);
  });

  test("drift is reported where it was written", () => {
    const root = partSelector(planBadgeContract, "root");
    const drifted = css`
      ${root} {
        color: #333;
        border-radius: 7px;
        transition: color 150ms ease;
        font-size: 13px;
        line-height: 1.5;
        font-weight: 600;
        font: 500 13px/20px sans-serif;
      }
    `;
    expect(auditCSS(drifted, standardAuditRules).map((violation) => violation.rule)).toEqual([
      "literal-color",
      "literal-radius",
      "literal-duration",
      "literal-font-size",
      "literal-line-height",
      "literal-font-weight",
      "literal-font",
    ]);
  });

  test("type ramp roles, the unitless leading and glyph boxes pass the type rules", () => {
    const root = partSelector(planBadgeContract, "root");
    const onRamp = css`
      ${root} {
        font: ${uiTokens.type.weight.medium} ${uiTokens.type.label} / ${uiTokens.type.line.label}
          ${uiTokens.type.sans};
        line-height: ${uiTokens.type.leading};
        font-weight: ${uiTokens.type.weight.semibold};
      }
      ${root} > svg {
        font: ${uiTokens.type.caption} / 1 ${uiTokens.type.sans};
        line-height: 0;
      }
    `;
    expect(auditCSS(onRamp, standardAuditRules)).toEqual([]);
  });

  test("the floor comes first and host fragments come after every standard family", () => {
    expect(standardThemeStyles[0]).toBe(standardFoundationStyles);
    const sheet = appTheme.cssText;
    const lastStandard = sheet.lastIndexOf('data-meowui-part="assistant-view/root"');
    expect(lastStandard).toBeGreaterThan(-1);
    expect(sheet.indexOf('data-meowui-part="app-plan-badge/root"')).toBeGreaterThan(lastStandard);
  });

  test("recipes carry the rule, not only the value", () => {
    expect(String(surface("raised"))).toContain(uiTokens.line.edge.name);
    expect(String(surface("fill"))).not.toContain(uiTokens.line.edge.name);
    const flat = String(interactive({ on: "flat" }));
    expect(flat).toContain("@media (hover: hover)");
    expect(flat).toContain("&:focus-visible");
    expect(String(interactive({ on: "raised" }))).toContain("background-image: linear-gradient(");
  });
});
