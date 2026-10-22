import { h, signal } from "meowjsx";
import { defineStory } from "meowbook";
import { AddButton, Button, Icon, IconButton } from "meowtail";
import { Note, Specimen } from "./specimen";

export const ActionMatrixStory = defineStory({
  id: "actions-matrix",
  title: "Actions · Sizes, levels and unavailable states",
  group: "Basic controls",
  groupOrder: 10,
  component: "Button",
  variant: "Sizes and levels",
  description:
    "The same action across three sizes and six levels: primary (black and white), secondary, quiet, accent soft fill (about current activity), stop (interrupting running work) and confirming a dangerous action. Buttons can be triggered from the keyboard; disabled controls skip Tab and produce no receipt.",
  covers: [
    "Button all variant × size",
    "disabled",
    "IconButton all size",
    "AddButton default/custom",
    "keyboard activation",
  ],
  render() {
    const feedback = signal("Choose an action; the receipt here only happens locally.");
    const actions = [
      ["primary", "Save changes"],
      ["outline", "View diff"],
      ["quiet", "Handle later"],
      ["danger", "Discard draft"],
      ["accent", "View progress"],
      ["stop", "Stop processing"],
    ] as const;
    return (
      <div className="workshop-stack workshop-constrained">
        {(["small", "default", "large"] as const).map((size) => (
          <Specimen
            label={
              { small: "Compact toolbar", default: "Regular actions", large: "Priority actions" }[
                size
              ]
            }
            align="start"
          >
            <div className="workshop-foundation-action-grid">
              {actions.map(([variant, label]) => (
                <Button
                  size={size}
                  variant={variant}
                  onClick={() => {
                    feedback.value = `Selected: ${label} (${size})`;
                  }}
                >
                  {label}
                </Button>
              ))}
              <IconButton
                size={size}
                label={`${size} search`}
                onClick={() => {
                  feedback.value = `Selected search (${size})`;
                }}
              >
                <Icon name="search" />
              </IconButton>
            </div>
            <div className="workshop-foundation-action-grid">
              {actions.map(([variant, label]) => (
                <Button size={size} variant={variant} disabled>
                  {label}
                </Button>
              ))}
              <IconButton size={size} label={`${size} search unavailable`} disabled>
                <Icon name="search" />
              </IconButton>
            </div>
          </Specimen>
        ))}
        <Specimen label="Add entries" align="start">
          <div className="workshop-row">
            <AddButton
              onClick={() => {
                feedback.value = "Selected add";
              }}
            />
            <AddButton
              variant="outline"
              size="small"
              onClick={() => {
                feedback.value = "Selected add attachment";
              }}
            >
              Add attachment
            </AddButton>
            <AddButton variant="quiet" size="large" disabled>
              Add after the work completes
            </AddButton>
          </div>
        </Specimen>
        <Note role="status">{feedback}</Note>
      </div>
    );
  },
});
