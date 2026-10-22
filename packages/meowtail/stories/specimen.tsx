import { h, type Child } from "meowjsx";
import { Stack, Text } from "meowtail";
import { uiTokens } from "meowtail/theme";

/*
 * Story layout only. A story with more than one specimen labels each group the
 * same way: a small-caps eyebrow, an optional one-line note, then the specimen,
 * all on one start edge. Groups sit a panel step apart.
 */
export function Specimens(props: { children?: Child; className?: string }): Child {
  return (
    <Stack gap="relaxed" className={props.className} style={{ rowGap: "32px" }}>
      {props.children}
    </Stack>
  );
}

const widths = {
  narrow: String(uiTokens.layout.containerNarrow),
  content: String(uiTokens.layout.containerContent),
  fill: "none",
} as const;

export function Specimen(props: {
  label: Child;
  note?: Child;
  /** The widest the specimen may grow; it always starts at the group's edge. */
  width?: keyof typeof widths;
  /** Keep children at their natural width instead of stretching them. */
  align?: "start" | "stretch";
  children?: Child;
  [attribute: string]: unknown;
}): Child {
  const { label, note, width, align, children, ...rest } = props;
  return (
    <Stack {...rest} as="section" gap="compact" style={{ maxWidth: widths[width ?? "fill"] }}>
      <Stack gap="none">
        <Text as="p" variant="eyebrow">
          {label}
        </Text>
        {note ? <Text variant="caption">{note}</Text> : null}
      </Stack>
      <Stack gap="normal" align={align ?? "stretch"} style={{ paddingTop: "4px" }}>
        {children}
      </Stack>
    </Stack>
  );
}

/** A receipt or explanatory line under a specimen. */
export function Note(props: { children?: Child; [attribute: string]: unknown }): Child {
  const { children, ...rest } = props;
  return (
    <Text variant="caption" style={{ minHeight: "1.5em" }} {...rest}>
      {children}
    </Text>
  );
}

const measures = {
  narrow: String(uiTokens.layout.containerNarrow),
  content: String(uiTokens.layout.containerContent),
  wide: String(uiTokens.layout.containerWide),
  page: String(uiTokens.layout.containerWide),
} as const;

/**
 * The width a host would give a component, held on the canvas start edge.
 * Container centers a page column; a component specimen does not.
 */
export function Measure(props: {
  width?: keyof typeof measures;
  as?: "div" | "main" | "section";
  children?: Child;
  [attribute: string]: unknown;
}): Child {
  const { width, as, children, ...rest } = props;
  return h(
    as ?? "div",
    { ...rest, style: { width: "100%", minWidth: "0", maxWidth: measures[width ?? "content"] } },
    children,
  );
}
