/** Copy from a user gesture, including trusted LAN pages served over HTTP. */
export async function copyTextToClipboard(text: string, doc: Document = document): Promise<void> {
  const clipboard = doc.defaultView?.navigator.clipboard;
  if (clipboard?.writeText) {
    await clipboard.writeText(text);
    return;
  }

  // The legacy command is still available on HTTP, where Clipboard API is absent.
  const active = doc.activeElement as HTMLElement | null;
  const field = active as HTMLInputElement | HTMLTextAreaElement | null;
  const fieldSelection =
    field && typeof field.selectionStart === "number"
      ? ([field.selectionStart, field.selectionEnd, field.selectionDirection ?? undefined] as const)
      : undefined;
  const selection = doc.getSelection();
  const ranges = selection
    ? Array.from({ length: selection.rangeCount }, (_, index) =>
        selection.getRangeAt(index).cloneRange(),
      )
    : [];
  const textarea = doc.createElement("textarea");
  textarea.value = text;
  textarea.readOnly = true;
  textarea.tabIndex = -1;
  textarea.style.cssText =
    "position:fixed;top:0;left:0;opacity:0;font-size:16px;pointer-events:none";
  doc.body.append(textarea);
  try {
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    // HTTP hosts lack Clipboard API; keep this fallback until secure contexts are required.
    // oxlint-disable-next-line typescript/no-deprecated
    if (!doc.execCommand("copy")) throw new Error("Clipboard copy unavailable");
  } finally {
    textarea.remove();
    active?.focus({ preventScroll: true });
    if (fieldSelection) field?.setSelectionRange(...fieldSelection);
    if (selection) {
      selection.removeAllRanges();
      for (const range of ranges) selection.addRange(range);
    }
  }
}
