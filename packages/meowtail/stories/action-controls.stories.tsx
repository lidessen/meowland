import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Button, ChoiceSelect, Icon, IconButton, Input, Select, Stack, Toolbar } from "meowtail";

export const IconButtonStory = defineStory({
  id: "icon-button",
  title: "图标按钮 · 紧凑操作",
  group: "基础控件",
  groupOrder: 10,
  component: "IconButton",
  variant: "操作与可访问名称",
  description: "图标按钮保留明确的可访问名称；默认只承担一个紧凑操作，不把文字塞进图标里。",
  covers: ["IconButton", "label", "small / default", "disabled"],
  render: () => (
    <Stack gap="relaxed" className="workshop-constrained">
      <Toolbar label="附件与视图操作">
        <IconButton size="small" label="添加附件">
          <Icon name="paperclip" />
        </IconButton>
        <IconButton size="small" label="搜索">
          <Icon name="search" />
        </IconButton>
        <IconButton label="打开详情">
          <Icon name="arrow-up-right" />
        </IconButton>
        <IconButton label="暂不可用的操作" disabled>
          <Icon name="wrench" />
        </IconButton>
      </Toolbar>
      <p className="workshop-note">鼠标看到的是图标，读屏和键盘用户得到的是明确动作名称。</p>
    </Stack>
  ),
});

export const ToolbarStory = defineStory({
  id: "toolbar",
  title: "工具栏 · 相关操作",
  group: "导航与布局",
  groupOrder: 40,
  component: "Toolbar",
  variant: "横向、纵向与混合控件",
  description: "动作使用方向键切换；输入和选择控件保留自己的键盘规则，空间不足时自然换行。",
  covers: ["Toolbar", "role=toolbar", "horizontal", "vertical", "mixed controls", "roving actions"],
  render: () => (
    <Stack gap="relaxed" className="workshop-constrained">
      <section className="workshop-stack">
        <h2 className="workshop-section-title">预览操作</h2>
        <Toolbar label="预览操作">
          <Button size="small">桌面</Button>
          <Button variant="quiet" size="small">
            移动端
          </Button>
          <IconButton size="small" label="重置预览">
            <Icon name="refresh-cw" />
          </IconButton>
        </Toolbar>
      </section>
      <section className="workshop-stack">
        <h2 className="workshop-section-title">筛选与预览</h2>
        <Toolbar label="筛选与预览">
          <Button size="small">更新预览</Button>
          <Input aria-label="筛选预览" placeholder="输入筛选文字" style={{ width: "18ch" }} />
          <Select aria-label="预览标注" style={{ width: "auto" }}>
            <option value="off" selected>
              关闭标注
            </option>
            <option value="controls">控件尺寸</option>
            <option value="spacing">间距布局</option>
          </Select>
          <ChoiceSelect
            id="toolbar-appearance"
            aria-label="预览外观"
            options={[
              { value: "light", label: "浅色" },
              { value: "dark", label: "深色" },
            ]}
            defaultValue="light"
          />
          <Button variant="quiet" size="small">
            恢复默认预览
          </Button>
          <a href="#toolbar-help">查看工具栏说明</a>
        </Toolbar>
        <p id="toolbar-help" className="workshop-note">
          动作共用一个 Tab 停靠，编辑控件仍可独立访问。
        </p>
      </section>
      <section className="workshop-stack">
        <h2 className="workshop-section-title">独立动作组</h2>
        <Toolbar label="编辑与画布">
          <Button size="small">保存布局</Button>
          <Button size="small" tabIndex={-1}>
            程序入口
          </Button>
          <Toolbar label="画布缩放">
            <IconButton size="small" label="缩小预览">
              <Icon name="minus" />
            </IconButton>
            <IconButton size="small" label="放大预览">
              <Icon name="plus" />
            </IconButton>
          </Toolbar>
          <Button size="small">取消编辑</Button>
        </Toolbar>
      </section>
      <section className="workshop-stack">
        <h2 className="workshop-section-title">纵向工具栏</h2>
        <Toolbar label="画布操作" orientation="vertical">
          <IconButton size="small" label="缩小画布">
            <Icon name="minus" />
          </IconButton>
          <IconButton size="small" label="放大画布">
            <Icon name="plus" />
          </IconButton>
        </Toolbar>
      </section>
    </Stack>
  ),
});
