import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Inline, StatusDot, type StatusDotState } from "meowtail";
import { SchemePair } from "./scheme-pair";

const states: readonly [StatusDotState, string, string][] = [
  ["processing", "In progress / underway", "accent · pulse"],
  ["success", "Connected / enabled / goal completed", "success · solid"],
  ["returned", "Run returned", "success · hollow; returned does not mean the goal is complete"],
  ["warning", "Waiting for your answer / reminder", "warning · the only color that interrupts you"],
  ["danger", "Incomplete / unreadable", "danger"],
  ["unknown", "Status unconfirmed / not detected", "hollow · does not pretend to know"],
  ["idle", "Idle", "solid gray · a known quiet state"],
];

export const StatusDotStory = defineStory({
  id: "status-dot",
  title: "Status dot · Status semantics",
  group: "Basic controls",
  groupOrder: 12,
  component: "StatusDot",
  variant: "Status semantics",
  description:
    "One dot expresses one state only: an accent pulse means something is happening, green means returned or connected, orange means it waits for you, red means failure, and a hollow gray dot means not yet verified. The dot carries no text of its own, so a description must sit next to it.",
  covers: [
    "StatusDot all states",
    "halo processing/success",
    "size 6/8/10",
    "inline with text",
    "light and dark",
  ],
  render() {
    return (
      <SchemePair>
        {() => (
          <div style={{ display: "grid", gap: "18px" }}>
            <div style={{ display: "grid", gap: "10px" }}>
              {states.map(([state, label, note]) => (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <StatusDot state={state} />
                  <strong style={{ fontWeight: "500" }}>{label}</strong>
                  <span style={{ color: "var(--ui-ink-tertiary)" }}>{note}</span>
                </div>
              ))}
            </div>
            <Inline align="center" gap="compact">
              <span style={{ fontSize: "12.5px", color: "var(--ui-ink-secondary)" }}>
                With halo (the only leading status on a page)
              </span>
              <StatusDot state="processing" halo />
              <StatusDot state="success" size={7} halo />
            </Inline>
            <Inline align="center" gap="compact">
              <span style={{ fontSize: "12.5px", color: "var(--ui-ink-secondary)" }}>
                Sizes 6 / 8 / 10
              </span>
              <StatusDot state="processing" size={6} />
              <StatusDot state="processing" />
              <StatusDot state="processing" size={10} />
              <StatusDot state="returned" size={10} />
            </Inline>
          </div>
        )}
      </SchemePair>
    );
  },
});
