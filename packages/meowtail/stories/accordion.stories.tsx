import { h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { Accordion, Stack } from "meowtail";

export const AccordionStory = defineStory({
  id: "accordion",
  title: "Accordion · Grouped disclosures",
  component: "Accordion",
  group: "Navigation and layout",
  groupOrder: 40,
  description:
    "Sections that open and close. Single mode keeps one open; multiple mode lets several stay open. Each section reuses Disclosure.",
  covers: ["Accordion single", "Accordion multiple", "Disclosure composition"],
  render: () => {
    const section = signal<string>("general");
    return (
      <Stack>
        <Accordion
          id="settings"
          label="Settings sections"
          value={section}
          onValueChange={(next) => {
            section.value = typeof next === "string" ? next : (next[0] ?? "");
          }}
          items={[
            {
              id: "general",
              summary: "General",
              content: (
                <p>Language and appearance stay with the host. This section only expands.</p>
              ),
            },
            {
              id: "privacy",
              summary: "Privacy",
              content: <p>Whether a log is kept is a host fact, not a library setting.</p>,
            },
            {
              id: "advanced",
              summary: "Advanced",
              content: (
                <p>Developer options belong on their own page when they grow past a few lines.</p>
              ),
            },
          ]}
        />
        <Accordion
          type="multiple"
          label="Release notes"
          defaultValue={["added"]}
          items={[
            {
              id: "added",
              summary: "Added in this batch",
              content: (
                <p>Progress, Avatar, Link, Table, Slider, NumberInput, Accordion, and menus.</p>
              ),
            },
            {
              id: "unchanged",
              summary: "Left as they were",
              content: (
                <p>
                  ChatMessage still takes any avatar child. ResourceLink stays the whole-row
                  control.
                </p>
              ),
            },
          ]}
        />
      </Stack>
    );
  },
});
