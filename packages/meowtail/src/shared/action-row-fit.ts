/**
 * Keep a row of actions on one line while it fits, and stack the whole row when it does not.
 *
 * Wrapping item by item leaves ragged lines and orphans: a lone icon or a lone quiet button on
 * a line of its own, and a primary action split from the actions it belongs with. A row that
 * cannot fit therefore switches at once: `data-stacked` turns every text action into a
 * full-width line in DOM order, and icon actions stay together on one line.
 *
 * The check lays the row out on one line at natural widths (`data-measuring`), compares the
 * content to the box and clears the flag before paint. It runs when the row's inline size
 * changes, never on a change of its own height, so the switch cannot oscillate, and when its
 * content changes (a label signal, a spinner). It waits for the next frame rather than running
 * inside the observer callback: stacking changes the row's height, and a layout change inside
 * that callback is reported as a ResizeObserver loop error. Without a client runtime the row
 * keeps the stylesheet's plain wrapping.
 */
export function observeActionRowFit(row: HTMLElement): () => void {
  if (typeof ResizeObserver === "undefined") return () => {};
  const measure = () => {
    // Measure the one-line layout itself, not the stacked one, or a stacked row never unstacks.
    row.removeAttribute("data-stacked");
    row.setAttribute("data-measuring", "");
    const overflowing = row.scrollWidth > row.clientWidth + 1;
    row.removeAttribute("data-measuring");
    row.toggleAttribute("data-stacked", overflowing);
  };
  let frame = 0;
  const schedule = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      measure();
    });
  };
  let width = -1;
  const resize = new ResizeObserver((entries) => {
    const next = entries[entries.length - 1]?.contentRect.width ?? row.clientWidth;
    if (next === width) return;
    width = next;
    schedule();
  });
  resize.observe(row);
  const content = new MutationObserver(schedule);
  content.observe(row, { childList: true, subtree: true, characterData: true });
  return () => {
    if (frame) cancelAnimationFrame(frame);
    resize.disconnect();
    content.disconnect();
    row.removeAttribute("data-stacked");
  };
}

/** A local ref that fits an action row; callers compose it with their own ref binding. */
export function actionRowRef() {
  return (row: HTMLElement) => observeActionRowFit(row);
}
