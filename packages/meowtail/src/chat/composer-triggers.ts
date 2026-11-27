import type { Child } from "meowjsx";
import type { MaybeSignal } from "meowjsx/signal";

/** One entry in a trigger's suggestion list. */
export interface ComposerSuggestion {
  /** Stable identity, unique in one list. */
  id: string;
  label: string;
  description?: string;
  /** A decorative mark before the label, such as a state dot or a type icon. */
  leading?: Child;
  /** A short fact after the label, such as an id or a shortcut. */
  meta?: string;
  /**
   * Text that replaces the trigger character and query. Default: the character followed by `id`.
   * `""` removes the trigger text, which is how a command that acts leaves the draft clean.
   */
  insert?: string;
  /**
   * Add one space after a non-empty insert unless whitespace already follows. Default true; false
   * keeps the list open on the inserted text, so a path can be drilled into.
   */
  trailingSpace?: boolean;
  disabled?: boolean;
}

export interface ComposerSuggestContext {
  /** Aborted when the query changes or the list closes before the lookup settles. */
  signal: AbortSignal;
}

/** A character that opens host suggestions while the reader writes: `@` mentions, `/` commands. */
export interface ComposerTrigger {
  /** One character, unique within one composer. */
  char: string;
  /**
   * `anywhere`: the word under the caret starts with the character. `start`: and only whitespace
   * precedes that word in the whole draft, as for commands.
   */
  position?: "anywhere" | "start";
  /** Accessible name of the suggestion list, such as "Tasks" or "Commands". */
  label: string;
  /**
   * Host-filtered suggestions for the text typed after the character; the composer never filters.
   * A synchronous call runs inside an effect, so Signals it reads keep an open list current.
   */
  suggest: (
    query: string,
    context: ComposerSuggestContext,
  ) => readonly ComposerSuggestion[] | PromiseLike<readonly ComposerSuggestion[]>;
  /** Shown when a finished lookup returns nothing. Omitted: the list stays closed. */
  emptyMessage?: string;
  /** Turns this trigger off, for example while a command runs. A Signal stays live. */
  disabled?: MaybeSignal<boolean>;
  /** Called after the composer has written the accepted suggestion into the text. */
  onAccept?: (suggestion: ComposerSuggestion) => void;
}

/** The trigger occurrence under the caret. */
export interface ComposerTriggerMatch {
  /** Index of the trigger character in the text. */
  index: number;
  char: string;
  query: string;
}

/** Longest query that still opens a list; longer words are prose, not a lookup. */
export const composerQueryLimit = 64;

/**
 * Finds the trigger occurrence for the word that ends at the caret: the word must start with a
 * declared character, and a `start` trigger also needs only whitespace before the word.
 */
export function findComposerTrigger(
  text: string,
  caret: number,
  triggers: readonly Pick<ComposerTrigger, "char" | "position">[],
): ComposerTriggerMatch | null {
  const before = text.slice(0, caret);
  const index = before.search(/\S*$/);
  const char = before[index];
  if (char === undefined) return null;
  const trigger = triggers.find((candidate) => candidate.char === char);
  if (!trigger) return null;
  if (trigger.position === "start" && before.slice(0, index).trim() !== "") return null;
  const query = before.slice(index + 1);
  if (query.length > composerQueryLimit) return null;
  return { index, char, query };
}

/** The text and caret after accepting a suggestion for a match. */
export function insertComposerSuggestion(
  text: string,
  match: ComposerTriggerMatch,
  suggestion: ComposerSuggestion,
): { text: string; caret: number } {
  const end = match.index + 1 + match.query.length;
  const insert = suggestion.insert ?? match.char + suggestion.id;
  const after = text.slice(end);
  const space =
    insert !== "" && suggestion.trailingSpace !== false && !/^\s/.test(after) ? " " : "";
  // Removing a command's text also drops the space that separated it from what followed.
  const rest = insert === "" ? after.replace(/^ /, "") : after;
  return {
    text: text.slice(0, match.index) + insert + space + rest,
    caret: match.index + insert.length + space.length,
  };
}
