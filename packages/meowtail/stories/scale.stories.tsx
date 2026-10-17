import { h } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  ChatQuestion,
  ChoiceGroup,
  ChoiceSelect,
  Container,
  Field,
  Inline,
  Input,
  Select,
  Stack,
} from "meowtail";

export const ScaleStory = defineStory({
  id: "scale-reference",
  title: "默认尺度 · 控件与组合",
  group: "组合示例",
  component: "Stack",
  description:
    "同屏核对文字、控件、选项和容器的比例。默认样式直接来自组件主题，没有为展示单独放大或缩小。",
  covers: [
    "body and controls",
    "group/section/panel spacing",
    "nested composition",
    "long option",
    "narrow layout",
  ],
  render: () => (
    <Container width="content">
      <Stack gap="relaxed">
        <Stack gap="compact">
          <strong>先看基础控件，再看组合后的尺度</strong>
          <span>相关内容靠近，独立区域留出间隔。文字长时换行，按钮保持可辨认。</span>
          <Inline gap="compact">
            <Input aria-label="项目名称" placeholder="项目名称" />
            <Button>保存</Button>
            <Button variant="quiet">取消</Button>
          </Inline>
          <Inline gap="compact">
            <Select aria-label="原生选择" value="current">
              <option value="current">当前工作区</option>
              <option value="new">新工作区</option>
            </Select>
            <ChoiceSelect
              id="scale-select"
              aria-label="自定义选择"
              defaultValue="current"
              options={[
                { value: "current", label: "当前工作区" },
                { value: "new", label: "新工作区" },
              ]}
            />
          </Inline>
        </Stack>
        <Card>
          <CardHeader>
            <CardTitle>工作区设置</CardTitle>
            <CardDescription>独立容器内，字段与操作沿用相同控件尺度。</CardDescription>
          </CardHeader>
          <CardContent>
            <Field label="显示名称" htmlFor="scale-name">
              <Input id="scale-name" value="我的工作区" />
            </Field>
          </CardContent>
          <CardFooter>
            <Button>保存设置</Button>
            <Button variant="quiet">恢复默认</Button>
          </CardFooter>
        </Card>
        <ChatQuestion
          question="接下来如何处理这个问题？"
          questionId="scale-question"
          actions={[
            <Button>提交回答</Button>,
            <Button variant="quiet">用文字回答</Button>,
            <Button variant="quiet">取消问题</Button>,
          ]}
        >
          <ChoiceGroup
            id="scale-choice"
            label="处理方式"
            hideLabel
            options={[
              { value: "continue", label: "继续排查，保留现有工作" },
              { value: "review", label: "先查看已有结果，之后再决定是否继续处理尚未完成的部分" },
            ]}
          />
        </ChatQuestion>
      </Stack>
    </Container>
  ),
});
