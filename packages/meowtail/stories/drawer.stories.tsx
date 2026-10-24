import { h, signal } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Button,
  Drawer,
  DialogHeader,
  Icon,
  IconButton,
  NavItem,
  Stack,
  StatusDot,
  Tag,
} from "meowtail";

export const InitiallyOpenDrawerStory = defineStory({
  id: "drawer-initially-open",
  title: "Drawer · Initially open",
  group: "Navigation and layout",
  groupOrder: 34,
  component: "Drawer",
  variant: "Controlled initial state",
  description: "An initially open drawer enters the native modal layer after mounting.",
  covers: ["Initial open state", "Escape", "controlled reopen"],
  render() {
    const open = signal(true);
    return (
      <Stack align="start">
        <Button
          onClick={() => {
            open.value = true;
          }}
        >
          Reopen drawer
        </Button>
        <Drawer
          label="Initially open navigation"
          open={open}
          onOpenChange={(next) => {
            open.value = next;
          }}
          header={<DialogHeader title="Navigation" />}
        >
          <NavItem
            label="Current workspace"
            active
            onClick={() => {
              open.value = false;
            }}
          />
        </Drawer>
      </Stack>
    );
  },
});

export const DrawerStory = defineStory({
  id: "drawer",
  title: "Drawer · Narrow-screen navigation",
  group: "Navigation and layout",
  groupOrder: 34,
  component: "Drawer",
  variant: "Fixed header and independent reading",
  description:
    "The title and close button share a fixed region; the body scrolls independently. After choosing a destination, pressing Escape, or closing via the scrim, focus returns to the trigger button.",
  covers: ["Drawer header", "body scroll", "Escape", "scrim click", "focus return"],
  render() {
    const open = signal(false);
    return (
      <Stack align="start">
        <Button
          variant="outline"
          onClick={() => {
            open.value = true;
          }}
        >
          <Icon name="menu" />
          Open navigation drawer
        </Button>
        <Drawer
          label="Main navigation"
          open={open}
          onOpenChange={(next) => {
            open.value = next;
          }}
          header={
            <DialogHeader
              title="Meowland"
              actions={
                <IconButton
                  label="Close navigation"
                  onClick={() => {
                    open.value = false;
                  }}
                >
                  <Icon name="x" />
                </IconButton>
              }
            />
          }
        >
          <Stack gap="compact">
            <NavItem
              label="Chat"
              icon={<Icon name="message-square" />}
              active
              onClick={() => {
                open.value = false;
              }}
            />
            <NavItem
              label="Memory and knowledge"
              icon={<Icon name="file-text" />}
              onClick={() => {
                open.value = false;
              }}
            />
            <NavItem
              label="Services"
              icon={<Icon name="network" />}
              onClick={() => {
                open.value = false;
              }}
            />
            <NavItem
              label="Messaging"
              icon={<Icon name="message-square" />}
              onClick={() => {
                open.value = false;
              }}
            />
            <NavItem
              label="Reminders"
              icon={<Icon name="list-checks" />}
              badge={
                <Tag kind="count" tone="warning">
                  1
                </Tag>
              }
              onClick={() => {
                open.value = false;
              }}
            />
            {Array.from({ length: 8 }, (_, i) => (
              <NavItem
                label={`Authorized sample extension ${i + 1}`}
                icon={<Icon name="file-text" />}
                onClick={() => {
                  open.value = false;
                }}
              />
            ))}
            <span>
              <StatusDot state="success" /> Runtime connected
            </span>
            <NavItem
              label="Settings"
              icon={<Icon name="settings" />}
              onClick={() => {
                open.value = false;
              }}
            />
          </Stack>
        </Drawer>
      </Stack>
    );
  },
});
