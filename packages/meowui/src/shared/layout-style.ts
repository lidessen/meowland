/** Host decoration survives; the component's structural contract takes precedence. */
export function layoutStyle(style: unknown, structure: Record<string, string | number>) {
  if (typeof style === "string") {
    const declarations = Object.entries(structure)
      .map(
        ([name, value]) =>
          name.replace(/[A-Z]/g, (letter) => "-" + letter.toLowerCase()) + ":" + value,
      )
      .join(";");
    return style + ";" + declarations;
  }
  return {
    ...(style && typeof style === "object" && !Array.isArray(style) ? style : {}),
    ...structure,
  };
}
