import {
  defineComponent,
  derived,
  h,
  keyed,
  type ComponentContract,
  type MaybeSignal,
  type Props,
} from "meowjsx";
import { Icon } from "../icons/icon";
import { FileTypeIcon, fileExtension } from "../icons/file-type-icon";
import { ImagePreview } from "../components/image-preview";

export const chatAttachmentsContract = {
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
} as const satisfies ComponentContract;

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
  className?: string;
}

/** Files attached to a message or a draft, with preview, download and remove actions. */
export const ChatAttachments = defineComponent<
  ChatAttachmentsProps,
  typeof chatAttachmentsContract.name,
  (typeof chatAttachmentsContract.parts)[number]
>(
  chatAttachmentsContract,
  ({ items, label = "Message attachments", className, ...props }, context) =>
    context.part(
      "root",
      "div",
      {
        ...props,
        className,
        role: "group",
        "aria-label": label,
      },
      keyed(
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
          const remove = current.onRemove
            ? context.part(
                "remove",
                "button",
                {
                  type: "button",
                  onClick: () => item.value.onRemove?.(),
                  "aria-label": derived(() => `Remove ${item.value.name}`),
                },
                <Icon name="x" />,
              )
            : null;
          const size = derived(() => {
            const bytes = item.value.sizeBytes;
            if (bytes === undefined || !Number.isFinite(bytes) || bytes < 0) return null;
            return context.part(
              "size",
              "small",
              null,
              [fileExtension(item.value.name).toUpperCase().slice(0, 8), formatBytes(bytes)]
                .filter(Boolean)
                .join(" "),
            );
          });
          return current.mediaType.startsWith("image/")
            ? context.part(
                "entry",
                "div",
                { "data-kind": "image" },
                context.part(
                  "image",
                  current.onPreview ? "button" : "a",
                  current.onPreview
                    ? {
                        type: "button",
                        onClick: () => item.value.onPreview?.(),
                        "aria-label": derived(() => `Preview ${item.value.name}`),
                      }
                    : {
                        href: derived(() => item.value.url),
                        target: "_blank",
                        rel: "noreferrer",
                        "aria-label": derived(() => `Open image ${item.value.name}`),
                      },
                  context.part(
                    "preview",
                    "span",
                    null,
                    <ImagePreview src={current.url} alt={current.name} />,
                  ),
                ),
                remove,
              )
            : context.part(
                "entry",
                "div",
                { "data-kind": "file" },
                context.part(
                  "file",
                  "a",
                  {
                    href: derived(() => item.value.url),
                    download: derived(() => item.value.name),
                    onClick: (event: MouseEvent) => {
                      const download = item.value.onDownload;
                      if (!download) return;
                      event.preventDefault();
                      download();
                    },
                  },
                  context.part(
                    "icon",
                    "span",
                    { "aria-hidden": "true" },
                    <FileTypeIcon path={current.name} />,
                  ),
                  context.part(
                    "details",
                    "span",
                    null,
                    context.part(
                      "name",
                      "strong",
                      null,
                      derived(() => item.value.name),
                    ),
                    size,
                  ),
                ),
                current.onPreview
                  ? context.part(
                      "previewButton",
                      "button",
                      {
                        type: "button",
                        onClick: () => item.value.onPreview?.(),
                        "aria-label": derived(() => `Preview ${item.value.name}`),
                      },
                      "Preview",
                    )
                  : null,
                remove,
              );
        },
      ),
    ),
);

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
