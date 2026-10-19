import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Link, ResourceLink, Stack } from "meowtail";

export const LinkStory = defineStory({
  id: "text-link",
  title: "Link · Inline text",
  component: "Link",
  group: "Basic controls",
  groupOrder: 10,
  description:
    "A themed inline text link inside a sentence. ResourceLink remains the whole-row reference to an openable object.",
  covers: ["Link href", "inline text", "distinct from ResourceLink"],
  render: () => (
    <Stack align="start">
      <p>
        Open the{" "}
        <Link href="https://github.com/lidessen/meowland" target="_blank" rel="noreferrer">
          Meowland repository
        </Link>{" "}
        for the library source.
      </p>
      <ResourceLink
        href="https://github.com/lidessen/meowland"
        title="Meowland repository"
        detail="Whole-row reference, not an inline link"
      />
    </Stack>
  ),
});
