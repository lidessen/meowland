import { defineComponent, h, type ComponentContract, type Props } from "meowjsx";
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
  items: readonly ChatAttachmentItem[];
  label?: string;
  className?: string;
}

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
      items.map((item) => {
        const remove = item.onRemove
          ? context.part(
              "remove",
              "button",
              {
                type: "button",
                onClick: item.onRemove,
                "aria-label": `Remove ${item.name}`,
              },
              <Icon name="x" />,
            )
          : null;
        return item.mediaType.startsWith("image/")
          ? context.part(
              "entry",
              "div",
              { key: item.id, "data-kind": "image" },
              context.part(
                "image",
                item.onPreview ? "button" : "a",
                item.onPreview
                  ? {
                      type: "button",
                      onClick: item.onPreview,
                      "aria-label": `Preview ${item.name}`,
                    }
                  : {
                      href: item.url,
                      target: "_blank",
                      rel: "noreferrer",
                      "aria-label": `Open image ${item.name}`,
                    },
                context.part(
                  "preview",
                  "span",
                  null,
                  <ImagePreview src={item.url} alt={item.name} />,
                ),
              ),
              remove,
            )
          : context.part(
              "entry",
              "div",
              { key: item.id, "data-kind": "file" },
              context.part(
                "file",
                "a",
                {
                  key: item.id,
                  href: item.url,
                  download: item.name,
                  onClick: item.onDownload
                    ? (event: MouseEvent) => {
                        event.preventDefault();
                        item.onDownload!();
                      }
                    : undefined,
                },
                context.part(
                  "icon",
                  "span",
                  { "aria-hidden": "true" },
                  <FileTypeIcon path={item.name} />,
                ),
                context.part(
                  "details",
                  "span",
                  null,
                  context.part("name", "strong", null, item.name),
                  item.sizeBytes !== undefined &&
                    Number.isFinite(item.sizeBytes) &&
                    item.sizeBytes >= 0
                    ? context.part(
                        "size",
                        "small",
                        null,
                        [
                          fileExtension(item.name).toUpperCase().slice(0, 8),
                          formatBytes(item.sizeBytes),
                        ]
                          .filter(Boolean)
                          .join(" "),
                      )
                    : null,
                ),
              ),
              item.onPreview
                ? context.part(
                    "previewButton",
                    "button",
                    {
                      type: "button",
                      onClick: item.onPreview,
                      "aria-label": `Preview ${item.name}`,
                    },
                    "Preview",
                  )
                : null,
              remove,
            );
      }),
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
