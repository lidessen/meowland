import { h, keyed, type Context, type Props } from "meowjsx";
import { derived, type MaybeSignal } from "meowjsx/signal";
import { Icon } from "../icons/icon";
import { FileTypeIcon, fileExtension } from "../icons/file-type-icon";
import { ImagePreview } from "../components/image-preview";

export interface ChatAttachmentItem {
  id: string;
  name: string;
  url: string;
  mediaType: string;
  sizeBytes?: number;
  onPreview?: () => void;
  /** Let the host download a file while retaining the default anchor without a hook. */
  onDownload?: () => void;
  /** Present only while this attachment can still be removed from the host's draft. */
  onRemove?: () => void;
}

export interface ChatAttachmentsProps extends Props {
  /** Plain arrays are fixed for the mount. A signal updates rows in place. */
  items: MaybeSignal<readonly ChatAttachmentItem[]>;
  label?: string;
}

/** Files attached to a message or a draft, with preview, download and remove actions. */
export function ChatAttachments(
  { items, label = "Message attachments", ref, ...props }: ChatAttachmentsProps,
  context: Context<typeof ChatAttachments>,
) {
  const parts = context.parts;
  return (
    <div {...props} role="group" aria-label={label} ref={[parts.root, ref]}>
      {keyed(
        items,
        (item) =>
          [
            item.id,
            item.mediaType.startsWith("image/") ? "image" : "file",
            item.onRemove ? "remove" : "keep",
            item.onPreview ? "preview" : "plain",
          ].join(":"),
        (item) => {
          const current = item.value;
          const remove = current.onRemove ? (
            <button
              type="button"
              onClick={() => item.value.onRemove?.()}
              aria-label={derived(() => `Remove ${item.value.name}`)}
              ref={parts.remove}
            >
              <Icon name="x" />
            </button>
          ) : null;
          const size = derived(() => {
            const bytes = item.value.sizeBytes;
            if (bytes === undefined || !Number.isFinite(bytes) || bytes < 0) return null;
            return (
              <small ref={parts.size}>
                {[fileExtension(item.value.name).toUpperCase().slice(0, 8), formatBytes(bytes)]
                  .filter(Boolean)
                  .join(" ")}
              </small>
            );
          });
          return current.mediaType.startsWith("image/") ? (
            <div data-kind="image" ref={parts.entry}>
              {current.onPreview ? (
                <button
                  type="button"
                  onClick={() => item.value.onPreview?.()}
                  aria-label={derived(() => `Preview ${item.value.name}`)}
                  ref={parts.image}
                >
                  <span ref={parts.preview}>
                    <ImagePreview src={current.url} alt={current.name} />
                  </span>
                </button>
              ) : (
                <a
                  href={derived(() => item.value.url)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={derived(() => `Open image ${item.value.name}`)}
                  ref={parts.image}
                >
                  <span ref={parts.preview}>
                    <ImagePreview src={current.url} alt={current.name} />
                  </span>
                </a>
              )}
              {remove}
            </div>
          ) : (
            <div data-kind="file" ref={parts.entry}>
              <a
                href={derived(() => item.value.url)}
                download={derived(() => item.value.name)}
                onClick={(event: MouseEvent) => {
                  const download = item.value.onDownload;
                  if (!download) return;
                  event.preventDefault();
                  download();
                }}
                ref={parts.file}
              >
                <span aria-hidden="true" ref={parts.icon}>
                  <FileTypeIcon path={current.name} />
                </span>
                <span ref={parts.details}>
                  <strong ref={parts.name}>{derived(() => item.value.name)}</strong>
                  {size}
                </span>
              </a>
              {current.onPreview ? (
                <button
                  type="button"
                  onClick={() => item.value.onPreview?.()}
                  aria-label={derived(() => `Preview ${item.value.name}`)}
                  ref={parts.previewButton}
                >
                  Preview
                </button>
              ) : null}
              {remove}
            </div>
          );
        },
      )}
    </div>
  );
}

ChatAttachments.meta = {
  name: "chat-attachments",
  parts: [
    "root",
    "image",
    "preview",
    "file",
    "icon",
    "details",
    "name",
    "size",
    "entry",
    "previewButton",
    "remove",
  ],
} as const;

function formatBytes(value: number): string {
  if (value < 1024) return `${value}B`;
  const units = ["KB", "MB", "GB"];
  let scaled = value / 1024;
  let unit = 0;
  while (scaled >= 1024 && unit < units.length - 1) {
    scaled /= 1024;
    unit++;
  }
  return `${scaled < 10 ? scaled.toFixed(1) : Math.round(scaled)}${units[unit]}`;
}
