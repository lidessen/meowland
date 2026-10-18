# 演示实验场：同一张图片为什么有时等很久

作品选定固定浅色纸面与控件，系统深色偏好不改变该作品的颜色对比。

这是保留的复杂浏览器作品，也是共享演示组件的同源验收实验场。最短作者入口见 [MDX 示例](../presentation/README.md)。桌面浏览器、16:9 逻辑画布，约 3–5 分钟；内容、视觉、素材与互动在同一个可运行粗稿上修改。没有 PPT/PDF 导出、编辑器、资产服务或 HMR。

## 启动正式作品

先在 **Meowland 仓库根**使用已安装的 Bun 1.4.2 和锁定依赖，构建当前源码（新组件尚未发布，不能安装旧 npm 版本冒充本轮产物）：

```sh
bun run build
bun examples/presentation-lab/build.ts
bun examples/presentation-lab/serve.ts
```

打开 `http://127.0.0.1:13009/`。停止服务用 Ctrl-C；`PORT=13019 bun examples/presentation-lab/serve.ts` 可改端口。修改源码后重新构建并刷新，没有热更新。首次安装按根 README 的 `bun install`，断网验收前必须备好 Bun 与依赖。

正式入口是 `index.html` → `main.tsx` → `talk.tsx`；构建输出在被忽略的 `dist/`。Bun 将文件 import 引用的图片、视频、字幕和音频纳入构建图，不依赖开发服务器或 Meowbook。任意静态 HTTP 服务均可提供 `dist/`，没有验证双击 `file://` 入口。

直达同源状态：

- `http://127.0.0.1:13009/?slide=experiment&step=3&speed=71`：实验第 3 步、滑杆行程 70%（范围 1–101，实际 71 Mbit/s）。
- `http://127.0.0.1:13009/?slide=evidence&step=1`：视频与依据。
- `http://127.0.0.1:13009/?demo=music`：独立可选音乐测试，不把音乐硬塞进叙事。

快捷键只在演示持有焦点且原控件未消费时导航；滑杆方向键用于调整速度。也可使用播放器的上一页/下一页、目录和暂停按钮。页内“Open evidence”与“Return to experiment”演示现场跳页与返回。

## Meowbook 创作预览

同一作品源由各入口分别创建会话，不共享内存或复制播放器。仓库根运行：

```sh
bun packages/meowbook/src/cli.ts list --config examples/presentation-lab/meowbook.config.ts --json
bun packages/meowbook/src/cli.ts check --config examples/presentation-lab/meowbook.config.ts
bun packages/meowbook/src/cli.ts serve --config examples/presentation-lab/meowbook.config.ts --port 13010 --capture
```

- `image-talk-opening`、`image-talk-experiment`、`image-talk-evidence` 是明确 `active=false` 的静态审阅夹具，动画显示代表态，媒体不播放。
- `image-talk-interactive` 也从 `active=false` 开始；在当前前台画布点击 **Activate preview** 后才允许协作动画和媒体运行。
- `image-talk-music` 同样显式开放许可后手动播放。

宿主许可不能只靠 `document.visibilityState` 推测。Meowbook 后台检查 iframe 也会执行 story；这些入口首次挂载不运行时间副作用。`ready` 等待实际在场图片解码和本地字体，不宣称全部媒体已可播放。

## 作品、事实与素材

五个稳定页 id 为 `opening`、`compare`、`experiment`、`evidence`、`summary`。每场作品由 `createImageTalk` 创建一次位置 Signal、网速 Signal、视频时间。翻页卸载页面资源，但参数仍属于这场会话；回退不撤销实验。**Reset experiment** 才把速度恢复 8 Mbit/s；整页刷新开启新会话，不做持久化。

