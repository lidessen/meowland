import { isSignal } from "./reactive";
import type { Child, Key, MaybeSignal, ReadableSignal } from "./types";

const keyedBrand = Symbol("meowjsx.keyed");

export interface KeyedChild<T> {
  readonly [keyedBrand]: true;
  readonly items: MaybeSignal<readonly T[]>;
  readonly key: (item: T) => Key;
  readonly render: (item: ReadableSignal<T>) => Child;
}

/** Keep rows mounted by identity. The callback constructs children, not a lifecycle scope. */
export function keyed<T>(
  items: MaybeSignal<readonly T[]>,
  key: (item: T) => Key,
  render: (item: ReadableSignal<T>) => Child,
): KeyedChild<T> {
  return { [keyedBrand]: true, items, key, render };
}

export function isKeyedChild(value: unknown): value is KeyedChild<unknown> {
  return typeof value === "object" && value !== null && keyedBrand in value;
}

/** Shared admission for target mounting and static HTML; invalid keys never alter rows. */
export function readKeyedEntries<T>(
  child: KeyedChild<T>,
  items: readonly T[] = isSignal<readonly T[]>(child.items) ? child.items.value : child.items,
): readonly { key: Key; value: T }[] {
  if (!Array.isArray(items)) throw new Error("Keyed children require an array");
  const seen = new Set<Key>();
  return items.map((value) => {
    const key = child.key(value);
    if (typeof key !== "string" && (typeof key !== "number" || !Number.isFinite(key)))
      throw new Error("Keyed children require string or finite number keys");
    if (seen.has(key)) throw new Error("Keyed children require unique keys");
    seen.add(key);
    return { key, value };
  });
}
