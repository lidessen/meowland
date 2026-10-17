import { defineComponent, type Props } from "meowjsx";
import { defineOptions } from "meowcss";
import { defineStyleProps, type StyledComponentContract, type ThemedProps } from "meowcss/meowjsx";

export const statusDotOptions = defineOptions("status-dot", {
  /**
   * processing: accent pulse, happening now. success: connected/enabled/complete (solid).
   * returned: hollow success, an execution came back but the goal is not confirmed complete.
   * warning: waiting for you. danger: failed or unreadable. unknown: hollow, not verified.
   * idle: a known, quiet standby (solid gray), distinct from an unverified state.
   */
  state: ["processing", "success", "returned", "warning", "danger", "unknown", "idle"],
});

export const statusDotContract = {
  name: "status-dot",
  parts: ["root"],
  styleProps: defineStyleProps(statusDotOptions, { defaults: { state: "unknown" } }),
} as const satisfies StyledComponentContract;

export type StatusDotState = (typeof statusDotOptions.axes.state)[number];

export interface StatusDotProps extends Props, ThemedProps<typeof statusDotOptions> {
  /** Diameter in px; the state shape is drawn inside it. */
  size?: number;
  /** A soft ring behind the dot, for the one status that leads a surface (header, connection). */
  halo?: boolean;
  className?: string;
}

/** Decorative marker; the owner supplies adjacent text, so it is hidden from assistive tech. */
export const StatusDot = defineComponent<
  StatusDotProps,
  typeof statusDotContract.name,
  (typeof statusDotContract.parts)[number]
>(statusDotContract, ({ size = 8, halo = false, className, style, ...props }, context) =>
  context.part("root", "span", {
    ...props,
    className,
    "aria-hidden": "true",
    "data-halo": halo ? "true" : undefined,
    style: { ...(typeof style === "object" ? style : null), "--status-dot-size": `${size}px` },
  }),
);
