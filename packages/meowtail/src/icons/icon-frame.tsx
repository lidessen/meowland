import { h, type Child } from "meowjsx";

/** Shared SVG frame for functional icons; the theme owns its optical stroke. */
export interface IconFrameProps {
  size?: number;
  className?: string;
  /** Omit for decorative icons. Icon-only controls should label the control itself. */
  label?: string;
  dataIcon?: string;
  children?: Child;
}

export function IconFrame({
  size = 18,
  className,
  label,
  dataIcon,
  children,
}: IconFrameProps): Child {
  return (
    <svg
      className={["meow-icon", className].filter(Boolean).join(" ")}
      data-icon={dataIcon}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden={label ? undefined : "true"}
      role={label ? "img" : undefined}
      aria-label={label}
      focusable="false"
    >
      {children}
    </svg>
  );
}
