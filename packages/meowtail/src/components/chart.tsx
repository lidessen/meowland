import { h, keyed, type Context, type Props } from "meowjsx";
import { derived, signal, unwrap, type MaybeSignal } from "meowjsx/signal";
import { Table, type TableRow } from "./table";
import { elementId } from "../shared/element-id";
import {
  admitSeries,
  barRect,
  bandCenter,
  chartSeriesLimit,
  linePath,
  markerPath,
  valueDomain,
  valueY,
  type ChartFrame,
  type ChartSeries,
} from "./chart-scale";
export { admitSeries, chartSeriesLimit, niceTicks, type ChartSeries } from "./chart-scale";

export interface ChartProps extends Props {
  /** Bars compare categories; a line follows a trend. Fixed for the mount. */
  type: "bar" | "line";
  /** Names the figure; shown as its caption. */
  label: string;
  description?: string;
  categories: MaybeSignal<readonly string[]>;
  /** At most eight series, in the fixed color order; later ones are not drawn. */
  series: MaybeSignal<readonly ChartSeries[]>;
  /** Appended to every value, for example "%" or " ms". */
  unit?: string;
  /** Formats ticks, the inspection readout and the table. Overrides `unit`. */
  formatValue?: (value: number) => string;
  /** Plot height in px. The width follows the container. */
  height?: number;
  missingLabel?: string;
  dataLabel?: string;
  /** Header of the table's first column. */
  categoryLabel?: string;
  /** How to read values with the keyboard, read when the plot takes focus. */
  hint?: string;
  className?: Props["className"];
}

const defaultWidth = 600;

/**
 * A bar or line chart of host data. Color is never the only cue: a legend names every series,
 * line markers differ by shape, and a data table carries every value.
 */
