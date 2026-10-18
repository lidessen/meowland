export { Presentation, presentationContract } from "./presentation";
export { Reveal, revealContract, type RevealProps } from "./reveal";
export {
  PresentationLayout,
  presentationLayoutContract,
  type PresentationLayoutProps,
} from "./layout";
export {
  PresentationText,
  presentationTextContract,
  presentationTextOptions,
  type PresentationTextProps,
} from "./presentation-text";
export { usePresentationActivity } from "./context";
export {
  PresentationVideo,
  PresentationAudio,
  presentationVideoContract,
  presentationAudioContract,
  type PresentationMediaProps,
  type PresentationVideoProps,
  type PresentationAudioProps,
} from "./media";
export type {
  PresentationProps,
  SlideDefinition,
  SlidePosition,
  SlideSession,
  SlideBackground,
  SlideBackgroundImage,
} from "./types";
export type {
  PresentationTransition,
  PresentationTransitionEffect,
  PresentationTransitionDirection,
} from "./transition";
