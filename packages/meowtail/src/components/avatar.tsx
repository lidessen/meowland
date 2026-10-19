import { defineOptions } from "meowcss";
import { defineStyleProps, type StyledComponentContract, type ThemedProps } from "meowcss/meowjsx";
import { defineComponent, type Props } from "meowjsx";

export const avatarOptions = defineOptions("avatar", {
  size: ["small", "default", "large"],
});

export const avatarContract = {
  name: "avatar",
  parts: ["root", "image", "initials"],
  styleProps: defineStyleProps(avatarOptions, { defaults: { size: "default" } }),
} as const satisfies StyledComponentContract;

export interface AvatarProps extends Props, ThemedProps<typeof avatarOptions> {
  /** Used for initials and the accessible name. */
  name: string;
  src?: string;
  alt?: string;
  className?: string;
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    const word = parts[0]!;
    const first = Array.from(word);
    return first.slice(0, 2).join("").toUpperCase();
  }
  const leading = Array.from(parts[0]!)[0];
  const next = Array.from(parts[1]!)[0];
  return `${leading ?? ""}${next ?? ""}`.toUpperCase() || "?";
}

/** A face or the initials that remain when the image is missing. */
export const Avatar = defineComponent<
  AvatarProps,
  typeof avatarContract.name,
  (typeof avatarContract.parts)[number]
>(avatarContract, ({ name, src, alt, className, ...props }, context) => {
  const failed = context.signal(false);
  return context.part(
    "root",
    "span",
    {
      ...props,
      className,
      role: "img",
      "aria-label": name,
    },
    context.part("initials", "span", { "aria-hidden": "true" }, initialsFromName(name)),
    src
      ? context.part("image", "img", {
          src,
          alt: alt ?? "",
          hidden: failed,
          referrerPolicy: "no-referrer",
          onError: () => {
            failed.value = true;
          },
        })
      : null,
  );
});
