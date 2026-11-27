import { h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { Button, ListGroup, ListRow } from "meowtail";
import { Specimen, Specimens } from "./specimen";

export const ListGroupStory = defineStory({
  id: "list-group",
  title: "List Group · Records and details",
  component: "ListGroup",
  group: "Records and surfaces",
  groupOrder: 60,
  description: "Rows share a boundary while the host controls their actions and expanded details.",
  covers: ["ListGroup", "ListRow", "status", "actions", "expanded"],
  render: () => {
    const expanded = signal(false);
    return (
      <Specimens>
        <Specimen label="Connections" width="content">
          <ListGroup>
            <ListRow
              title="Primary connection"
              tags="Default"
              description="Used for new requests."
              status="Ready"
              tone="accent"
            />
            <ListRow
              title="Backup connection"
              description="Available when the primary connection is unavailable."
              status="Standby"
              expanded={expanded}
              actions={
                <Button
                  size="small"
                  variant="quiet"
                  onClick={() => {
                    expanded.value = !expanded.value;
                  }}
                >
                  Toggle details
                </Button>
              }
            >
              Requests use this connection only when selected by the host.
            </ListRow>
          </ListGroup>
        </Specimen>
        <Specimen label="Empty group">
          <ListGroup aria-label="No connections" />
        </Specimen>
      </Specimens>
    );
  },
});
