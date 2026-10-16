interface ReadingAnchor { id: string; offset: number }

/** The transcript has exactly one scroll owner. The latest control belongs to this viewport. */
export function assistantScroll(viewport: HTMLElement, content: HTMLElement, onLatest: (latest: boolean) => void) {
  let following = true;
  let anchor: ReadingAnchor | undefined;
  let top = viewport.scrollTop;
  let restoring = false;
  const rows = () => [...content.querySelectorAll<HTMLElement>("[data-assistant-message-id]")];
  const atLatest = () => viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop <= 24;
  const capture = () => {
    top = viewport.scrollTop;
    const origin = viewport.getBoundingClientRect().top;
    const row = rows().find((item) => item.getBoundingClientRect().bottom > origin);
    anchor = row ? { id: row.dataset.assistantMessageId!, offset: row.getBoundingClientRect().top - origin } : undefined;
  };
  const restore = () => {
    if (!viewport.clientHeight) return;
    restoring = true;
    if (following) viewport.scrollTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
    else {
      const row = anchor && rows().find((item) => item.dataset.assistantMessageId === anchor!.id);
      viewport.scrollTop = row && anchor
        ? viewport.scrollTop + row.getBoundingClientRect().top - viewport.getBoundingClientRect().top - anchor.offset
        : top;
    }
    capture();
    onLatest(atLatest());
    restoring = false;
  };
  const scroll = () => {
    if (restoring) return;
    following = atLatest();
    capture();
    onLatest(following);
  };
  const inspectDisclosure = (event: MouseEvent) => {
    const summary = event.target instanceof Element ? event.target.closest("summary") : null;
    if (!summary || !content.contains(summary)) return;
    // Expanding an earlier process is a reading action, not a request to follow its new height.
    following = false;
    capture();
  };
  viewport.addEventListener("scroll", scroll, { passive: true });
  viewport.addEventListener("click", inspectDisclosure);
  const observer = new ResizeObserver(restore);
  observer.observe(viewport);
  observer.observe(content);
  restore();
  return {
    beforeUpdate: capture,
    afterUpdate: restore,
    latest() { following = true; restore(); viewport.focus({ preventScroll: true }); },
    dispose() { observer.disconnect(); viewport.removeEventListener("scroll", scroll); viewport.removeEventListener("click", inspectDisclosure); },
  };
}
