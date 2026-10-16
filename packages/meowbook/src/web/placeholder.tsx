import { h, type Child } from "meowjsx";

export function Placeholder({
  label,
  height = 120,
  width = "100%",
}: {
  label: string;
  height?: number;
  width?: number | string;
}): Child {
  return (
    <div
      data-meowbook-placeholder={label}
      role="img"
      aria-label={`${label} 占位`}
      style={{
        height: `${height}px`,
        width: typeof width === "number" ? `${width}px` : width,
      }}
    >
      {label} · placeholder
    </div>
  );
}
