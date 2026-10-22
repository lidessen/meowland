import { h, type Child } from "meowjsx";

/**
 * Local fixture: the same content in a light and a dark scope side by side. A nested scope
 * re-resolves every scheme token, so both panels are accurate regardless of the gallery's setting.
 */
export function SchemePair({
  children,
  width = 420,
}: {
  children: (scheme: "light" | "dark") => Child;
  width?: number;
}): Child {
  const panel = (scheme: "light" | "dark") => (
    <section
      data-meowui-scope=""
      data-meowui-color-scheme={scheme}
      aria-label={scheme === "light" ? "Light" : "Dark"}
      style={{
        flex: `1 1 ${width}px`,
        minWidth: "0",
        padding: "24px",
        borderRadius: "14px",
        border: "1px solid var(--ui-line-edge)",
        background: "var(--ui-surface-canvas)",
        color: "var(--ui-ink-primary)",
        display: "grid",
        gap: "16px",
        alignContent: "start",
      }}
    >
      <span
        style={{
          color: "var(--ui-ink-tertiary)",
          fontSize: "11px",
          fontWeight: "600",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {scheme === "light" ? "Light" : "Dark"}
      </span>
      {children(scheme)}
    </section>
  );
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "stretch" }}>
      {panel("light")}
      {panel("dark")}
    </div>
  );
}
