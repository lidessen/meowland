import { h, type Child, type Props, type Context } from "meowjsx";
import { RailItem } from "./rail-item";

export interface RailSectionProps extends Props {
  /** Eyebrow shown while the rail is expanded, for example "Expanded". */
  label: string;
  /** While collapsed, the whole section is this one icon, pointing at `href`. */
  icon: Child;
  href: string;
  className?: Props["className"];
}

/**
 * A group of related destinations that folds into one shortcut icon when the rail is collapsed.
 * The shortcut shows the current location and the attention dot of whichever child has them.
 */
export function RailSection(
  { label, icon, href, className, children, ...props }: RailSectionProps,
  context: Context<typeof RailSection>,
) {
  return (
    <div
      {...props}
      className={className}
      role="group"
      aria-label={label}
      ref={[context.parts.root, props.ref]}
    >
      <span aria-hidden="true" ref={[context.parts.heading]}>
        {label}
      </span>
      <span ref={[context.parts.shortcut]}>
        <RailItem label={label} icon={icon} href={href} />
      </span>
      <div ref={[context.parts.items]}>{children}</div>
    </div>
  );
}
RailSection.meta = {
  name: "rail-section",
  parts: ["root", "heading", "items", "shortcut"],
} as const;
