import { h, type Child, type Props, type Context } from "meowjsx";
import { ImagePreview } from "./image-preview";

export interface ImageLightboxProps extends Props {
  src: string;
  alt: string;
  caption?: string;
  trigger?: Child;
  onClose?: () => void;
}
/**
 * A full-screen viewer for one image. Native modal top layer keeps the preview independent of
 * transformed ancestors.
 */
export function ImageLightbox(
  { src, alt, caption, trigger = "Preview image", onClose, ...props }: ImageLightboxProps,
  context: Context<typeof ImageLightbox>,
) {
  let dialog: HTMLDialogElement | undefined;
  let opener: HTMLButtonElement | undefined;
  return (
    <div {...props} ref={[context.parts.root, props.ref]}>
      {[
        <button
          type={"button"}
          onClick={() => dialog?.showModal()}
          ref={[
            context.parts.trigger,
            (node: HTMLButtonElement) => {
              opener = node;
              return () => {
                opener = undefined;
              };
            },
          ]}
        >
          {trigger}
        </button>,
        <dialog
          aria-label={alt || "Image preview"}
          onClose={() => {
            opener?.focus();
            onClose?.();
          }}
          onClick={(event: MouseEvent) => {
            if (event.target === dialog) dialog?.close();
          }}
          ref={[
            context.parts.dialog,
            (node: HTMLDialogElement) => {
              dialog = node;
              return () => {
                if (node.open) node.close();
                dialog = undefined;
              };
            },
          ]}
        >
          {[
            <button
              type={"button"}
              autoFocus={true}
              aria-label={"Close image preview"}
              onClick={() => dialog?.close()}
              ref={[context.parts.close]}
            >
              {"×"}
            </button>,
            <div ref={[context.parts.image]}>{<ImagePreview src={src} alt={alt} />}</div>,
            caption ? <p ref={[context.parts.caption]}>{caption}</p> : null,
          ]}
        </dialog>,
      ]}
    </div>
  );
}
ImageLightbox.meta = {
  name: "image-lightbox",
  parts: ["root", "trigger", "dialog", "image", "caption", "close"],
} as const;
