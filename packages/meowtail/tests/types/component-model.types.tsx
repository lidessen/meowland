/**
 * Typechecked copy of the canonical examples in packages/meowtail/AGENTS.md
 * (Component model, Styling). The component and style bodies match those examples.
 * This module merges them so one typecheck covers both, and it imports uiTokens from
 * this file's location. Teaching fixtures only: not registered, not exported from the package.
 */
import {
  defineComponent,
  h,
  isSignal,
  mapSignal,
  signal,
  unwrap,
  type Child,
  type ComponentContract,
  type MaybeSignal,
  type Props,
} from "meowjsx";
import { defineOptions } from "meowcss";
import {
  css,
  defineStyleProps,
  partSelector,
  type StyledComponentContract,
  type ThemedProps,
} from "meowcss/meowjsx";
import { uiTokens } from "../../src/theme/tokens";

export const toggleContract = {
  name: "toggle",
  parts: ["root"],
} as const satisfies ComponentContract;

export interface ToggleProps extends Props {
  /** Controlled when provided; a Signal keeps it live. */
  pressed?: MaybeSignal<boolean>;
  defaultPressed?: boolean;
  disabled?: MaybeSignal<boolean>;
  onPressedChange?: (pressed: boolean) => void;
}

/** Setup runs once; only the bound Signals below change after mount. */
export const Toggle = defineComponent<ToggleProps, "toggle", "root">(
  toggleContract,
  (
    { pressed, defaultPressed = false, disabled = false, onPressedChange, children, ...props },
    context,
  ) => {
    const local = context.signal(defaultPressed);
    // Presence decides the owner. false is a controlled value.
    const current = pressed !== undefined ? pressed : local;
    const ariaPressed = isSignal(current)
      ? mapSignal(current, (value) => String(value))
      : String(current);
    return context.part(
      "root",
      "button",
      {
        ...props,
        type: "button",
        "aria-pressed": ariaPressed,
        disabled,
        onClick: () => {
          const next = !unwrap(current);
          if (pressed === undefined) local.value = next;
          onPressedChange?.(next);
        },
      },
      children,
    );
  },
);

export const calloutOptions = defineOptions("callout", {
  tone: ["neutral", "accent"],
});

export const calloutContract = {
  name: "callout",
  parts: ["root", "title"],
  styleProps: defineStyleProps(calloutOptions, {
    defaults: { tone: "neutral" },
  }),
} as const satisfies StyledComponentContract;

export interface CalloutProps extends Props, ThemedProps<typeof calloutOptions> {
  title: string;
}

/** Parts and options only. The look lives in calloutStyles. */
export const Callout = defineComponent<
  CalloutProps,
  typeof calloutContract.name,
  (typeof calloutContract.parts)[number]
>(calloutContract, ({ title, children, ...props }, context) =>
  context.part("root", "aside", props, context.part("title", "strong", null, title), children),
);

export const calloutStyles = css`
  ${partSelector(calloutContract, "root")} {
    display: grid;
    gap: ${uiTokens.space.group};
    padding: ${uiTokens.space.group};
    color: ${uiTokens.ink.primary};
    font: 400 ${uiTokens.type.body}/${uiTokens.type.leading} ${uiTokens.type.sans};
    background: ${uiTokens.surface.fill};
    border-radius: ${uiTokens.radius.lg};
  }
  ${partSelector(calloutContract, "title")} {
    font-weight: 500;
  }
  ${partSelector(calloutContract, "root")} {
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