- 图片是同一原创程序插画的 **PNG 与 JPEG 编码版本**，不是摄影、事实证据或生成式模型输出。均为 2200 × 1400；文件实测 3,634,345 与 68,426 bytes。JPEG 的细颗粒和边缘被平滑，不能声称画质相同，也不能从此图推广任意照片的压缩比。
- 公式为 `seconds = bytes × 8 ÷ (Mbit/s × 1,000,000)`。这是未缓存响应、固定吞吐下的纯传输估算，忽略往返、服务端、解码与网络变化。热缓存可避免传输，不能称其为所有真实加载的下限。所有单位为十进制。
- 原创互动条形动画响应活动许可并清理 RAF；减少动态效果时直接显示完成代表态。它随公式演示，不冒充实时测网速。
- 12 秒静音 VP8 WebM 记录浏览器真实请求/解码这两个本地文件。服务端每 70ms 发一个 32KiB chunk，故意控制等待，**不是公网性能基准**。本次记录 PNG 约 8.08s、JPEG 约 0.30s；条件、浏览器版本与实际结果见 [recording.json](records/recording.json)。有英文 VTT 字幕与常显文字替代。
- 视频回访恢复上次时间点（包含结束点），保持暂停；继续或重播由用户手动启动。媒体结束不翻页，叙事步骤不决定媒体时钟。
- 独立音乐入口使用原创 6 秒低音量正弦声、原生控制，手动播放。根音频跨两页保留，退出作品释放，不建音轨平台。
- 字体故意使用操作系统本地 sans-serif，不下载或再分发字体；不同系统允许选择不同字体。离线验收检查实际排版，不能只看 fonts.ready。

完整来源与许可见 [assets/NOTICES.md](assets/NOTICES.md)。素材生成可在仓库环境运行 `bun examples/presentation-lab/scripts/generate-images.ts`，再按脚本说明执行 FFmpeg JPEG 编码；更改图后必须重新测字节并更新 `assets.ts`。录屏重建用 `bun examples/presentation-lab/scripts/record-transfer.ts`，需本机 Playwright Chromium 与 FFmpeg。素材生成工具不是观众端依赖。

## 一次局部迭代与复验

当前作品版本 `image-waiting-b3`。先形成开场、左右 B 排版与最难实验页，图片暂可占位；随后换入原创真实两图、测量 bytes、加入真实本地加载录屏。保留 B 排版时只改结论与相关图，不重写整套结构。修订记录见 [records/iteration.md](records/iteration.md)。

反馈使用稳定 `slideId + step + 作品版本 + 输入`，例如 `experiment / 3 / image-waiting-b3 / speed=71`。重排只改 `slides` 数组，id 不跟页序变；步骤含义变化要重新确认定位。重启预览后按 URL/夹具重放，普通 Git 检查点支持源码回退，不建设通用撤销系统。

## 交付与验收边界

`dist/` 是可运行 Web 产物，包括构建清单、来源声明和可编辑作品源快照 `source/`。源快照保留 TSX、内容 CSS、构建/启动/预览入口、真实素材、来源、生成脚本，以及本次根 `package.json` / `bun.lock` 的 workspace 参考副本；它供放回**同版本 Meowland checkout**继续编辑，不能冒充独立 npm 稳定包工程。当前新公共 API 尚未发布。原始 checkout 连同依赖是本轮完整编辑环境，Web 产物冷启动不需要 node_modules。

验收分开记录：工程检查、五个浏览器压力案例、原图视觉与独立音乐测试。截图只能证明拍摄状态，不代替视频播放、键盘、快速导航、后台/隐藏/迟到 play、跨页实验、正式目录冷启动和无外网资源验证。适用命令与执行结果以父任务最终回执和测试 owner 的独立测试为准，本文不把计划写成已通过。

## 独立包与实验场职责

播放、步骤、媒体与演示主题从 `meowslides` 公共入口消费，通用 UI 从 `meowtail` 消费。
正式宿主与 Meowbook 预览均安装两个 registry，并使用完整 `presentationTheme`；没有复制播放器实现。
这里保留图像生成、可重复录屏、主题构图、URL 状态夹具和交付快照，作为高级组合与回归场景。
这些文件不是每份普通讲稿必须复制的样板；新作品从 `examples/presentation/slides.mdx` 开始。
