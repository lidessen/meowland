import type { ComponentMetadata } from "meowjsx";

declare module "meowjsx" {
  interface ComponentMetadata {
    capture?: { transparent?: boolean };
  }
}

export type { ComponentMetadata };
