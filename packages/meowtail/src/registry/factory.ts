import { type RegisteredComponent, type Runtime, type RuntimePlugin } from "meowjsx";
import { createStylePropsPlugin } from "meowcss/meowjsx";

export type MeowUIRegisteredComponent = RegisteredComponent;

export interface MeowUIOptions {
  readonly components: readonly MeowUIRegisteredComponent[];
}

/** Creates the shared style-props adapter for an explicit component selection. */
export function createMeowUI({ components }: MeowUIOptions): RuntimePlugin {
  return { ...createStylePropsPlugin(), name: "meow-ui", components };
}

/** Installs the shared style-props adapter and explicit component selection. */
export function installMeowUI(options: MeowUIOptions, runtime: Runtime): () => void {
  return runtime.use(createMeowUI(options));
}
