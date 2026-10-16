import { uiTokens } from "meowui/theme";
import { h } from "meowjsx";
import { defineStory } from "meowbook";
import {
  FieldGroup,
  Field,
  Input,
  Select,
  AspectRatio,
  Separator,
  Tooltip,
  Button,
  Stack,
  Inline,
  Container,
} from "meowui";

export const FieldGroups = defineStory({
  id: "field-group",
  title: "表单分组 · 标题与整组禁用",
  component: "FieldGroup",
  variant: "字段关系",
  group: "表单输入",
  groupOrder: 20,
  description: "使用原生 fieldset/legend 表达同组字段；整组不可用时，输入与选择一起遵守表单语义。",
  covers: ["FieldGroup", "Field", "fieldset", "disabled"],
  render: () => (
    <Container width="narrow">
      <form>
        <Stack gap="relaxed">
          <FieldGroup
            legend="项目通知"
            description="选择接收工作完成提醒的方式。"
            descriptionId="notification-help"
          >
            <Field label="接收地址" htmlFor="notification-email">
              <Input id="notification-email" type="email" placeholder="you@example.com" />
            </Field>
            <Field label="提醒频率" htmlFor="notification-frequency">
              <Select id="notification-frequency">
                <option>仅在需要关注时</option>
                <option>每次工作完成</option>
              </Select>
            </Field>
          </FieldGroup>
          <Separator />
          <FieldGroup
            legend="组织托管设置"
            description="这组设置由组织管理，当前不可修改。"
            disabled
          >
            <Field label="组织名称" htmlFor="managed-name">
              <Input id="managed-name" value="Meowland" />
            </Field>
            <Field label="可见范围" htmlFor="managed-visibility">
              <Select id="managed-visibility">
                <option>仅项目成员</option>
              </Select>
            </Field>
          </FieldGroup>
        </Stack>
      </form>
    </Container>
  ),
});
export const MediaRatio = defineStory({
  id: "aspect-ratio",
  title: "媒体比例 · 横图与方图",
  component: "AspectRatio",
  variant: "按容器适应",
  group: "导航与布局",
  groupOrder: 40,
  description: "比例控制媒体占位，图片自行选择裁切方式；宽度随父容器变化。",
  render: () => (
    <Container>
      <Stack gap="relaxed">
        {[16 / 9, 1].map((ratio) => (
          <AspectRatio ratio={ratio} style={{ maxWidth: ratio === 1 ? "240px" : "100%" }}>
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "grid",
                placeItems: "center",
                background: `${uiTokens.surfaceMuted}`,
                borderRadius: `${uiTokens.controlRadius}`,
                color: `${uiTokens.mutedForeground}`,
              }}
            >
              {ratio === 1 ? "1 : 1 · 项目封面" : "16 : 9 · 演示预览"}
            </div>
          </AspectRatio>
        ))}
      </Stack>
    </Container>
  ),
});
export const Separators = defineStory({
  id: "separator",
  title: "分隔 · 内容与工具组",
  component: "Separator",
  variant: "横向与纵向",
  group: "导航与布局",
  groupOrder: 40,
  description: "分隔线表达内容边界，默认不新增可聚焦操作。",
  render: () => (
    <Container width="narrow">
      <Stack gap="relaxed">
        <strong>工作记录</strong>
        <p>变更内容与后续操作各自成组。</p>
        <Separator />
        <Inline>
          <Button variant="quiet">查看变更</Button>
          <Separator orientation="vertical" style={{ height: "20px" }} />
          <Button variant="quiet">复制链接</Button>
        </Inline>
      </Stack>
    </Container>
  ),
});
export const Tooltips = defineStory({
  id: "tooltip",
  title: "辅助提示 · 悬停与键盘焦点",
  component: "Tooltip",
  variant: "说明与关闭",
  group: "浮层与反馈",
  groupOrder: 30,
  description:
    "鼠标稍作停留时补充说明，键盘聚焦立即显示；Escape 关闭且焦点保留。必要信息始终留在页面。",
  render: () => (
    <Container width="narrow">
      <Stack gap="relaxed" align="start">
        <p>独立预览会保留当前工作页面。</p>
        <Tooltip
          id="preview-help"
          content="在独立窗口查看当前组件，便于比较不同尺寸。"
          trigger={(props) => (
            <Button {...props} variant="outline">
              独立预览
            </Button>
          )}
        />
        <Input aria-label="下一项" placeholder="Tab 移动到这里会关闭提示" />
      </Stack>
    </Container>
  ),
});
