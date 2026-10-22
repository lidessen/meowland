import {
  defineComponent,
  derived,
  h,
  unwrap,
  type ComponentContract,
  type MaybeSignal,
  type Props,
} from "meowjsx";
import { Icon } from "../icons/icon";
import { StatusDot } from "../components/status-dot";
import { TextShimmer } from "../components/text-shimmer";

export const chatReasoningContract = {
  name: "chat-reasoning",
  parts: ["root", "summary", "icon", "label", "body", "text"],
} as const satisfies ComponentContract;

export interface ChatReasoningProps extends Props {
  /** What the model is doing now, for example "Drafting the rollout policy". */
  label: MaybeSignal<string>;
  /** The summary once the work stops, for example "Thought for 12s"; the host measures it. */
  doneLabel?: MaybeSignal<string>;
  /** The reasoning text the host streams in; shown as plain text, never as markup. */
  text: MaybeSignal<string>;
  active?: MaybeSignal<boolean>;
  className?: string;
}

/**
 * A model's visible reasoning before it answers. While active it stays open and
 * shows the newest lines under a fading edge; when the host marks it inactive it
 * folds to one disclosure row like ChatProcess. Unrelated to the composer's
 * reasoning-effort picker (`reasoningOptions`), which chooses how much to reason.
 */
export const ChatReasoning = defineComponent<
  ChatReasoningProps,
  typeof chatReasoningContract.name,
  (typeof chatReasoningContract.parts)[number]
>(
  chatReasoningContract,
  ({ label, doneLabel, text, active = false, className, children, ...props }, context) => {
    void children;
    const isActive = derived(() => unwrap(active));
    return context.part(
      "root",
      "details",
      {
        ...props,
        className,
        // Opening follows the host's activity changes; the reader's toggles stand in between.
        open: isActive,
        "data-active": derived(() => String(isActive.value)),
        "aria-busy": derived(() => (isActive.value ? "true" : undefined)),
      },
      context.part(
        "summary",
        "summary",
        null,
        context.part(
          "icon",
          "span",
          { "aria-hidden": "true" },
          derived(() =>
            isActive.value ? h(StatusDot, { state: "processing" }) : <Icon name="chevron-right" />,
          ),
        ),
        context.part(
          "label",
          "span",
          null,
          h(TextShimmer, {
            text: derived(() =>
              isActive.value ? unwrap(label) : (unwrap(doneLabel) ?? unwrap(label)),
            ),
            active: isActive,
          }),
        ),
      ),
      context.part(
        "body",
        "div",
        null,
        // Blank lines separate paragraphs; single newlines stay inside one.
        derived(() =>
          unwrap(text)
            .split(/\n\s*\n/)
            .filter((paragraph) => paragraph.trim() !== "")
            .map((paragraph) => context.part("text", "p", null, paragraph)),
        ),
      ),
    );
  },
);
