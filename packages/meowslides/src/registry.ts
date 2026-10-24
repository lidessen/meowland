import {
  defaultRuntime,
  type RegisteredComponent,
  type Runtime,
  type RuntimePlugin,
} from "meowjsx";
import { MDXSlide } from "./mdx";
import {
  Presentation,
  PresentationImage,
  PresentationLayout,
  PresentationList,
  PresentationText,
  PresentationVideo,
  PresentationAudio,
  Reveal,
} from "./presentation";

export const MeowSlidesComponent = {
  MDXSlide: MDXSlide.meta.name,
  Presentation: Presentation.meta.name,
  PresentationLayout: PresentationLayout.meta.name,
  PresentationText: PresentationText.meta.name,
  PresentationList: PresentationList.meta.name,
  PresentationImage: PresentationImage.meta.name,
  Reveal: Reveal.meta.name,
  PresentationVideo: PresentationVideo.meta.name,
  PresentationAudio: PresentationAudio.meta.name,
} as const;

export const meowSlidesComponents = [
  MDXSlide,
  Presentation,
  PresentationLayout,
  PresentationText,
  PresentationList,
  PresentationImage,
  Reveal,
  PresentationVideo,
  PresentationAudio,
] as const satisfies readonly RegisteredComponent[];

declare module "meowjsx" {
  interface ComponentRegistryMap {
    "mdx-slide": { parts: (typeof MDXSlide.meta.parts)[number] };
    presentation: { parts: (typeof Presentation.meta.parts)[number] };
    "presentation-layout": { parts: (typeof PresentationLayout.meta.parts)[number] };
    "presentation-text": { parts: (typeof PresentationText.meta.parts)[number] };
    "presentation-list": { parts: (typeof PresentationList.meta.parts)[number] };
    "presentation-image": { parts: (typeof PresentationImage.meta.parts)[number] };
    "presentation-reveal": { parts: (typeof Reveal.meta.parts)[number] };
    "presentation-video": { parts: (typeof PresentationVideo.meta.parts)[number] };
    "presentation-audio": { parts: (typeof PresentationAudio.meta.parts)[number] };
  }
}

/** Register slides only. The host installs Meowtail's shared UI and style adapter separately. */
export function createMeowSlides({
  components = meowSlidesComponents,
}: {
  components?: readonly RegisteredComponent[];
} = {}): RuntimePlugin {
  return { name: "meow-slides", components };
}

export function installMeowSlides(runtime: Runtime = defaultRuntime): () => void {
  return runtime.use(createMeowSlides({ components: meowSlidesComponents }));
}
