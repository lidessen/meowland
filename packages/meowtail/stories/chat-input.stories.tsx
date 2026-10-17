import { h, signal, type Child } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Button,
  ChatAttachments,
  ChatComposer,
  Container,
  Dialog,
  DialogHeader,
  DialogPanel,
  Icon,
  Inline,
  Stack,
} from "meowtail";

const imageUrl =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="240" viewBox="0 0 360 240"><rect width="360" height="240" fill="#edf1ec"/><rect x="24" y="28" width="72" height="184" rx="8" fill="#c5cec2"/><rect x="112" y="28" width="224" height="112" rx="8" fill="#fff"/><rect x="112" y="156" width="224" height="56" rx="8" fill="#dbe3d8"/></svg>',
  );
const sampleFiles = [
  { id: "layout", name: "工作区草图.svg", mediaType: "image/svg+xml", url: imageUrl },
  {
    id: "notes",
    name: "交互评审与验收记录.md",
    mediaType: "text/markdown",
    url: "data:text/plain;charset=utf-8,%23%20Review",
    sizeBytes: 2480,
  },
];

export const InlineComposer = defineStory({
  id: "composer-inline",
  title: "输入 · 短草稿与多行编辑",
  component: "ChatComposer",
  variant: "行内编辑",
  group: "对话组件",
  groupOrder: 50,
  description: "短草稿与操作同排，长草稿自然增高；聚焦时显示键盘提示。仅本地编辑。",
  render: () => (
    <Container width="content">
      <ChatComposer
        layout="inline"
        hint="Enter 发送 · Shift + Enter 换行"
        hintId="inline-composer-hint"
        onSubmit={(event) => event.preventDefault()}
      >
        <Button variant="quiet" size="small" aria-label="添加材料">
          <Icon name="plus" />
        </Button>
      </ChatComposer>
    </Container>
  ),
});

export const ComposerAttachments = defineStory({
  id: "composer-attachments",
  title: "输入附件 · 辨认、移除与继续写作",
  component: "ChatComposer",
  variant: "附件与草稿",
  group: "对话组件",
  groupOrder: 50,
  description:
    "图片用缩略图辨认，文件保留名称；发送只保存本地快照，等待与失败都不丢失继续编辑的草稿。",
  render() {
    const draft = signal("结合这份草图，检查窄屏下的阅读顺序。");
    const pending = signal(false);
    const feedback = signal("本地模拟。附件不会上传，消息不会发送到服务。 ");
    const submitted = signal("尚未提交。");
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
        <p>检查窄屏阅读顺序、长文件名和继续编辑。此处展示内置评审记录，未读取本地文件。</p>
      );
      preview?.showModal();
    };
    const refresh = () => {
      attachments.value = files.length ? (
        <ChatAttachments
          label="待发送附件"
          items={files.map((file) => ({
            ...file,
            onPreview: () => show(file),
            onRemove: () => {
              files = files.filter((entry) => entry.id !== file.id);
              refresh();
              feedback.value = `已移除 ${file.name}。草稿保持不变。`;
            },
          }))}
        />
      ) : null;
    };
    refresh();
    return (
      <Container width="content">
        <Stack gap="relaxed">
          <Stack gap="compact">
            <strong>检查工作区的阅读顺序</strong>
            <span>先确认附带材料，再写下要推进的事。</span>
          </Stack>
          <ChatComposer
            value={draft}
            attachments={attachments}
            submitDisabled={pending}
            inputLabel="工作草稿"
            hint="等待结果时可以继续编辑；移除附件只影响下一次提交。"
            hintId="input-attachment-hint"
            onInput={(event) => {
              draft.value = (event.target as HTMLTextAreaElement).value;
            }}
            onSubmit={(event) => {
              event.preventDefault();
              if (pending.value) return;
              submitted.value = `本次提交：${draft.value} · ${files.length} 个附件`;
              pending.value = true;
              feedback.value = "本地模拟等待中，可以继续修改下一份草稿。";
            }}
          >
            <Button
              variant="quiet"
              size="small"
              onClick={() => {
                files = [...sampleFiles];
                refresh();
                feedback.value = "已恢复两份内置示例附件。";
              }}
            >
              <Icon name="paperclip" />
              恢复示例附件
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
                  feedback.value = "模拟发送失败。最新草稿和当前附件已保留，可再次发送。";
                }}
              >
                模拟失败
              </Button>
              <Button
                variant="quiet"
                size="small"
                onClick={() => {
                  if (!pending.value) return;
                  pending.value = false;
                  feedback.value = "模拟发送成功。最新草稿和当前附件仍保留。";
                }}
              >
                模拟成功
              </Button>
            </Inline>
            <p role="status">{feedback}</p>
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
                  description="内置材料预览"
                />
              }
            >
              <Stack gap="normal">
                {previewContent}
                <Inline justify="end">
                  <Button variant="outline" onClick={() => preview?.close()}>
                    返回草稿
                  </Button>
                </Inline>
              </Stack>
            </DialogPanel>
          </Dialog>
        </Stack>
      </Container>
    );
  },
});

export const SentAttachments = defineStory({
  id: "attachments-sent",
  title: "已发送附件 · 作为可回看的材料",
  component: "ChatAttachments",
  variant: "已发送材料",
  group: "对话组件",
  groupOrder: 50,
  description: "已发送材料保留查看与下载，不再提供移除草稿操作。",
  render: () => (
    <Container width="content">
      <Stack gap="compact">
        <strong>工作区阅读顺序</strong>
        <p>附件是这次讨论的依据。打开图片查看原始比例，下载记录回看检查项目。</p>
        <ChatAttachments label="已发送材料" items={sampleFiles} />
      </Stack>
    </Container>
  ),
});
