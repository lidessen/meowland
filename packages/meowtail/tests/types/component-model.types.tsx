/**
 * Typechecked copy of the canonical examples in packages/meowtail/AGENTS.md
 * (Component model, Styling). The component and style bodies match those examples.
 * This module merges them so one typecheck covers both, and it imports uiTokens from
 * this file's location. Teaching fixtures only: not registered, not exported from the package.
 */
import { h, type Child, type Context, type Props } from "meowjsx";
import { isSignal, mapSignal, signal, unwrap, type MaybeSignal } from "meowjsx/signal";
import { defineOptions } from "meowcss";
import { css, defineStyleProps, parts, type ThemedProps } from "meowcss/meowjsx";
import { uiTokens } from "../../src/theme/tokens";
import { ui } from "../../src/theme/utilities";

export interface ToggleProps extends Props {
  /** Controlled when provided; a Signal keeps it live. */
  pressed?: MaybeSignal<boolean>;
  defaultPressed?: boolean;
  disabled?: MaybeSignal<boolean>;
  onPressedChange?: (pressed: boolean) => void;
}

/** Setup runs once; only the bound Signals below change after mount. */
export function Toggle(
  {
    pressed,
    defaultPressed = false,
    disabled = false,
    onPressedChange,
    children,
    ref,
    ...props
  }: ToggleProps,
  context: Context<typeof Toggle>,
) {
  const local = signal(defaultPressed);
  // Presence decides the owner. false is a controlled value.
  const current = pressed !== undefined ? pressed : local;
  const ariaPressed = isSignal(current)
    ? mapSignal(current, (value) => String(value))
    : String(current);
  return (
    <button
      {...props}
      ref={[context.parts.root, ref]}
      type="button"
      aria-pressed={ariaPressed}
      disabled={disabled}
      onClick={() => {
        const next = !unwrap(current);
        if (pressed === undefined) local.value = next;
        onPressedChange?.(next);
      }}
    >
      {children}
    </button>
  );
}
Toggle.meta = { name: "toggle", parts: ["root"] } as const;

export const calloutOptions = defineOptions("callout", {
  tone: ["neutral", "accent"],
});

export interface CalloutProps extends Props, ThemedProps<typeof calloutOptions> {
  title: string;
}

/** Parts and options only. The look lives in calloutStyles. */
export function Callout(
  { title, children, ref, ...props }: CalloutProps,
  context: Context<typeof Callout>,
) {
  return (
    <aside {...props} ref={[context.parts.root, ref]}>
      <strong ref={context.parts.title}>{title}</strong>
      {children}
    </aside>
  );
}
Callout.meta = {
  name: "callout",
  parts: ["root", "title"],
  style: defineStyleProps(calloutOptions, { defaults: { tone: "neutral" } }),
} as const;

const calloutPartRefs = parts<typeof Callout>("callout");
export const calloutStyles = css`
  ${calloutPartRefs.root} {
    display: grid;
    gap: ${uiTokens.space.group};
    padding: ${uiTokens.space.group};
    ${ui.text.body}
    background: ${uiTokens.surface.fill};
    border-radius: ${uiTokens.radius.lg};
  }
  ${calloutPartRefs.title} {
    font-weight: ${uiTokens.type.weight.medium};
  }
  ${calloutPartRefs.root} {
    ${calloutOptions.when({ tone: "accent" })} {
      color: ${uiTokens.action.primary};
      background: ${uiTokens.action.soft};
    }
  }
`;

const pressed = signal(false);
const sample: Child = h(Toggle, { pressed, disabled: signal(true) }, "Bold");
const accent: JSX.Element = (
  <Callout title="Note" tone="accent">
    Body
  </Callout>
);
// @ts-expect-error tone is the callout option axis, not a free string.
const invalidTone: JSX.Element = <Callout title="Note" tone="loud" />;
void sample;
void accent;
void invalidTone;
void calloutStyles;
