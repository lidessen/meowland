let nextElementId = 0;

/**
 * A document-unique id for a component that wires its own ARIA references.
 * One sequence serves every runtime in the bundle, so two mounts never share
 * an id; call it once during setup, never from a Signal read.
 */
export function elementId(prefix: string): string {
  nextElementId += 1;
  return `${prefix}-${nextElementId}`;
}
