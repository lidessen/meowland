import { h, signal } from "meowjsx";
import { defineStory } from "meowbook";
import { Button, Icon, Stack } from "meowtail";
import { Menu } from "../src/components/menu";
export const MenuStory = defineStory({
  id: "menu-actions",
  title: "菜单 · 分组与键盘操作",
  component: "Menu",
  group: "浮层与反馈",
  groupOrder: 30,
  description: "方向键、Home/End 移动，输入文字定位；Escape 返回触发按钮。所有操作仅更新本地回执。",
  render() {
    const feedback = signal("尚未选择操作。");
    return (
      <Stack align="start">
        <Menu
          id="story-actions"
          trigger={(bindings) => (
            <Button variant="outline" {...bindings}>
              操作
              <Icon name="chevron-down" />
            </Button>
          )}
          items={[
            {
              type: "group",
              id: "file",
              label: "文件",
              items: [
                {
                  id: "open",
                  label: "打开",
                  icon: <Icon name="file" />,
                  shortcut: "↵",
                  onSelect: () => {
                    feedback.value = "已选择打开。";
                  },
                },
                {
                  id: "copy",
                  label: "复制",
                  icon: <Icon name="copy" />,
                  onSelect: () => {
                    feedback.value = "已选择复制。";
                  },
                },
                { id: "export", label: "导出（不可用）", disabled: true, onSelect: () => {} },
              ],
            },
            { type: "separator", id: "divider" },
            {
              id: "remove",
              label: "移除",
              danger: true,
              onSelect: () => {
                feedback.value = "已选择移除样例。";
              },
            },
          ]}
        />
        <p role="status">{feedback}</p>
      </Stack>
    );
  },
});

export const NestedMenuStory = defineStory({
  id: "menu-nested",
  title: "菜单 · 嵌套与触控",
  component: "Menu",
  group: "浮层与反馈",
  groupOrder: 30,
  description: "悬停或点击展开子菜单；右键方向进入，左键方向返回，Escape 逐层关闭。",
  render() {
    const feedback = signal("尚未选择格式。");
    return (
      <Stack align="start">
        <Menu
          id="nested-actions"
          trigger={(bindings) => (
            <Button variant="outline" {...bindings}>
              格式操作
            </Button>
          )}
          items={[
            {
              id: "export",
              label: "导出格式",
              children: [
                {
                  id: "markdown",
                  label: "Markdown",
                  onSelect: () => {
                    feedback.value = "已选择 Markdown。";
                  },
                },
                { id: "disabled", label: "PDF（不可用）", disabled: true, onSelect: () => {} },
                {
                  id: "more",
                  label: "更多格式",
                  children: [
                    {
                      id: "text",
                      label: "纯文本",
                      onSelect: () => {
                        feedback.value = "已选择纯文本。";
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: "locked",
              label: "不可用子菜单",
              disabled: true,
              children: [{ id: "locked-child", label: "不可达项", onSelect: () => {} }],
            },
            {
              id: "copy",
              label: "复制",
              onSelect: () => {
                feedback.value = "已选择复制。";
              },
            },
          ]}
        />
        <p role="status">{feedback}</p>
      </Stack>
    );
  },
});
