import { h, signal, type Child } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Button,
  ChatAttachments,
  ChatComposer,
  Dialog,
  DialogHeader,
  DialogPanel,
  Icon,
  Inline,
  Stack,
} from "meowtail";
import { Measure, Note } from "./specimen";

const imageUrl =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="240" viewBox="0 0 360 240"><rect width="360" height="240" fill="#edf1ec"/><rect x="24" y="28" width="72" height="184" rx="8" fill="#c5cec2"/><rect x="112" y="28" width="224" height="112" rx="8" fill="#fff"/><rect x="112" y="156" width="224" height="56" rx="8" fill="#dbe3d8"/></svg>',
  );
const sampleFiles = [
  { id: "layout", name: "workspace-sketch.svg", mediaType: "image/svg+xml", url: imageUrl },
  {
    id: "notes",
    name: "interaction-review-and-acceptance-notes.md",
    mediaType: "text/markdown",
    url: "data:text/plain;charset=utf-8,%23%20Review",
    sizeBytes: 2480,
  },
];

export const InlineComposer = defineStory({
  id: "composer-inline",
  title: "Composer · Short drafts and multi-line editing",
  component: "ChatComposer",
  variant: "Inline editing",
  group: "Conversation components",
  groupOrder: 50,
  description:
    "Short drafts sit on the same row as actions; long drafts grow naturally. Supporting instructions appear outside the writing surface on focus. Local editing only.",
  render: () => (
    <Measure width="content">
      <ChatComposer
        layout="inline"
        hint="Enter for a new line · Use Send to submit"
        hintId="inline-composer-hint"
        onSubmit={(event) => event.preventDefault()}
      >
        <Button variant="quiet" size="small" aria-label="Add attachment">
          <Icon name="plus" />
        </Button>
      </ChatComposer>
    </Measure>
  ),
});

export const ComposerAttachments = defineStory({
  id: "composer-attachments",
  title: "Composer attachments · Identify, remove, and keep writing",
  component: "ChatComposer",
  variant: "Attachments and draft",
  group: "Conversation components",
  groupOrder: 50,
  description:
    "Images are identified by thumbnails and files keep their names; sending saves only a local snapshot, and neither waiting nor failure loses the draft you keep editing.",
  render() {
    const draft = signal("Use this sketch to check the reading order on a narrow screen.");
    const pending = signal(false);
    const feedback = signal(
      "Local simulation. Attachments are not uploaded and messages are not sent to a service. ",
    );
    const submitted = signal("Not submitted yet.");
    const attachments = signal<Child>(null);
    let files = [...sampleFiles];
    let preview: HTMLDialogElement | undefined;
    const previewName = signal("");
    const previewContent = signal<Child>(null);
    const show = (file: (typeof sampleFiles)[number]) => {
      previewName.value = file.name;
      previewContent.value = file.mediaType.startsWith("image/") ? (
        <img src={file.url} alt={file.name} style={{ maxWidth: "100%", maxHeight: "50vh" }} />
      ) : (
        <p>
          Check the narrow-screen reading order, long file names, and continued editing. Shows a
          built-in review record; no local file is read.
        </p>
      );
      preview?.showModal();
    };
    const refresh = () => {
      attachments.value = files.length ? (
        <ChatAttachments
          label="Pending attachments"
          items={files.map((file) => ({
            ...file,
            onPreview: () => show(file),
            onRemove: () => {
              files = files.filter((entry) => entry.id !== file.id);
              refresh();
              feedback.value = `Removed ${file.name}. The draft is unchanged.`;
            },
          }))}
        />
      ) : null;
    };
    refresh();
    return (
      <Measure width="content">
        <Stack gap="relaxed">
          <Stack gap="compact">
            <strong>Check the reading order in the workspace</strong>
            <span>Confirm the attached materials first, then write down what to move forward.</span>
          </Stack>
          <ChatComposer
            value={draft}
            attachments={attachments}
            submitDisabled={pending}
            inputLabel="Working draft"
            hint="You can keep editing while waiting for a result; removing an attachment only affects the next submission."
            hintId="input-attachment-hint"
            onInput={(event) => {
              draft.value = (event.target as HTMLTextAreaElement).value;
            }}
            onSubmit={(event) => {
              event.preventDefault();
              if (pending.value) return;
              submitted.value = `This submission: ${draft.value} · ${files.length} attachment${files.length === 1 ? "" : "s"}`;
              pending.value = true;
              feedback.value =
                "Simulating locally; you can keep editing the next draft while waiting.";
            }}
          >
            <Button
              variant="quiet"
              size="small"
              onClick={() => {
                files = [...sampleFiles];
                refresh();
                feedback.value = "Restored the two built-in sample attachments.";
              }}
            >
              <Icon name="paperclip" />
              Restore sample attachments
            </Button>
          </ChatComposer>
          <Stack gap="compact">
            <p data-submitted-snapshot>{submitted}</p>
            <Inline>
              <Button
                variant="outline"
                size="small"
                onClick={() => {
                  if (!pending.value) return;
                  pending.value = false;
                  feedback.value =
                    "Simulated send failure. The latest draft and current attachments were kept; you can send again.";
                }}
              >
                Simulate failure
              </Button>
              <Button
                variant="quiet"
                size="small"
                onClick={() => {
                  if (!pending.value) return;
                  pending.value = false;
                  feedback.value =
                    "Simulated send success. The latest draft and current attachments are still kept.";
                }}
              >
                Simulate success
              </Button>
            </Inline>
            <Note role="status">{feedback}</Note>
          </Stack>
          <Dialog
            ref={(element: HTMLDialogElement) => {
              preview = element;
            }}
            labelledBy="input-preview-title"
          >
            <DialogPanel
              header={
                <DialogHeader
                  title={previewName}
                  titleId="input-preview-title"
                  description="Built-in material preview"
                />
              }
            >
              <Stack gap="normal">
                {previewContent}
                <Inline justify="end">
                  <Button variant="outline" onClick={() => preview?.close()}>
                    Back to draft
                  </Button>
                </Inline>
              </Stack>
            </DialogPanel>
          </Dialog>
        </Stack>
      </Measure>
    );
  },
});

export const SentAttachments = defineStory({
  id: "attachments-sent",
  title: "Sent attachments · Materials you can revisit",
  component: "ChatAttachments",
  variant: "Sent materials",
  group: "Conversation components",
  groupOrder: 50,
  description: "Sent materials keep preview and download; no draft-removal action is offered.",
  render: () => (
    <Measure width="content">
      <Stack gap="compact">
        <strong>Workspace reading order</strong>
        <p>
          The attachments are the basis for this discussion. Open the image to see its original
          proportions, and download the record to revisit the checked items.
        </p>
        <ChatAttachments label="Sent materials" items={sampleFiles} />
      </Stack>
    </Measure>
  ),
});
