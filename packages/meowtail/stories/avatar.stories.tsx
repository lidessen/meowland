import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Avatar, Inline, Stack } from "meowtail";

const portrait =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect fill="#4b6ea6" width="32" height="32"/><circle cx="16" cy="12" r="6" fill="#eef2f8"/><ellipse cx="16" cy="28" rx="10" ry="8" fill="#eef2f8"/></svg>`,
  );

export const AvatarStory = defineStory({
  id: "avatar",
  title: "Avatar · Image and initials",
  component: "Avatar",
  group: "Basic controls",
  groupOrder: 10,
  description:
    "A person's picture, or the initials that remain when the image is missing. ChatMessage still takes any avatar child in its identity column rather than requiring this control.",
  covers: ["Avatar image", "Avatar initials", "Avatar sizes", "image fallback"],
  render: () => (
    <Stack align="start">
      <Inline gap="compact" align="center">
        <Avatar name="Ada Lovelace" src={portrait} />
        <Avatar name="Ada Lovelace" />
        <Avatar name="Grace Hopper" />
      </Inline>
      <Inline gap="compact" align="center">
        <Avatar name="Ada Lovelace" size="small" />
        <Avatar name="Ada Lovelace" />
        <Avatar name="Ada Lovelace" size="large" />
      </Inline>
    </Stack>
  ),
});
