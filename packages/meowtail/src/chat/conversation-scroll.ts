type Viewport = Pick<HTMLElement, "scrollTop" | "scrollHeight" | "clientHeight">;

/** Append-only reading continuity. History insertion and transcript restoration belong to the host. */
export function createChatScroll(viewport: Viewport) {
  let following = true;
  let readingTop = viewport.scrollTop;
  let height = viewport.clientHeight;
  let contentHeight = viewport.scrollHeight;
  const atLatest = () => viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop <= 24;
  const restore = () => {
    if (!viewport.clientHeight) return;
    viewport.scrollTop = following
      ? Math.max(0, viewport.scrollHeight - viewport.clientHeight)
      : readingTop;
    readingTop = viewport.scrollTop;
    height = viewport.clientHeight;
    contentHeight = viewport.scrollHeight;
  };
  return {
    atLatest,
    restore,
    read() {
      if (!viewport.clientHeight) return;
      if (height !== viewport.clientHeight || contentHeight !== viewport.scrollHeight) {
        restore();
        return;
      }
      readingTop = viewport.scrollTop;
      following = atLatest();
    },
    latest() {
      following = true;
      restore();
    },
  };
}
