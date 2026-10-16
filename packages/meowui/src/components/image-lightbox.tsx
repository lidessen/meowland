import {
  defineComponent,
  h,
  type Child,
  type ComponentContract,
  type Props,
} from "meowjsx";
import { ImagePreview } from "./image-preview";

export const imageLightboxContract = {
  name: "image-lightbox",
  parts: ["root", "trigger", "dialog", "image", "caption", "close"],
} as const satisfies ComponentContract;
export interface ImageLightboxProps extends Props {
  src: string;
  alt: string;
  caption?: string;
  trigger?: Child;
  onClose?: () => void;
}
/** Native modal top layer keeps the preview independent of transformed ancestors. */
export const ImageLightbox = defineComponent<
  ImageLightboxProps,
  "image-lightbox",
  (typeof imageLightboxContract.parts)[number]
>(
  imageLightboxContract,
  ({ src, alt, caption, trigger = "预览图片", onClose, ...props }, context) => {
    let dialog: HTMLDialogElement | undefined;
    let opener: HTMLButtonElement | undefined;
    return context.part("root", "div", props, [
      context.part(
        "trigger",
        "button",
        {
          type: "button",
          ref: (node: HTMLButtonElement) => {
            opener = node;
            return () => {
              opener = undefined;
            };
          },
          onClick: () => dialog?.showModal(),
        },
        trigger,
      ),
      context.part(
        "dialog",
        "dialog",
        {
          "aria-label": alt || "图片预览",
          ref: (node: HTMLDialogElement) => {
            dialog = node;
            return () => {
              if (node.open) node.close();
              dialog = undefined;
            };
          },
          onClose: () => {
            opener?.focus();
            onClose?.();
          },
          onClick: (event: MouseEvent) => {
            if (event.target === dialog) dialog?.close();
          },
        },
        [
          context.part(
            "close",
            "button",
            {
              type: "button",
              autoFocus: true,
              "aria-label": "关闭图片预览",
              onClick: () => dialog?.close(),
            },
            "×",
          ),
          context.part("image", "div", null, <ImagePreview src={src} alt={alt} />),
          caption ? context.part("caption", "p", {}, caption) : null,
        ],
      ),
    ]);
  },
);
