import { h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { Button, Menu, Stack } from "meowtail";

export const MenuNavigationStory = defineStory({
  id: "menu-navigation",
  title: "Menu · Keyboard exit from a form",
  component: "Menu",
  render() {
    const selected = signal(0);
    const submitted = signal(0);
    const controlled = signal(false);
    const retained = signal(false);
    return (
      <form
        onSubmit={(event: Event) => {
          event.preventDefault();
          submitted.value++;
        }}
      >
        <Stack align="start">
          <Button>Before menu</Button>
          <Menu
            id="navigation-menu"
            trigger={(bindings) => <Button {...bindings}>Actions</Button>}
            items={[
              {
                id: "remove",
                label: "Remove item",
                onSelect: () => selected.value++,
              },
              {
                id: "formats",
                label: "Export format",
                children: [{ id: "text", label: "Plain text", onSelect: () => selected.value++ }],
              },
            ]}
          />
          <Button>After menu</Button>
          <Button>Before controlled menu</Button>
          <Menu
            id="controlled-navigation-menu"
            open={controlled}
            onOpenChange={(next) => {
              controlled.value = next;
            }}
            trigger={(bindings) => <Button {...bindings}>Controlled actions</Button>}
            items={[
              { id: "controlled", label: "Controlled action", onSelect: () => selected.value++ },
            ]}
          />
          <Button>After controlled menu</Button>
          <Menu
            id="retained-menu"
            open={retained}
            onOpenChange={(next) => {
              if (next) retained.value = true;
            }}
            trigger={(bindings) => <Button {...bindings}>Retained actions</Button>}
            items={[{ id: "retained", label: "Retained action", onSelect: () => selected.value++ }]}
          />
          <Button type="submit">Submit form</Button>
          <output aria-label="Menu action count">{selected}</output>
          <output aria-label="Form submit count">{submitted}</output>
        </Stack>
      </form>
    );
  },
});
