import { h, type Props, type Context } from "meowjsx";
import { layoutStyle } from "../shared/layout-style";

export interface AspectRatioProps extends Props {
  ratio?: number;
  className?: Props["className"];
}
/**
 * Keeps its content at a fixed width-to-height ratio. The ratio is layout, not a theme surface.
 * Children choose their own media fitting.
 */
export function AspectRatio(
  { ratio = 16 / 9, children, className, style, ...props }: AspectRatioProps,
  context: Context<typeof AspectRatio>,
) {
  if (!Number.isFinite(ratio) || ratio <= 0)
    throw new Error("AspectRatio requires a finite positive ratio");
  return (
    <div
      {...props}
      className={className}
      style={layoutStyle(style, {
        aspectRatio: String(ratio),
        minWidth: "0",
      })}
      ref={[context.parts.root, props.ref]}
    >
      {children}
    </div>
  );
}
AspectRatio.meta = { name: "aspect-ratio", parts: ["root"] } as const;
