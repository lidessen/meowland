import { describe, expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { renderToHtmlWithRuntime } from "meowjsx/web";
import { auditCSS, cx } from "meowcss";
import { css, parts } from "meowcss/meowjsx";
import { createMeowUI } from "meowtail";
import {
  standardAuditRules,
  standardFoundationStyles,
  standardTheme,
  standardThemeStyles,
  ui,
  uiTokens,
  utilityStyles,
} from "meowtail/theme";
import { appComponents, appStyles, appTheme } from "../../fixtures/authoring/app-theme";
import { ListRow } from "../../fixtures/authoring/list-row";
import { PlanBadge } from "../../fixtures/authoring/plan-badge";
import { StatCard } from "../../fixtures/authoring/stat-card";

const runtime = () => createRuntime({ plugins: [createMeowUI({ components: appComponents })] });

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

  test("host className values preserve recursively composed utility and app classes", () => {
    const html = renderToHtmlWithRuntime(
      runtime(),
      h(PlanBadge, {
        className: [ui.p.group, [false, cx("host-class", [ui.radius.lg])]],
        children: "Pro",
        tone: "pro",
      }),
    );
    expect(html).toContain('class="ui-p-group host-class ui-radius-lg"');
  });

  test("the worked ports hold to the standard scales", () => {
    for (const fragment of appStyles) expect(auditCSS(fragment, standardAuditRules)).toEqual([]);
    expect(auditCSS(standardTheme.cssText, standardAuditRules)).toEqual([]);
  });

  test("drift is reported where it was written", () => {
    const root = parts<typeof PlanBadge>("app-plan-badge").root;
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

  test("type ramp roles and glyph boxes pass the type rules", () => {
    const root = parts<typeof PlanBadge>("app-plan-badge").root;
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

  test("the floor comes first and host fragments precede the shared utility catalog", () => {
    expect(standardThemeStyles[0]).toBe(standardFoundationStyles);
    expect(standardThemeStyles.at(-1)).toBe(utilityStyles);
    const sheet = appTheme.cssText;
    const lastStandard = sheet.lastIndexOf('data-meowui-part="assistant-view/root"');
    const host = sheet.indexOf('data-meowui-part="app-plan-badge/root"');
    const utilities = sheet.indexOf(".ui-p-group");
    expect(lastStandard).toBeGreaterThan(-1);
    expect(host).toBeGreaterThan(lastStandard);
    expect(utilities).toBeGreaterThan(host);
  });

  test("theme utilities carry material and interaction declarations", () => {
    const raised = css`
      ${ui.surface.raised}
    `.text;
    expect(raised).toContain(`border: ${uiTokens.line.width} solid ${uiTokens.line.edge};`);
    expect(raised).toContain(`background: ${uiTokens.surface.raised};`);
    const flat = css`
      ${ui.interactive.flat}
    `.text;
    expect(flat).toContain("@media (hover: hover)");
    expect(flat).toContain("&:focus-visible");
    expect(
      css`
        ${ui.interactive.raised}
      `.text,
    ).toContain("background-image: linear-gradient(");
    expect(String(cx(ui.p.group, ui.bg.fill, ui.radius.lg))).toBe(
      "ui-p-group ui-bg-fill ui-radius-lg",
    );
  });
});
