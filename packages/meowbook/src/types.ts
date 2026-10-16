import type { Child, Runtime, Cleanup, Component } from "meowjsx";

export interface StoryContext {
  runtime: Runtime;
  root: HTMLElement;
  signal: AbortSignal;
  onCleanup(cleanup: Cleanup): void;
  report(message: string): void;
}
export interface EnvironmentContext {
  root: HTMLElement;
  signal: AbortSignal;
  onCleanup(cleanup: Cleanup): void;
  /** Default wrapper; a story can replace it or opt out without losing the environment. */
  setContainer(container: StoryContainer): void;
}
export type StoryContainer = (children: Child, context: StoryContext) => Child;
export type PreviewEnvironment = (context: EnvironmentContext) => Runtime | Promise<Runtime>;
export interface ComponentReplacement {
  component: Component<any, any, any>;
  replacement: Component<any, any, any>;
}
export interface Story {
  id: string;
  title?: string;
  group?: string;
  groupOrder?: number;
  /** Component directory and short scenario label; title remains searchable. */
  component?: string;
  variant?: string;
  description?: string;
  covers?: readonly string[];
  container?: StoryContainer | false;
  render(context: StoryContext): Child;
  setup?(context: StoryContext): void | Promise<void>;
  ready?(context: StoryContext): void | Promise<void>;
  replacements?: readonly ComponentReplacement[];
}
export interface StoryEntry {
  id: string;
  title: string;
  file: string;
  exportName: string;
  line: number;
  group?: string;
  groupOrder?: number;
  component?: string;
  variant?: string;
  /** Literal metadata available before loading the story; dynamic values arrive with the canvas. */
  description?: string;
  covers?: readonly string[];
}
export interface StoryConfig {
  /** Workspace root; relative paths below resolve from here. */
  root: string;
  stories: readonly string[];
  preview: string;
  tsconfig: string;
}
