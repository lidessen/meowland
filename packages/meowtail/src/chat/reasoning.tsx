import { h, type Context, type Props } from "meowjsx";
import { derived, unwrap, type MaybeSignal } from "meowjsx/signal";
import { Icon } from "../icons/icon";
import { TextShimmer } from "../components/text-shimmer";

export interface ChatReasoningProps extends Props {
  /** What the model is doing now, for example "Drafting the rollout policy". */
  label: MaybeSignal<string>;
  /** The summary once the work stops, for example "Thought for 12s"; the host measures it. */
  doneLabel?: MaybeSignal<string>;
  /** The reasoning text the host streams in; shown as plain text, never as markup. */
  text: MaybeSignal<string>;
  active?: MaybeSignal<boolean>;
}

/**
 * A model's visible reasoning before it answers. While active it stays open and
 * shows the newest lines under a fading edge; when the host marks it inactive it
 * folds to one disclosure row like ChatProcess. Unrelated to the composer's
 * reasoning-effort picker (`reasoningOptions`), which chooses how much to reason.
 */
export function ChatReasoning(
  { label, doneLabel, text, active = false, children, ref, ...props }: ChatReasoningProps,
  context: Context<typeof ChatReasoning>,
) {
  void children;
  const isActive = derived(() => unwrap(active));
  const icon = derived(() =>
    isActive.value ? (
      Array.from({ length: 9 }, () => <span data-reasoning-dot="true" />)
    ) : (
      <Icon name="chevron-right" />
    ),
  );
  const paragraphs = derived(() =>
    unwrap(text)
      .split(/\n\s*\n/)
      .filter((paragraph) => paragraph.trim() !== "")
      .map((paragraph) => <p ref={context.parts.text}>{paragraph}</p>),
  );
  return (
    <details
      {...props}
      open={isActive}
      data-active={derived(() => String(isActive.value))}
      aria-busy={derived(() => (isActive.value ? "true" : undefined))}
      ref={[context.parts.root, ref]}
    >
      <summary ref={context.parts.summary}>
        <span aria-hidden="true" ref={context.parts.icon}>
          {icon}
        </span>
        <span ref={context.parts.label}>
          <TextShimmer
            text={derived(() =>
              isActive.value ? unwrap(label) : (unwrap(doneLabel) ?? unwrap(label)),
            )}
            active={isActive}
          />
        </span>
      </summary>
      <div ref={context.parts.body}>{paragraphs}</div>
    </details>
  );
}
ChatReasoning.meta = {
  name: "chat-reasoning",
  parts: ["root", "summary", "icon", "label", "body", "text"],
} as const;
