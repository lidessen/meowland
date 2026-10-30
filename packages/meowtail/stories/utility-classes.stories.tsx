import { h } from "meowjsx";
import { mapSignal, signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { cx } from "meowcss";
import { Button, Stack, Text } from "meowtail";
import { ui } from "meowtail/theme";
import { Specimen, Specimens } from "./specimen";

export const UtilityClassesStory = defineStory({
  id: "utility-classes",
  title: "Theme Utilities · Values and composition",
  group: "Icons and theme",
  groupOrder: 100,
  component: "Theme utilities",
  variant: "Class values and component defaults",
  description:
    "Shows reusable theme class values through class arrays and cx alongside Button defaults and an instance variant override.",
  covers: [
    "class value arrays",
    "cx composition",
    "theme utilities",
    "component defaults",
    "instance overrides",
  ],
  render() {
    const active = signal(false);
    const reusable = cx(ui.p.group, ui.radius.lg, ui.color.primary, ui.interactive.flatShadow);
    const activeClasses = mapSignal(active, (selected) =>
      cx(reusable, selected ? ui.bg.raised : ui.bg.fill),
    );

    return (
      <Specimens>
        <Specimen
          label="Theme values as class arrays"
          note="Button keeps its default primary variant."
        >
          <Stack gap="compact" align="start">
            <Button
              data-utility-classes-array
              className={[
                ui.p.group,
                ui.bg.fill,
                ui.color.primary,
                ui.radius.lg,
                ui.interactive.flatShadow,
              ]}
            >
              Default primary button
            </Button>
            <Text>Spacing, surface, and radius values share one class list.</Text>
          </Stack>
        </Specimen>

        <Specimen
          label="Reusable cx composition"
          note="Toggle the state, then compare the outlined instance."
        >
          <Stack gap="compact" align="start">
            <Button
              data-utility-classes-cx
              data-utility-classes-active={active}
              aria-pressed={mapSignal(active, String)}
              className={activeClasses}
              onClick={() => {
                active.value = !active.value;
              }}
            >
              Toggle utility state
            </Button>
            <Button variant="outline" className={cx(ui.p.group, ui.bg.fill, ui.radius.lg)}>
              Outline variant override
            </Button>
          </Stack>
        </Specimen>
      </Specimens>
    );
  },
});
