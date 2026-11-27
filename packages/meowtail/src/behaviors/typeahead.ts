export interface Typeahead {
  (key: string, labels: readonly string[], currentIndex: number): number;
  reset(): void;
  active(): boolean;
}

export function isTypeaheadKey(event: KeyboardEvent): boolean {
  return (
    Array.from(event.key).length === 1 &&
    event.key.charCodeAt(0) >= 32 &&
    event.key.charCodeAt(0) !== 127 &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey &&
    !event.isComposing
  );
}

const fold = (value: string) => value.toLowerCase().replace(/\s+/g, " ").trimStart();

export function createTypeahead(timeout = 700): Typeahead {
  let prefix = "";
  let last = 0;
  const active = () => prefix !== "" && Date.now() - last < timeout;
  const reset = () => {
    prefix = "";
    last = 0;
  };
  const search: Typeahead = (key, labels, currentIndex) => {
    if (!active()) prefix = "";
    const next = fold(prefix + key);
    last = Date.now();
    const repeated = next.length > 1 && [...next].every((char) => char === next[0]);
    const normalized = labels.map(fold);
    const cycle = repeated && !normalized.some((label) => label.startsWith(next));
    prefix = cycle ? next[0]! : next;
    const start = prefix.length === 1 ? currentIndex + 1 : Math.max(0, currentIndex);
    for (let offset = 0; offset < labels.length; offset++) {
      const index = (start + offset + labels.length) % labels.length;
      if (normalized[index]!.startsWith(prefix)) return index;
    }
    return -1;
  };
  search.reset = reset;
  search.active = active;
  return search;
}
