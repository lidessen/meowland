import { defineStyleProps, type ThemedProps } from "meowcss/meowjsx";
import { type Props, type Context, h } from "meowjsx";

import { avatarOptions } from "./avatar.options";
export { avatarOptions } from "./avatar.options";

export interface AvatarProps extends Props, ThemedProps<typeof avatarOptions> {
  /** Used for initials and the accessible name. */
  name: string;
  src?: string;
  alt?: string;
  className?: Props["className"];
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
export function Avatar(
  { name, src, alt, className, ...props }: AvatarProps,
  context: Context<typeof Avatar>,
) {
  const failed = context.signal(false);
  return (
    <span
      {...props}
      className={className}
      role="img"
      aria-label={name}
      ref={[context.parts.root, props.ref]}
    >
      <span aria-hidden="true" ref={[context.parts.initials]}>
        {initialsFromName(name)}
      </span>
      {src ? (
        <img
          src={src}
          alt={alt ?? ""}
          hidden={failed}
          referrerPolicy="no-referrer"
          onError={() => {
            failed.value = true;
          }}
          ref={[context.parts.image]}
        />
      ) : null}
    </span>
  );
}
Avatar.meta = {
  name: "avatar",
  parts: ["root", "image", "initials"],
  style: defineStyleProps(avatarOptions, { defaults: { size: "default" } }),
} as const;
