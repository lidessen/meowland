import { h } from "meowjsx/runtime";
import { defineStory } from "meowbook";
import { Card, Grid, Item, ListGroup, Stack, Stat, Status } from "meowtail";
import { Measure, Specimen, Specimens } from "./specimen";

export const StatStory = defineStory({
  id: "stat-summary",
  title: "Stat · Summary figures",
  group: "Records and surfaces",
  groupOrder: 60,
  component: "Stat",
  variant: "Figures, unknown values and linked records",
  description:
    "A summary strip of figures above the records they count. The figure is the largest text and stays uncolored; state goes in a Status, and an unreadable value says unknown.",
  render: () => (
    <Measure>
      <Specimens>
        <Specimen label="Summary strip" note="Each card links to the records it counts.">
          <Grid columns={4}>
            <Card>
              <Stat href="#runs" label="Active runs" value="2" detail="1 waiting on review" />
            </Card>
            <Card>
              <Stat href="#tasks" label="Open tasks" value="14" detail="Across 3 projects" />
            </Card>
            <Card>
              <Stat
                label="Daemon"
                value="3h 12m"
                detail={<Status state="success" label="Running" />}
              />
            </Card>
            <Card>
              <Stat label="Goals needing attention" value="unknown" detail="Board unavailable" />
            </Card>
          </Grid>
        </Specimen>
        <Specimen
          label="Linked rows"
          note="Item with href is a link; the selected row is the current page."
        >
          <ListGroup>
            <Stack gap="none">
              <Item
                href="#t-101"
                selected
                title="Redesign the task workbench"
                description="t-101 · in progress"
                trailing="3m"
              />
              <Item
                href="#t-102"
                title="Audit dark contrast"
                description="t-102 · pending"
                trailing="40m"
              />
            </Stack>
          </ListGroup>
        </Specimen>
      </Specimens>
    </Measure>
  ),
});
