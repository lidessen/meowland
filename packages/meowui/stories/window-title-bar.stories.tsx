import { h, type Child } from "meowjsx";
import { defineStory } from "meowbook";
import { Icon, IconButton, WindowTitleBar } from "meowui";
import { SchemePair } from "./scheme-pair";

interface ShellRoom {
  height: string;
  left: string;
  right: string;
}

/** What a desktop shell reports for each window style (values measured from MyGo 0.3.6). */
const rooms = {
  hidden: { height: "32px", left: "69px", right: "0px" },
  hiddenInset: { height: "66px", left: "79px", right: "0px" },
  fullScreen: { height: "0px", left: "0px", right: "0px" },
} as const satisfies Record<string, ShellRoom>;

function TrafficLights({ height, left }: { height: string; left: string }): Child {
  const dot = (color: string) => (
    <span
      style={{ width: "12px", height: "12px", borderRadius: "50%", background: color }}
      aria-hidden="true"
    />
  );
  return (
    <span
      data-fixture="traffic-lights"
      style={{
        position: "absolute",
        top: `calc((${height} - 12px) / 2)`,
        left: "13px",
        display: left === "0px" ? "none" : "flex",
        gap: "8px",
        zIndex: "2",
      }}
    >
      {dot("#ff5f57")}
      {dot("#febc2e")}
      {dot("#28c840")}
    </span>
  );
}

/** A window frame that sets the variables the shell would set, with the native controls drawn. */
function Window({
  room,
  title,
  width,
  actions = true,
}: {
  room: ShellRoom;
  title: string;
  width?: number;
  actions?: boolean;
}): Child {
  return (
    <div
      style={{
        position: "relative",
        width: width ? `${width}px` : "100%",
        maxWidth: "100%",
        overflow: "hidden",
        borderRadius: "10px",
        border: "0.5px solid var(--line-edge)",
        background: "var(--ui-background)",
        "--mygo-titlebar-height": room.height,
        "--mygo-titlebar-inset-left": room.left,
        "--mygo-titlebar-inset-right": room.right,
      }}
    >
      <TrafficLights height={room.height} left={room.left} />
      <WindowTitleBar
        title={title}
        leading={
          actions ? (
            <IconButton size="small" label="返回">
              <Icon name="chevron-left" />
            </IconButton>
          ) : null
        }
        trailing={
          actions ? (
            <IconButton size="small" label="搜索">
              <Icon name="search" />
            </IconButton>
          ) : null
        }
      />
      <div
        style={{
          height: "88px",
          padding: "16px",
          color: "var(--ui-subtle-foreground)",
          fontSize: "13px",
        }}
      >
        窗口内容
      </div>
    </div>
  );
}

export const WindowTitleBarStory = defineStory({
  id: "window-title-bar",
  title: "窗口标题栏 · 桌面外壳",
  group: "导航与布局",
  groupOrder: 42,
  component: "WindowTitleBar",
  variant: "浅色与深色",
  description:
    "桌面外壳隐藏原生标题栏后，页面自己的顶栏。外壳通过 --mygo-titlebar-height 与左右 inset 变量报告红绿灯占用的空间，标题栏据此让位；整条标题栏是拖动区域，其中的按钮、链接与输入框保持可点击。场景里手动设置这些变量并画出红绿灯，浏览器中没有外壳时变量回退为 32px 的普通顶栏。",
  covers: [
    "WindowTitleBar clears the traffic lights through --mygo-titlebar-inset-left",
    "drag area with controls opted out",
    "light and dark",
  ],
  render() {
    return (
      <SchemePair width={420}>
        {(scheme) => (
          <Window
            room={rooms.hidden}
            title={`Meowland · ${scheme === "light" ? "浅色" : "深色"}`}
          />
        )}
      </SchemePair>
    );
  },
});

export const WindowTitleBarRoomStory = defineStory({
  id: "window-title-bar-room",
  title: "窗口标题栏 · 外壳留白与窄窗口",
  group: "导航与布局",
  groupOrder: 43,
  component: "WindowTitleBar",
  variant: "留白与窄窗口",
  description:
    "TitleBarHidden 为 32px 高、左侧 69px；TitleBarHiddenInset 为 66px、79px；全屏时外壳回报 0px，标题栏随之收起。窄窗口中标题省略，两侧操作保留；没有外壳时（浏览器）回退为 32px 普通顶栏。",
  covers: [
    "TitleBarHidden room",
    "TitleBarHiddenInset room",
    "full screen collapses the bar",
    "long title ellipsis in a narrow window",
    "browser fallback without shell variables",
  ],
  render() {
    return (
      <div style={{ display: "grid", gap: "16px", maxWidth: "720px" }}>
        <Window room={rooms.hidden} title="TitleBarHidden · 32px / 69px" />
        <Window room={rooms.hiddenInset} title="TitleBarHiddenInset · 66px / 79px" />
        <Window room={rooms.fullScreen} title="全屏 · 0px" />
        <Window
          room={rooms.hidden}
          width={320}
          title="一个很长很长的窗口标题用来检查窄窗口里的省略行为"
        />
        <div
          style={{
            overflow: "hidden",
            borderRadius: "10px",
            border: "0.5px solid var(--line-edge)",
          }}
        >
          <WindowTitleBar
            title="没有外壳变量 · 回退"
            trailing={
              <IconButton size="small" label="搜索">
                <Icon name="search" />
              </IconButton>
            }
          />
        </div>
      </div>
    );
  },
});
