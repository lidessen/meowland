export interface Box {
  top: number;
  bottom: number;
  height: number;
  center: number;
}

/** Shared geometry helpers for the basic-quality browser checks. */
export function verticalCenter(top: number, height: number): number {
  return top + height / 2;
}

export function centerDistance(a: number, b: number): number {
  return Math.abs(a - b);
}
