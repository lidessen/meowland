import type { Component } from "meowjsx";
import type { ComponentReplacement, Story, StoryConfig } from "./types";
export type * from "./types";
export type { ComponentMetadata } from "./metadata";

export function defineStory<T extends Story>(story: T): T {
  return story;
}
export function defineConfig<T extends StoryConfig>(config: T): T {
  return config;
}
export function replaceComponent<P extends object>(
  component: Component<P, any, any>,
  replacement: Component<NoInfer<P>, any, any>,
): ComponentReplacement {
  return { component, replacement };
}
