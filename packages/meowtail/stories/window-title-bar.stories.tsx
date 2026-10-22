import { h, type Child } from "meowjsx";
import { defineStory } from "meowbook";
import { Icon, IconButton, WindowTitleBar } from "meowtail";
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
        border: "1px solid var(--ui-line-edge)",
        background: "var(--ui-surface-canvas)",
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
            <IconButton size="small" label="Back">
              <Icon name="chevron-left" />
            </IconButton>
          ) : null
        }
        trailing={
          actions ? (
            <IconButton size="small" label="Search">
              <Icon name="search" />
            </IconButton>
          ) : null
        }
      />
      <div
        style={{
          height: "88px",
          padding: "16px",
          color: "var(--ui-ink-tertiary)",
          fontSize: "13px",
        }}
      >
        Window content
      </div>
    </div>
  );
}

export const WindowTitleBarStory = defineStory({
  id: "window-title-bar",
  title: "Window title bar · Desktop shell",
  group: "Navigation and layout",
  groupOrder: 42,
  component: "WindowTitleBar",
  variant: "Light and dark",
  description:
    "The page's own top bar once a desktop shell hides the native title bar. The shell reports the traffic-light space through the --mygo-titlebar-height and left/right inset variables, and the title bar makes room for it; the whole title bar is a drag area whose buttons, links and inputs stay clickable. The scenario sets these variables and draws the traffic lights by hand; in a browser with no shell they fall back to a 32px ordinary top bar.",
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
            title={`Meowland · ${scheme === "light" ? "Light" : "Dark"}`}
          />
        )}
      </SchemePair>
    );
  },
});

export const WindowTitleBarRoomStory = defineStory({
  id: "window-title-bar-room",
  title: "Window title bar · Shell room and narrow windows",
  group: "Navigation and layout",
  groupOrder: 43,
  component: "WindowTitleBar",
  variant: "Shell room and narrow window",
  description:
    "TitleBarHidden is 32px high with a 69px left inset; TitleBarHiddenInset is 66px and 79px. In full screen the shell reports 0px and the title bar collapses. In a narrow window the title is clipped and the actions on both sides stay; without a shell (in a browser) it falls back to a 32px ordinary top bar.",
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
        <Window room={rooms.fullScreen} title="Full screen · 0px" />
        <Window
          room={rooms.hidden}
          width={320}
          title="A very long window title used to check truncation in a narrow window"
        />
        <div
          style={{
            overflow: "hidden",
            borderRadius: "10px",
            border: "1px solid var(--ui-line-edge)",
          }}
        >
          <WindowTitleBar
            title="No shell variables · Fallback"
            trailing={
              <IconButton size="small" label="Search">
                <Icon name="search" />
              </IconButton>
            }
          />
        </div>
      </div>
    );
  },
});
