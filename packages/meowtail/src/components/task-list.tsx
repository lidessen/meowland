import {
  defineComponent,
  derived,
  h,
  keyed,
  unwrap,
  type Child,
  type ComponentContract,
  type MaybeSignal,
  type Props,
} from "meowjsx";
import { Icon } from "../icons/icon";
import { executionStateLabel, type ChatExecutionState } from "../shared/execution-state";
import { Badge } from "./badge";
import { TextShimmer } from "./text-shimmer";

export const taskListContract = {
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
} as const satisfies ComponentContract;

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
  className?: string;
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
export const TaskList = defineComponent<
  TaskListProps,
  typeof taskListContract.name,
  (typeof taskListContract.parts)[number]
>(
  taskListContract,
  ({ title = "Tasks", items, defaultOpen = true, className, children, ...props }, context) => {
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
        return context.part(
          "item",
          "li",
          { "data-execution-state": state },
          context.part("itemMarker", "span", { "aria-hidden": "true" }),
          context.part(
            "label",
            "span",
            null,
            h(TextShimmer, {
              text: derived(() => entry.value.label),
              active: derived(() => state.value === "running"),
            }),
          ),
          context.part(
            "state",
            "span",
            null,
            derived(() => executionStateLabel(state.value)),
          ),
          derived(() => {
            const value = percent.value;
            if (value === undefined) return null;
            return context.part("progress", "span", null, h(Badge, { size: "small" }, `${value}%`));
          }),
        );
      },
    );
    return context.part(
      "root",
      "details",
      {
        ...props,
        className,
        open: defaultOpen,
        "data-execution-state": derived(() => aggregateState(entries.value)),
      },
      context.part(
        "summary",
        "summary",
        null,
        context.part("marker", "span", { "aria-hidden": "true" }),
        context.part("title", "span", null, title),
        context.part(
          "count",
          "span",
          { "aria-label": derived(() => `${done.value} of ${total.value} done`) },
          derived(() => `${done.value}/${total.value}`),
        ),
        context.part("chevron", "span", { "aria-hidden": "true" }, <Icon name="chevron-down" />),
      ),
      context.part("list", "ol", null, rows as unknown as Child),
    );
  },
);
