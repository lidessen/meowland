import { h, signal } from "meowjsx";
import { defineStory } from "meowbook";
import { ActionRow, Button, Grid, MermaidDiagram } from "meowtail";
import { Specimen, Specimens } from "./specimen";

const release = `flowchart LR
  subgraph Draft
    A[Write the change] --> B{Checks pass?}
  end
  B -- yes --> C[Request review]
  B -- no --> A
  C --> D([Publish])`;

const review = `sequenceDiagram
  participant Author
  participant Reviewer
  participant CI
  Author->>CI: Push the branch
  CI-->>Author: Checks pass
  Author->>Reviewer: Request review
  Reviewer-->>Author: Approve`;

const usage = `pie title Where review time goes
  "Reading the diff" : 42
  "Running it locally" : 26
  "Writing comments" : 18
  "Waiting on checks" : 14`;

const weekly = `xychart-beta
  title "Reviews per week"
  x-axis [W1, W2, W3, W4, W5, W6]
  y-axis "Reviews" 0 --> 40
  bar [12, 18, 22, 19, 30, 34]
  line [10, 15, 20, 22, 27, 31]`;

const lifecycle = `stateDiagram-v2
  [*] --> Draft
  Draft --> Review: submit
  Review --> Draft: changes requested
  Review --> Published: approve
  Published --> [*]`;

export const MermaidDiagramStory = defineStory({
  id: "mermaid-diagram",
  title: "Mermaid diagram · Flow, sequence, chart and state",
  component: "MermaidDiagram",
  group: "Content",
  variant: "Diagram types on the library theme",
  description:
    "Mermaid source drawn as SVG by Pele on the library's roles: shapes lifted on the overlay rung with a hairline, groups a step below, connectors in tertiary ink, emphasis in the accent and charts in the shared series order. Switch the appearance to see the same diagrams in dark.",
  covers: [
    "MermaidDiagram",
    "title",
    "caption",
    "flowchart",
    "sequence",
    "pie",
    "xychart",
    "state",
    "live source",
    "limits",
    "error",
  ],
  render: () => {
    const steps = signal("flowchart TB\n  A[Draft] --> B[Review]");
    return (
      <Specimens>
        <Specimen label="Flowchart" width="content">
          <MermaidDiagram
            data-diagram="flowchart"
            title="Release flow"
            caption="From draft to publish"
            source={release}
          />
        </Specimen>
        <Grid columns={2} gap="relaxed">
          <Specimen label="Sequence">
            <MermaidDiagram data-diagram="sequence" title="Review handshake" source={review} />
          </Specimen>
          <Specimen label="State">
            <MermaidDiagram data-diagram="state" title="Change lifecycle" source={lifecycle} />
          </Specimen>
        </Grid>
        <Grid columns={2} gap="relaxed">
          <Specimen label="Pie" note="Slices take the shared chart series in order.">
            <MermaidDiagram data-diagram="pie" source={usage} />
          </Specimen>
          <Specimen label="Bars and a line">
            <MermaidDiagram data-diagram="xychart" source={weekly} />
          </Specimen>
        </Grid>
        <Specimen label="Live source" note="A Signal source redraws in place." width="content">
          <MermaidDiagram data-diagram="live" title="Steps so far" source={steps} />
          <ActionRow>
            <Button
              variant="outline"
              data-diagram-add-step
              onClick={() => {
                steps.value = `${steps.value}\n  B --> C[Publish]`;
              }}
            >
              Add the publish step
            </Button>
          </ActionRow>
        </Specimen>
        <Specimen
          label="Over the size limit"
          note="limits.source is 40 characters here."
          width="content"
        >
          <MermaidDiagram data-diagram="limited" limits={{ source: 40 }} source={release} />
        </Specimen>
        <Specimen
          label="Source that cannot be drawn"
          note="The error and the source stay readable."
          width="content"
        >
          <MermaidDiagram data-diagram="invalid" title="Broken" source={"flowchart LR\n  A --> "} />
        </Specimen>
      </Specimens>
    );
  },
});
