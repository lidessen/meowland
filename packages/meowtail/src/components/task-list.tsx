import { h, keyed, type Child, type Context, type Props } from "meowjsx";
import { derived, unwrap, type MaybeSignal } from "meowjsx/signal";
import { Icon } from "../icons/icon";
import { executionStateLabel, type ChatExecutionState } from "../shared/execution-state";
import { Badge } from "./badge";
import { TextShimmer } from "./text-shimmer";

/** Explicit host progress for the step that is running. */
export interface TaskListProgress {
  value: number;
  max: number;
}

export interface TaskListEntry {
  /** Stable identity; rows keep their DOM while the state moves on. */
  id: string;
  label: string;
  state: ChatExecutionState;
  progress?: TaskListProgress;
}

export interface TaskListProps extends Props {
  title?: MaybeSignal<string>;
  items: MaybeSignal<readonly TaskListEntry[]>;
  /** Expanded on mount; native details owns expansion afterwards. */
  defaultOpen?: boolean;
  className?: Props["className"];
}

const isDone = (state: ChatExecutionState) => state === "success" || state === "complete";

function checkedProgress(value: TaskListProgress | undefined): number | undefined {
  if (value === undefined) return undefined;
  if (
    !Number.isFinite(value.value) ||
    !Number.isFinite(value.max) ||
    value.max <= 0 ||
    value.value < 0 ||
    value.value > value.max
  ) {
    throw new RangeError(
      "TaskList progress requires finite values with 0 <= value <= max and max > 0.",
    );
  }
  return Math.round((value.value / value.max) * 100);
}

/** The state the header ring shows: running work first, then failures, then completion. */
function aggregateState(items: readonly TaskListEntry[]): ChatExecutionState {
  if (items.some((item) => item.state === "running")) return "running";
  if (items.some((item) => item.state === "error")) return "error";
  if (items.some((item) => item.state === "waiting")) return "waiting";
  if (items.length > 0 && items.every((item) => isDone(item.state) || item.state === "cancelled"))
    return "success";
  return "queued";
}

/**
 * An ordered plan of host-reported steps that an agent works through. It is not
 * executable and not a ChatTask record: the host owns every state, and the list
 * only shows them. Markers, strikethrough and the shimmer are visual; each row
 * also carries its state as text for assistive technology.
 */
export function TaskList(
  { title = "Tasks", items, defaultOpen = true, className, children, ref, ...props }: TaskListProps,
  context: Context<typeof TaskList>,
) {
  void children;
  const entries = derived(() => unwrap(items));
  const done = derived(() => entries.value.filter((item) => isDone(item.state)).length);
  const total = derived(() => entries.value.length);
  const rows = keyed(
    entries,
    (entry) => entry.id,
    (entry) => {
      const state = derived(() => entry.value.state);
      const percent = derived(() => checkedProgress(entry.value.progress));
      return (
        <li data-execution-state={state} ref={context.parts.item}>
          <span aria-hidden="true" ref={context.parts.itemMarker} />
          <span ref={context.parts.label}>
            <TextShimmer
              text={derived(() => entry.value.label)}
              active={derived(() => state.value === "running")}
            />
          </span>
          <span ref={context.parts.state}>{derived(() => executionStateLabel(state.value))}</span>
          {derived(() => {
            const value = percent.value;
            return value === undefined ? null : (
              <span ref={context.parts.progress}>
                <Badge size="small">{`${value}%`}</Badge>
              </span>
            );
          })}
        </li>
      );
    },
  );
  return (
    <details
      {...props}
      className={className}
      open={defaultOpen}
      data-execution-state={derived(() => aggregateState(entries.value))}
      ref={[context.parts.root, ref]}
    >
      <summary ref={context.parts.summary}>
        {/* The header donut fills by the share of finished steps. */}
        <span
          aria-hidden="true"
          style={derived(
            () =>
              `--task-list-done: ${total.value === 0 ? 0 : Math.round((done.value / total.value) * 100)}%`,
          )}
          ref={context.parts.marker}
        />
        <span ref={context.parts.title}>{title}</span>
        <span
          aria-label={derived(() => `${done.value} of ${total.value} done`)}
          ref={context.parts.count}
        >
          {derived(() => `${done.value}/${total.value}`)}
        </span>
        <span aria-hidden="true" ref={context.parts.chevron}>
          <Icon name="chevron-down" />
        </span>
      </summary>
      <ol ref={context.parts.list}>{rows as unknown as Child}</ol>
    </details>
  );
}
TaskList.meta = {
  name: "task-list",
  parts: [
    "root",
    "summary",
    "marker",
    "title",
    "count",
    "chevron",
    "list",
    "item",
    "itemMarker",
    "label",
    "state",
    "progress",
  ],
} as const;
