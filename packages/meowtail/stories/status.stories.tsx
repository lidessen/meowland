import { h } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Button,
  Field,
  Inline,
  Input,
  ListGroup,
  ListRow,
  ResourceCard,
  Stack,
  Status,
} from "meowtail";
import { SchemePair } from "./scheme-pair";

export const StatusStory = defineStory({
  id: "status",
  title: "状态 · 文字、标记与页面插槽",
  group: "基础控件",
  groupOrder: 12,
  component: "Status",
  covers: [
    "required visible label",
    "ListRow status",
    "ResourceCard status",
    "long label",
    "light and dark",
  ],
  render: () => (
    <SchemePair>
      {(scheme) => (
        <Stack gap="relaxed">
          <Inline gap="normal">
            <Status state="processing" label="正在推进" />
            <Status state="returned" label="执行已返回" />
            <Status state="warning" label="等待回答" />
            <Status state="danger" label="连接失败" />
            <Status state="unknown" label="状态待核" />
          </Inline>
          <ListGroup>
            <ListRow
              title="模型来源"
              description="选择可执行的模型连接"
              status={<Status state="success" label="正在使用" />}
              actions={
                <Button size="small" variant="quiet">
                  配置
                </Button>
              }
            />
            <ListRow title="本机服务" status={<Status state="unknown" label="尚无版本" />} />
          </ListGroup>
          <ResourceCard
            title="消息扩展"
            subtitle="Channel"
            status={<Status state="success" label="已启用" />}
            actions={<Button size="small">查看设置</Button>}
          />
          <Status
            state="danger"
            label="Connection failed for development-workspace-with-a-long-identifier; retry after checking its configuration."
          />
          <Field label="连接名称" htmlFor={`status-connection-${scheme}`}>
            <Input id={`status-connection-${scheme}`} value="Development workspace" />
          </Field>
        </Stack>
      )}
    </SchemePair>
  ),
});
