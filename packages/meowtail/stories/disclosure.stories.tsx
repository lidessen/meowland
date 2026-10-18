import { h } from "meowjsx/runtime";
import { defineStory } from "meowbook";
import { Disclosure } from "meowtail";

export const DisclosureStory = defineStory({
  id: "disclosure",
  title: "Disclosure · Preserving reading context",
  group: "Navigation and layout",
  groupOrder: 40,
  component: "Disclosure",
  variant: "Reading context",
  description:
    "Expands only the supplementary information you need. Native keyboard operation, initial expansion, and nested regions do not interfere with each other.",
  covers: ["Disclosure open/onToggle", "Disclosure host slots", "native keyboard", "long content"],
  render: () => (
    <div className="workshop-composition" data-disclosure-example>
      <header className="workshop-composition-header">
        <h2>Component review record</h2>
        <p>Main conclusions stay visible; execution details expand when needed.</p>
      </header>
      <div className="workshop-section">
        <Disclosure
          summary="View execution details"
          data-disclosure="execution"
          onToggle={(event) => {
            const details = event.currentTarget as HTMLDetailsElement;
            const status = details
              .closest("[data-disclosure-example]")
              ?.querySelector("[data-disclosure-status]");
            if (status)
              status.textContent = details.open
                ? "Execution details expanded"
                : "Execution details collapsed";
          }}
        >
          <div className="workshop-disclosure-detail">
            <p>Checked messages, attachments, and tool results. Review file:</p>
            <code className="workshop-disclosure-path">
              packages/meowtail/stories/review-of-component-typography-and-interaction-states.tsx
            </code>
            <Disclosure summary="View review scope" data-disclosure="nested">
              <p>
                Covers text hierarchy, keyboard focus, and content wrapping on desktop and narrow
                screens.
              </p>
            </Disclosure>
          </div>
        </Disclosure>
        <Disclosure
          summary="Limitations to confirm"
          open
          data-disclosure="open"
          className="review-note"
          summaryClassName="review-note-heading"
          contentClassName="review-note-body"
        >
          <p>
            Component verification does not mean a real service is connected. Integration acceptance
            needs a separate check of data sources and failure recovery.
          </p>
        </Disclosure>
      </div>
      <p className="workshop-feedback" data-disclosure-status role="status">
        Execution details collapsed
      </p>
    </div>
  ),
});
