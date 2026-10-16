import type { Cleanup, Effect, MaybeSignal, ReadableSignal, WritableSignal } from "./types";

type Job = () => void;
type ReactiveEffectState = {
  dependencies: Set<ReadableSignal<unknown>>;
  subscriptions: Cleanup[];
  stopped: boolean;
  scheduled: boolean;
};

/**
 * The host microtask queue is the one host capability core scheduling needs.
 * It is declared here rather than pulled from a DOM or Node lib so the core
 * typecheck stays free of platform libs.
 */
declare const queueMicrotask: (callback: () => void) => void;

const pendingJobs = new Set<Job>();
let flushScheduled = false;
let batchDepth = 0;
let activeEffect: ReactiveEffectState | undefined;

function flushJobs(): void {
  flushScheduled = false;
  while (pendingJobs.size > 0) {
    const jobs = [...pendingJobs];
    pendingJobs.clear();
    for (const job of jobs) job();
  }
}

function schedule(job: Job): void {
  pendingJobs.add(job);
  if (batchDepth > 0 || flushScheduled) return;
  flushScheduled = true;
  queueMicrotask(flushJobs);
}

function trackSignal(source: ReadableSignal<unknown>): void {
  activeEffect?.dependencies.add(source);
}

export function batch<T>(run: () => T): T {
  batchDepth += 1;
  try {
    return run();
  } finally {
    batchDepth -= 1;
    if (batchDepth === 0 && pendingJobs.size > 0) flushJobs();
  }
}

export function signal<T>(initialValue: T): WritableSignal<T> {
  let value = initialValue;
  const subscribers = new Set<(value: T) => void>();

  const notify = (): void => {
    for (const listener of Array.from(subscribers)) listener(value);
  };

  const source: WritableSignal<T> = {
    get value(): T {
      trackSignal(source);
      return value;
    },
    set value(next: T) {
      if (Object.is(value, next)) return;
      value = next;
      schedule(notify);
    },
    set(next: T): void {
      if (Object.is(value, next)) return;
      value = next;
      schedule(notify);
    },
    update(updater: (previous: T) => T): void {
      const next = updater(value);
      if (Object.is(value, next)) return;
      value = next;
      schedule(notify);
    },
    subscribe(listener: (value: T) => void): () => void {
      subscribers.add(listener);
      return () => subscribers.delete(listener);
    },
  };
  return source;
}

export function createReactiveEffect(run: Effect): Cleanup {
  const state: ReactiveEffectState = {
    dependencies: new Set(),
    subscriptions: [],
    stopped: false,
    scheduled: false,
  };
  let currentCleanup: Cleanup | undefined;

  const clearSubscriptions = (): void => {
    for (const unsubscribe of state.subscriptions) unsubscribe();
    state.subscriptions = [];
  };

  function scheduleRun(): void {
    if (state.stopped || state.scheduled) return;
    state.scheduled = true;
    schedule(runEffect);
  }

  function runEffect(): void {
    if (state.stopped) return;
    state.scheduled = false;
    clearSubscriptions();
    state.dependencies.clear();
    currentCleanup?.();
    currentCleanup = undefined;

    const previousEffect = activeEffect;
    activeEffect = state;
    try {
      currentCleanup = run() ?? undefined;
    } finally {
      activeEffect = previousEffect;
    }

    state.subscriptions = [...state.dependencies].map((source) => source.subscribe(scheduleRun));
  }

  runEffect();

  return () => {
    if (state.stopped) return;
    state.stopped = true;
    state.scheduled = false;
    clearSubscriptions();
    currentCleanup?.();
    currentCleanup = undefined;
  };
}

export function isSignal<T = unknown>(value: unknown): value is ReadableSignal<T> {
  return (
    value !== null &&
    (typeof value === "object" || typeof value === "function") &&
    "value" in value &&
    "subscribe" in value &&
    typeof value.subscribe === "function"
  );
}

export function isPromiseLike<T = unknown>(value: unknown): value is PromiseLike<T> {
  return (
    value !== null &&
    (typeof value === "object" || typeof value === "function") &&
    typeof (value as { then?: unknown }).then === "function"
  );
}

export function isAsyncIterable<T = unknown>(value: unknown): value is AsyncIterable<T> {
  return (
    value !== null &&
    (typeof value === "object" || typeof value === "function") &&
    typeof (value as { [Symbol.asyncIterator]?: unknown })[Symbol.asyncIterator] === "function"
  );
}

export function unwrap<T>(value: MaybeSignal<T>): T {
  let current: unknown = value;
  const seen = new Set<unknown>();
  while (isSignal(current) && !seen.has(current)) {
    seen.add(current);
    current = current.value;
  }
  return current as T;
}

export function mapSignal<T, M>(
  source: ReadableSignal<T>,
  map: (value: T) => M,
): ReadableSignal<M> {
  const mapped: ReadableSignal<M> = {
    get value(): M {
      trackSignal(mapped);
      return map(source.value);
    },
    subscribe(listener: (value: M) => void): () => void {
      return source.subscribe((value) => listener(map(value)));
    },
  };
  return mapped;
}
