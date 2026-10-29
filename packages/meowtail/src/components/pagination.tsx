import { h, keyed, type Context, type Props } from "meowjsx";
import { derived, unwrap, type MaybeSignal } from "meowjsx/signal";
import { Icon } from "../icons/icon";

export type PaginationEntry =
  | { kind: "page"; page: number }
  | { kind: "gap"; side: "start" | "end" };

export interface PaginationProps extends Props {
  /** The current 1-based page. The host owns it: a click only calls onPageChange. */
  page: MaybeSignal<number>;
  /**
   * Total pages when the host knows it; numbered pages are shown. Omit it for an unknown total:
   * Previous/Next and the page fact remain, and hasNext decides whether Next acts.
   */
  pageCount?: MaybeSignal<number>;
  /** Whether a later page exists when pageCount is omitted. Ignored when pageCount is given. */
  hasNext?: MaybeSignal<boolean>;
  onPageChange: (page: number) => void;
  /** The host is loading a page: controls keep focus and place but do not act. */
  busy?: MaybeSignal<boolean>;
  disabled?: MaybeSignal<boolean>;
  /** Pages kept on each side of the current one. Fixed for the mount. */
  siblings?: number;
  /** Accessible name of the navigation landmark. */
  label?: string;
  previousLabel?: string;
  nextLabel?: string;
  /** Accessible name of a numbered page. */
  pageLabel?: (page: number) => string;
  /**
   * The page fact: shown for an unknown total, and in place of the numbered pages when the bar is
   * too narrow for them. pageCount is undefined when the total is unknown.
   */
  pageStatus?: (page: number, pageCount: number | undefined) => string;
  className?: Props["className"];
}

function checkPage(page: number): number {
  if (!Number.isInteger(page) || page < 1) throw new RangeError("Pagination page must be ≥ 1");
  return page;
}

function checkPageCount(count: number): number {
  if (!Number.isInteger(count) || count < 0)
    throw new RangeError("Pagination pageCount must be a whole number ≥ 0");
  return count;
}

/**
 * The entries a known total shows: always the first and last page, the current page with its
 * siblings, and a gap where pages are skipped. The count of entries stays constant once the total
 * exceeds it, so the row does not change width while the reader steps through pages.
 */
export function paginationEntries(
  page: number,
  pageCount: number,
  siblings = 1,
): readonly PaginationEntry[] {
  checkPage(page);
  checkPageCount(pageCount);
  if (!Number.isInteger(siblings) || siblings < 0)
    throw new RangeError("Pagination siblings must be a whole number ≥ 0");
  const pages = (from: number, to: number): PaginationEntry[] =>
    Array.from({ length: to - from + 1 }, (_, index) => ({ kind: "page", page: from + index }));
  // first + last + current + siblings on both sides + two gaps
  const slots = 2 * siblings + 5;
  if (pageCount <= slots) return pages(1, pageCount);
  // A page past the end (the host shrank the total) keeps the window at the last pages.
  const current = Math.min(page, pageCount);
  const start = Math.max(current - siblings, 1);
  const end = Math.min(current + siblings, pageCount);
  const startGap = start > 3;
  const endGap = end < pageCount - 2;
  const edge = slots - 2;
  if (!startGap)
    return [...pages(1, edge), { kind: "gap", side: "end" }, ...pages(pageCount, pageCount)];
  if (!endGap)
    return [
      ...pages(1, 1),
      { kind: "gap", side: "start" },
      ...pages(pageCount - edge + 1, pageCount),
    ];
  return [
    ...pages(1, 1),
    { kind: "gap", side: "start" },
    ...pages(start, end),
    { kind: "gap", side: "end" },
    ...pages(pageCount, pageCount),
  ];
}

/** Moves through pages of a host-owned record set, with a known or unknown total. */
export function Pagination(
  {
    page,
    pageCount,
    hasNext = false,
    onPageChange,
    busy = false,
    disabled = false,
    siblings = 1,
    label = "Pagination",
    previousLabel = "Previous",
    nextLabel = "Next",
    pageLabel = (value) => `Page ${value}`,
    pageStatus = (value, total) =>
      total === undefined ? `Page ${value}` : `Page ${value} of ${total}`,
    className,
    ref,
    ...props
  }: PaginationProps,
  context: Context<typeof Pagination>,
) {
  const known = pageCount !== undefined;
  const current = derived(() => checkPage(unwrap(page)));
  const count = derived(() => (known ? checkPageCount(unwrap(pageCount)) : undefined));
  const inert = derived(() => unwrap(busy) || unwrap(disabled));
  const canPrevious = derived(() => current.value > 1);
  const canNext = derived(() =>
    count.value === undefined ? unwrap(hasNext) : current.value < count.value,
  );
  // aria-disabled keeps focus on a control that reaches a boundary or waits for the host.
  const blocked = (available: { value: boolean }) =>
    derived(() => (inert.value || !available.value ? "true" : undefined));
  const go = (target: number, available: boolean) => {
    if (unwrap(busy) || unwrap(disabled) || !available || target === current.value) return;
    onPageChange(target);
  };
  const entries = derived(() =>
    count.value === undefined ? [] : paginationEntries(current.value, count.value, siblings),
  );

  return (
    <nav
      {...props}
      className={className}
      aria-label={label}
      aria-busy={derived(() => (unwrap(busy) ? "true" : undefined))}
      ref={[context.parts.root, ref]}
    >
      <button
        type="button"
        aria-disabled={blocked(canPrevious)}
        onClick={() => go(current.value - 1, canPrevious.value)}
        ref={context.parts.previous}
      >
        <Icon name="chevron-left" />
        <span>{previousLabel}</span>
      </button>
      {known ? (
        <ul ref={context.parts.list}>
          {keyed(
            entries,
            (entry) => (entry.kind === "page" ? entry.page : `gap-${entry.side}`),
            (entry) => {
              const value = entry.value;
              if (value.kind === "gap")
                return (
                  <li ref={context.parts.item}>
                    <span aria-hidden="true" ref={context.parts.gap}>
                      {"…"}
                    </span>
                  </li>
                );
              const isCurrent = derived(() => current.value === value.page);
              return (
                <li ref={context.parts.item}>
                  <button
                    type="button"
                    aria-label={pageLabel(value.page)}
                    aria-current={derived(() => (isCurrent.value ? "page" : undefined))}
                    aria-disabled={derived(() => (inert.value ? "true" : undefined))}
                    onClick={() => go(value.page, true)}
                    ref={context.parts.page}
                  >
                    {String(value.page)}
                  </button>
                </li>
              );
            },
          )}
        </ul>
      ) : null}
      <span ref={context.parts.status}>
        {derived(() => pageStatus(current.value, count.value))}
      </span>
      <button
        type="button"
        aria-disabled={blocked(canNext)}
        onClick={() => go(current.value + 1, canNext.value)}
        ref={context.parts.next}
      >
        <span>{nextLabel}</span>
        <Icon name="chevron-right" />
      </button>
    </nav>
  );
}
Pagination.meta = {
  name: "pagination",
  parts: ["root", "previous", "list", "item", "page", "gap", "status", "next"],
} as const;
