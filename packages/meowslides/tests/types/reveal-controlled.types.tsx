import { h } from "meowjsx";
import { mapSignal, signal } from "meowjsx/signal";
import { Reveal as RootReveal, type RevealProps as RootRevealProps } from "meowslides";
import { Reveal, type RevealProps } from "meowslides";

const shown = signal(false);
const observed = mapSignal(shown, (value) => value);
const controlled: RevealProps = { when: observed, transition: "fade" };
const rootControlled: RootRevealProps = controlled;
const step: RevealProps = { at: 0 };
export const validReveals = [
  <Reveal {...controlled}>Observed state</Reveal>,
  <RootReveal {...rootControlled}>Root export</RootReveal>,
  <Reveal when={false}>Initially concealed</Reveal>,
  <Reveal {...step}>Step zero</Reveal>,
];
// @ts-expect-error A Reveal has one source of visibility.
export const conflicting: RevealProps = { at: 1, when: shown };
// @ts-expect-error A visibility source is required.
export const missing: RevealProps = {};
// @ts-expect-error The controlled condition is boolean, not a numeric step.
export const invalidWhen: RevealProps = { when: 1 };
// @ts-expect-error JSX keeps the same exclusive visibility contract.
export const conflictingJSX = <Reveal at={1} when={false} />;
