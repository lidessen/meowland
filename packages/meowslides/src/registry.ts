import { defaultRuntime, type ComponentContract, type Runtime, type RuntimePlugin } from "meowjsx";
import { mdxSlideContract } from "./mdx-contract";
import {
  presentationContract,
  presentationLayoutContract,
  presentationTextContract,
  presentationListContract,
  presentationImageContract,
  revealContract,
  presentationVideoContract,
  presentationAudioContract,
} from "./presentation";

export const MeowSlidesComponent = {
  MDXSlide: mdxSlideContract.name,
  Presentation: presentationContract.name,
  PresentationLayout: presentationLayoutContract.name,
  PresentationText: presentationTextContract.name,
  PresentationList: presentationListContract.name,
  PresentationImage: presentationImageContract.name,
  Reveal: revealContract.name,
  PresentationVideo: presentationVideoContract.name,
  PresentationAudio: presentationAudioContract.name,
} as const;

export const meowSlidesComponents = [
  mdxSlideContract,
  presentationContract,
  presentationLayoutContract,
  presentationTextContract,
  presentationListContract,
  presentationImageContract,
  revealContract,
  presentationVideoContract,
  presentationAudioContract,
] as const satisfies readonly ComponentContract[];

declare module "meowjsx" {
  interface ComponentRegistryMap {
    "mdx-slide": { parts: (typeof mdxSlideContract.parts)[number] };
    presentation: { parts: (typeof presentationContract.parts)[number] };
    "presentation-layout": { parts: (typeof presentationLayoutContract.parts)[number] };
    "presentation-text": { parts: (typeof presentationTextContract.parts)[number] };
    "presentation-list": { parts: (typeof presentationListContract.parts)[number] };
    "presentation-image": { parts: (typeof presentationImageContract.parts)[number] };
    "presentation-reveal": { parts: (typeof revealContract.parts)[number] };
    "presentation-video": { parts: (typeof presentationVideoContract.parts)[number] };
    "presentation-audio": { parts: (typeof presentationAudioContract.parts)[number] };
  }
}

/** Register slides only. The host installs Meowtail's shared UI and style adapter separately. */
export function createMeowSlides(): RuntimePlugin {
  return { name: "meow-slides", components: meowSlidesComponents };
}

export function installMeowSlides(runtime: Runtime = defaultRuntime): () => void {
  return runtime.use(createMeowSlides());
}
