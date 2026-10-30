import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Avatar, Inline } from "meowtail";
import { Specimen, Specimens } from "./specimen";

const portrait =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fde2c8"/><stop offset="1" stop-color="#f4b8a8"/></linearGradient></defs><rect fill="url(#b)" width="32" height="32"/><circle cx="16" cy="13" r="5.5" fill="#ffffff" fill-opacity="0.85"/><path d="M5 32c1.5-6.5 6-10 11-10s9.5 3.5 11 10Z" fill="#ffffff" fill-opacity="0.85"/></svg>`,
  );

export const AvatarStory = defineStory({
  id: "avatar",
  title: "Avatar · Image and initials",
  group: "Content and inspection",
  groupOrder: 70,
  component: "Avatar",
  description:
    "A person's picture, or the initials that remain when the image is missing. ChatMessage still takes any avatar child in its identity column rather than requiring this control.",
  covers: ["Avatar image", "Avatar initials", "Avatar sizes", "image fallback"],
  render: () => (
    <Specimens>
      <Specimen label="Image and initials" note="Initials remain when no picture is given.">
        <Inline gap="compact" align="center">
          <Avatar name="Ada Lovelace" src={portrait} />
          <Avatar name="Ada Lovelace" />
          <Avatar name="Grace Hopper" />
        </Inline>
      </Specimen>
      <Specimen label="Sizes" note="Small, default and large.">
        <Inline gap="compact" align="center">
          <Avatar name="Ada Lovelace" size="small" />
          <Avatar name="Ada Lovelace" />
          <Avatar name="Ada Lovelace" size="large" />
        </Inline>
      </Specimen>
    </Specimens>
  ),
});
