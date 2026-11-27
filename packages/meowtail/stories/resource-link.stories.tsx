import { h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { ResourceLink } from "meowtail";
import { Note, Specimen, Specimens } from "./specimen";

export const ResourceLinkStory = defineStory({
  id: "resource-link",
  title: "Resource Link · References and actions",
  component: "ResourceLink",
  group: "Records and surfaces",
  groupOrder: 60,
  description:
    "A resource can link to a destination or invoke an in-page action supplied by the host.",
  covers: ["ResourceLink", "anchor", "button", "detail", "trailing"],
  render: () => {
    const feedback = signal("No resource opened.");
    return (
      <Specimens>
        <Specimen label="Document" width="content">
          <ResourceLink href="#guide" title="Component guide" detail="docs/guide · Revision 2" />
        </Specimen>
        <Specimen label="In-page action" width="content">
          <ResourceLink
            title="Open the local preview of a longer resource name that may wrap in a narrow space"
            detail="Preview · Available locally"
            trailing="Open"
            onClick={() => {
              feedback.value = "Opened the local preview.";
            }}
          />
          <Note role="status">{feedback}</Note>
        </Specimen>
      </Specimens>
    );
  },
});
