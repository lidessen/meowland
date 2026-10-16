import { h, signal } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Button,
  Drawer,
  DialogHeader,
  Icon,
  IconButton,
  NavItem,
  Stack,
  StatusDot,
  Tag,
} from "meowui";

export const DrawerStory = defineStory({
  id: "drawer",
  title: "抽屉 · 窄屏导航",
  group: "导航与布局",
  groupOrder: 34,
  component: "Drawer",
  variant: "固定标题与独立阅读",
  description:
    "标题和关闭共用固定区域；正文独立滚动。选择目的地、Escape 或遮罩关闭后返回触发按钮。",
  covers: ["Drawer header", "body scroll", "Escape", "scrim click", "focus return"],
  render() {
    const open = signal(false);
    return (
      <Stack align="start">
        <Button
          variant="outline"
          onClick={() => {
            open.value = true;
          }}
        >
          <Icon name="menu" />
          打开导航抽屉
        </Button>
        <Drawer
          label="主导航"
          open={open}
          onOpenChange={(next) => {
            open.value = next;
          }}
          header={
            <DialogHeader
              title="Meowland"
              actions={
                <IconButton
                  label="关闭导航"
                  onClick={() => {
                    open.value = false;
                  }}
                >
                  <Icon name="x" />
                </IconButton>
              }
            />
          }
        >
          <Stack gap="compact">
            <NavItem
              label="对话"
              icon={<Icon name="message-square" />}
              active
              onClick={() => {
                open.value = false;
              }}
            />
            <NavItem
              label="记忆与知识"
              icon={<Icon name="file-text" />}
              onClick={() => {
                open.value = false;
              }}
            />
            <NavItem
              label="服务"
              icon={<Icon name="network" />}
              onClick={() => {
                open.value = false;
              }}
            />
            <NavItem
              label="通信"
              icon={<Icon name="message-square" />}
              onClick={() => {
                open.value = false;
              }}
            />
            <NavItem
              label="提醒"
              icon={<Icon name="list-checks" />}
              badge={
                <Tag kind="count" tone="warning">
                  1
                </Tag>
              }
              onClick={() => {
                open.value = false;
              }}
            />
            {Array.from({ length: 8 }, (_, i) => (
              <NavItem
                label={`已授权的示例扩展 ${i + 1}`}
                icon={<Icon name="file-text" />}
                onClick={() => {
                  open.value = false;
                }}
              />
            ))}
            <span>
              <StatusDot state="success" /> Runtime 已连接
            </span>
            <NavItem
              label="设置"
              icon={<Icon name="settings" />}
              onClick={() => {
                open.value = false;
              }}
            />
          </Stack>
        </Drawer>
      </Stack>
    );
  },
});
