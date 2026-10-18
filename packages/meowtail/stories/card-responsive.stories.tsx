import { h } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Container,
  Field,
  Inline,
  Input,
  Stack,
} from "meowtail";

export const CardResponsiveHeaderStory = defineStory({
  id: "card-responsive-header",
  title: "卡片 · 标题、操作与真实容器宽度",
  group: "基础控件",
  groupOrder: 10,
  component: "CardHeader",
  description: "宽卡和同窗窄侧栏共享标题布局；嵌套、自适应按钮卡及可选说明保持原生结构。",
  covers: ["narrow card", "sidebar", "intrinsic card", "action first", "optional description"],
  render: () => (
    <Container width="wide">
      <Stack gap="relaxed">
        <Card data-card-responsive="wide">
          <CardHeader>
            <CardTitle>
              需要核对的工作区设置与访问规则 — A long workspace configuration title
            </CardTitle>
            <CardDescription>修改将保留已有内容，检查完成后再保存。</CardDescription>
            <CardAction>
              <Button>查看完整配置</Button>
              <Button variant="quiet">复制配置链接</Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Card data-card-responsive="nested">
              <CardHeader>
                <CardTitle>默认嵌套检查项</CardTitle>
                <CardDescription>嵌入关系仍共享父级表面。</CardDescription>
              </CardHeader>
              <CardContent>
                <Field label="保留的草稿" htmlFor="card-responsive-draft">
                  <Input id="card-responsive-draft" />
                </Field>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
        <div style={{ width: "300px", maxWidth: "100%" }}>
          <Card data-card-responsive="sidebar">
            <CardHeader>
              <CardAction>
                <Button>查看详情</Button>
                <Button variant="quiet">复制链接</Button>
              </CardAction>
              <CardTitle>A long sidebar card title with meaningful information</CardTitle>
              <CardDescription>同一宽窗口内的窄区域，操作在 DOM 中位于标题之前。</CardDescription>
            </CardHeader>
          </Card>
        </div>
        <Inline align="start">
          <Card as="button" data-card-responsive="button">
            <CardHeader>
              <CardTitle>Header-only button card</CardTitle>
              <CardDescription>内容决定自然宽度。</CardDescription>
            </CardHeader>
          </Card>
          <Card data-card-responsive="intrinsic">
            <CardHeader>
              <CardTitle>Intrinsic inline card</CardTitle>
              <CardDescription>没有手写宽度。</CardDescription>
            </CardHeader>
          </Card>
        </Inline>
        <Card data-card-responsive="title-only">
          <CardHeader>
            <CardTitle>只有标题时不保留空说明行</CardTitle>
            <CardAction>
              <Button>核对结果</Button>
            </CardAction>
          </CardHeader>
        </Card>
      </Stack>
    </Container>
  ),
});
