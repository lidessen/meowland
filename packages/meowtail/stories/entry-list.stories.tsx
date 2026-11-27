import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Entry, EntryList } from "meowtail";
import { Specimen, Specimens } from "./specimen";

export const EntryListStory = defineStory({
  id: "entry-list",
  title: "Entry List · Linked document summaries",
  component: "EntryList",
  group: "Records and surfaces",
  groupOrder: 60,
  description:
    "Entries collect document summaries on the surrounding surface, with optional links and facts.",
  covers: ["EntryList", "Entry", "linked title", "description", "metadata"],
  render: () => (
    <Specimens>
      <Specimen label="Release notes" width="content">
        <EntryList>
          <Entry
            title="A clearer reading experience"
            href="#reading"
            eyebrow="November 2026"
            description="A longer introduction explains how the new reading layout keeps navigation and content together across different screen sizes."
            meta="Release notes · 4 min read"
          />
          <Entry
            title="Small improvements"
            href="#improvements"
            eyebrow="October 2026"
            description="Updates to keyboard navigation and status messages."
            meta="2 min read"
          />
          <Entry title="Upcoming notes" description="A summary without a destination yet." />
        </EntryList>
      </Specimen>
      <Specimen label="Empty list">
        <EntryList aria-label="No release notes" />
      </Specimen>
    </Specimens>
  ),
});
