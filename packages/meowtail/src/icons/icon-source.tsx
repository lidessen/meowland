import { h, type Child } from "meowjsx";
import { IconFrame } from "./icon-frame";

/**
 * Trusted structural icon data: ordered [tag, attributes] SVG pairs.
 * The shape matches Lucide icon nodes and other plain SVG node data; never pass
 * untrusted JSON or user-generated markup through this entry point.
 */
export type IconNode = ReadonlyArray<
  readonly [tag: string, attrs: Readonly<Record<string, string | number | undefined>>]
>;

export interface IconSourceProps {
  /** Icon node data supplied by the caller from its own trusted icon source. */
  source: IconNode;
  size?: number;
  className?: string;
  /** Omit for decorative icons. Icon-only controls should label the control itself. */
  label?: string;
}

/** Render caller-supplied icon data through the shared functional-icon frame. */
export function IconSource({ source, size, className, label }: IconSourceProps): Child {
  return (
    <IconFrame size={size} className={className} label={label}>
      {source.map(([tag, attrs]) => h(tag, attrs))}
    </IconFrame>
  );
}