export function Chart(
  {
    type,
    label,
    description,
    categories,
    series,
    unit = "",
    formatValue,
    height = 240,
    missingLabel = "No value",
    dataLabel = "Show data",
    categoryLabel = "Category",
    hint = "Use the left and right arrow keys to read each category.",
    className,
    ref,
    ...props
  }: ChartProps,
  context: Context<typeof Chart>,
) {
  const numbers = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
  const format = formatValue ?? ((value: number) => `${numbers.format(value)}${unit}`);
  const width = signal(defaultWidth);
  const hintId = elementId("chart-hint");
  const cursor = signal<number | undefined>(undefined);
  let warned = false;

  const names = derived(() => unwrap(categories));
  const admitted = derived(() => {
    const given = unwrap(series);
    if (given.length > chartSeriesLimit && !warned) {
      warned = true;
      console.warn(`Chart "${label}" draws ${chartSeriesLimit} series; the rest are left out.`);
    }
    return admitSeries(given, names.value.length);
  });
  const ticks = derived(() => valueDomain(admitted.value, type === "bar"));
  const frame = derived<ChartFrame>(() => {
    const longest = Math.max(...ticks.value.map((tick) => format(tick).length));
    return {
      width: width.value,
      height,
      // Room for the longest tick label at the caption size.
      left: Math.min(96, 12 + longest * 7),
      right: 12,
      top: 12,
      bottom: 28,
    };
  });
  // Category labels thin out when the bands are narrower than the labels.
  const labelStep = derived(() => {
    const count = names.value.length;
    const band = (frame.value.width - frame.value.left - frame.value.right) / Math.max(1, count);
    const longest = Math.max(1, ...names.value.map((name) => name.length));
    return Math.max(1, Math.ceil((longest * 7 + 8) / Math.max(1, band)));
  });
  const readout = derived(() => {
    const index = cursor.value;
    if (index === undefined || index >= names.value.length) return "";
    const values = admitted.value.map(
      (entry) =>
        `${entry.label}: ${entry.values[index] === null ? missingLabel : format(entry.values[index]!)}`,
    );
    return `${names.value[index]}. ${values.join(", ")}`;
  });

  const move = (index: number) => {
    const count = names.value.length;
    if (count === 0) return;
    cursor.value = Math.min(count - 1, Math.max(0, index));
  };
  const keydown = (event: KeyboardEvent) => {
    const index = cursor.value;
    const last = names.value.length - 1;
    const next =
      event.key === "ArrowRight"
        ? index === undefined
          ? 0
          : index + 1
        : event.key === "ArrowLeft"
          ? index === undefined
            ? last
            : index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : undefined;
    if (next === undefined) {
      if (event.key === "Escape" && cursor.value !== undefined) {
        event.preventDefault();
        cursor.value = undefined;
      }
      return;
    }
    event.preventDefault();
    move(next);
  };
  const pointer = (event: PointerEvent) => {
    const target = event.currentTarget as HTMLElement;
    const bounds = target.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * frame.value.width;
    const plot = frame.value.width - frame.value.left - frame.value.right;
    const count = names.value.length;
    if (count === 0 || x < frame.value.left || x > frame.value.left + plot) {
      cursor.value = undefined;
      return;
    }
    move(Math.floor(((x - frame.value.left) / plot) * count));
  };

  const categoryEntries = derived(() =>
    names.value.map((name, index) => ({ key: index, name, index })),
  );
  const seriesEntries = derived(() =>
    admitted.value.map((entry, slot) => ({ key: entry.id, entry, slot })),
  );
  const barEntries = derived(() =>
    admitted.value.flatMap((entry, slot) =>
      entry.values.map((value, index) => ({ key: `${entry.id}:${index}`, slot, index, value })),
    ),
  );
  const tableColumns = derived(() =>
    admitted.value.map((entry) => `${entry.id}\u0000${entry.label}`).join("\u0001"),
  );
  const tableRows = derived<TableRow[]>(() =>
    names.value.map((name, index) => ({
      id: String(index),
      cells: [
        name,
        ...admitted.value.map((entry) =>
          entry.values[index] === null ? missingLabel : format(entry.values[index]!),
        ),
      ],
    })),
  );

  return (
    <figure {...props} className={className} ref={[context.parts.root, ref]}>
      <figcaption ref={context.parts.caption}>
        <span ref={context.parts.title}>{label}</span>
        {description ? <span ref={context.parts.description}>{description}</span> : null}
      </figcaption>
      <ul
        aria-label="Legend"
        hidden={derived(() => admitted.value.length < 2)}
        ref={context.parts.legend}
      >
        {keyed(
          seriesEntries,
          (item) => item.key,
          (item) => (
            <li ref={context.parts.legendItem}>
              <svg
                viewBox="0 0 12 12"
                width="12"
                height="12"
                aria-hidden="true"
                data-series={derived(() => String(item.value.slot + 1))}
                ref={context.parts.swatch}
              >
                {type === "line" ? (
                  <path d={derived(() => markerPath(item.value.slot, 6, 6, 4))} />
                ) : (
                  <rect x="1" y="1" width="10" height="10" rx="2" />
                )}
              </svg>
              <span>{derived(() => item.value.entry.label)}</span>
            </li>
          ),
        )}
      </ul>
      <div
        role="group"
        aria-label={label}
        aria-describedby={hintId}
        tabIndex={0}
        onKeyDown={keydown}
        onPointerMove={pointer}
        onPointerLeave={(event: PointerEvent) => {
          if (
            event.currentTarget !== (event.currentTarget as HTMLElement).ownerDocument.activeElement
          )
            cursor.value = undefined;
        }}
        onBlur={() => {
          cursor.value = undefined;
        }}
        ref={[
          context.parts.plot,
          (element: HTMLElement) => {
            const measure = () => {
              const next = Math.round(element.clientWidth);
              if (next > 0 && next !== width.value) width.value = next;
            };
            measure();
            if (typeof ResizeObserver === "undefined") return;
            const observer = new ResizeObserver(measure);
            observer.observe(element);
            return () => observer.disconnect();
          },
        ]}
      >
        <svg
          aria-hidden="true"
          width="100%"
          height={String(height)}
          viewBox={derived(() => `0 0 ${frame.value.width} ${height}`)}
          preserveAspectRatio="none"
          ref={context.parts.svg}
        >
          <g ref={context.parts.grid}>
            {keyed(
              ticks,
              (tick) => tick,
              (tick) => {
                const y = derived(() => valueY(frame.value, ticks.value, tick.value).toFixed(1));
                return (
                  <g>
                    <line
                      x1={derived(() => String(frame.value.left))}
                      x2={derived(() => String(frame.value.width - frame.value.right))}
                      y1={y}
                      y2={y}
                      data-zero={derived(() => (tick.value === 0 ? "true" : undefined))}
                      ref={context.parts.gridLine}
                    />
                    <text
                      x={derived(() => String(frame.value.left - 8))}
                      y={y}
                      text-anchor="end"
                      dominant-baseline="middle"
                      ref={context.parts.tick}
                    >
                      {derived(() => format(tick.value))}
                    </text>
                  </g>
                );
              },
            )}
          </g>
          <line
            y1={derived(() => String(frame.value.top))}
            y2={derived(() => String(frame.value.height - frame.value.bottom))}
            x1={derived(() =>
              cursor.value === undefined
                ? "0"
                : bandCenter(frame.value, names.value.length, cursor.value).toFixed(1),
            )}
            x2={derived(() =>
              cursor.value === undefined
                ? "0"
                : bandCenter(frame.value, names.value.length, cursor.value).toFixed(1),
            )}
            visibility={derived(() => (cursor.value === undefined ? "hidden" : "visible"))}
            ref={context.parts.cursor}
          />
          <g>
            {type === "bar"
              ? keyed(
                  barEntries,
                  (item) => item.key,
                  (item) => {
                    const rect = derived(() =>
                      barRect(
                        frame.value,
                        ticks.value,
                        names.value.length,
                        admitted.value.length,
                        item.value.index,
                        item.value.slot,
                        item.value.value,
                      ),
                    );
                    return (
                      <rect
                        x={derived(() => rect.value.x.toFixed(1))}
                        y={derived(() => rect.value.y.toFixed(1))}
                        width={derived(() => rect.value.width.toFixed(1))}
                        height={derived(() => rect.value.height.toFixed(1))}
                        rx="2"
                        data-series={derived(() => String(item.value.slot + 1))}
                        data-active={derived(() =>
                          cursor.value === item.value.index ? "true" : undefined,
                        )}
                        ref={context.parts.bar}
                      />
                    );
                  },
                )
              : keyed(
                  seriesEntries,
                  (item) => item.key,
                  (item) => (
                    <g
                      data-series={derived(() => String(item.value.slot + 1))}
                      ref={context.parts.series}
                    >
                      <path
                        d={derived(() =>
                          linePath(frame.value, ticks.value, item.value.entry.values),
                        )}
                        fill="none"
                        ref={context.parts.line}
                      />
                      <path
                        d={derived(() =>
                          item.value.entry.values
                            .map((value, index) =>
                              value === null
                                ? ""
                                : markerPath(
                                    item.value.slot,
                                    bandCenter(frame.value, names.value.length, index),
                                    valueY(frame.value, ticks.value, value),
                                    cursor.value === index ? 5 : 3.5,
                                  ),
                            )
                            .join(""),
                        )}
                        ref={context.parts.marker}
                      />
                    </g>
                  ),
                )}
          </g>
          <g>
            {keyed(
              categoryEntries,
              (item) => item.key,
              (item) => (
                <text
                  x={derived(() =>
                    bandCenter(frame.value, names.value.length, item.value.index).toFixed(1),
                  )}
                  y={String(height - 8)}
                  text-anchor="middle"
                  visibility={derived(() =>
                    item.value.index % labelStep.value === 0 ? "visible" : "hidden",
                  )}
                  ref={context.parts.category}
                >
                  {derived(() => item.value.name)}
                </text>
              ),
            )}
          </g>
        </svg>
        <div
          aria-hidden="true"
          hidden={derived(() => cursor.value === undefined)}
          style={derived(() => {
            const index = cursor.value ?? 0;
            const x = bandCenter(frame.value, names.value.length, index);
            const left = (x / frame.value.width) * 100;
            // Near an edge the readout grows inward so it never leaves the plot.
            const shift = left < 25 ? "-12px" : left > 75 ? "calc(12px - 100%)" : "-50%";
            return `left: ${left.toFixed(2)}%; transform: translateX(${shift})`;
          })}
          ref={context.parts.tooltip}
        >
          {derived(() => readout.value)}
        </div>
      </div>
      <span id={hintId} hidden>
        {hint}
      </span>
      {/* The readout reaches assistive technology politely as the cursor moves. */}
      <p role="status" ref={context.parts.live}>
        {readout}
      </p>
      <details ref={context.parts.data}>
        <summary ref={context.parts.dataToggle}>{dataLabel}</summary>
        {keyed(
          derived(() => [tableColumns.value]),
          (signature) => signature,
          () => (
            <Table
              label={label}
              columns={[
                { id: "category", header: categoryLabel },
                ...admitted.value.map((entry) => ({
                  id: entry.id,
                  header: entry.label,
                  align: "end" as const,
                })),
              ]}
              rows={tableRows}
            />
          ),
        )}
      </details>
    </figure>
  );
}
Chart.meta = {
  name: "chart",
  parts: [
    "root",
    "caption",
    "title",
    "description",
    "legend",
    "legendItem",
    "swatch",
    "plot",
    "svg",
    "grid",
    "gridLine",
    "tick",
    "cursor",
    "bar",
    "series",
    "line",
    "marker",
    "category",
    "tooltip",
    "live",
    "data",
    "dataToggle",
  ],
} as const;
