# 图片加载：同一张图片为什么等得更久

这是一件约 3–5 分钟的完整互动讲解，不是组件杂项集。比较同一原创插画的 PNG/JPEG 编码，调整传输速度，再查看受控本地加载的真实录屏，最后讨论文件大小、可接受细节与实际测量的关系。

想从最少代码写讲稿，先看 [MDX 作者示例](../presentation/README.md)。完整英语课件分别是 [Protecting pandas](../protecting-pandas/README.md) 和 [Sunshine Welcome](../sunshine-welcome/README.md)，它们独立保留，没有复制到这里。

## 看作品

同版本包构建与依赖就绪后，从仓库根运行：

```sh
bun examples/image-loading/build.ts
bun examples/image-loading/serve.ts
```

打开 `http://127.0.0.1:13009/`；Ctrl-C 停止。`PORT=13049` 可指定其他端口，先核实占用。源码变动后重建并刷新；这是 JSX 自定义互动作品，不承诺 HMR。固定浅色纸面与 16:9 逻辑画布沿用原构图，窄宿主整体缩放。

| 页 id      | 讲解与操作                                       |
| ---------- | ------------------------------------------------ |
| opening    | 提出“同图、不同等待”的问题                       |
| compare    | 比较两种编码的尺寸、实测字节与细节损失           |
| experiment | 调整网速，逐步展示公式和传输估算动画             |
| evidence   | 播放真实受控加载录屏，说明公式遗漏；返回保留参数 |
| summary    | 用当前网速归纳选择与测量原则，可回到实验核对     |

直达示例：`/?slide=experiment&step=3&speed=71`。滑杆方向键仅调网速；目录、前后页和页内按钮共用一个位置 Signal。跨页保留速度与视频时间，Reset experiment 才重置速度；整页刷新开启新会话，媒体回访保持暂停。

## 从哪里学代码

```text
image-loading/
├── deck.tsx                   # 五页内容、会话状态、跳页和视频时间恢复
├── transfer-estimate.tsx      # 本作品专用动画；响应活动许可和 reduced motion
├── assets.ts + styles.ts      # 实测图片事实/估算函数，与本作品视觉
├── index.html + main.tsx      # 正式浏览器宿主
├── build.ts + serve.ts        # 观众产物构建和本地 HTTP
├── assets/                    # 两种编码、静音录屏、字幕、来源和实际录制条件
├── scripts/                   # 生成插画、重录证据、显式导出源码
├── tests/                     # 四项作品交付回归与 preview/ 同源审阅夹具
└── records/                   # 历史迭代与检查点 hash；不是当前文件布局清单
```

先读 deck.tsx 的五页顺序与一场会话的数据，再读 transfer-estimate.tsx 的活动许可与 RAF 清理。播放器、Reveal 与媒体生命周期来自 `meowslides`；通用 UI 来自 `meowtail`，没有第二套播放器。专用传输动画不升成通用组件。

通用“一个音轨跨两页”演示已归 [PresentationAudio story](../../packages/meowslides/stories/presentation-audio.stories.tsx)，使用演示展板查看。它不属于图片加载叙事，正式作品不再含音乐分支或音频资源。

## 审阅与回归

四个同源预览只审阅这件作品，位于 tests/preview；静态夹具从 `active=false` 开始，互动夹具须显式 Activate preview 后才允许动画或媒体运行：

```sh
bun node_modules/.bin/meowbook check --config examples/image-loading/tests/preview/meowbook.config.ts
bun node_modules/.bin/meowbook serve --config examples/image-loading/tests/preview/meowbook.config.ts --port 13010 --capture
bun node_modules/@playwright/test/cli.js test --config examples/image-loading/tests/playwright.config.ts
```

四项交付回归覆盖速度/结论跨页、滑杆键盘、视频位置恢复与结束不翻页、冷启动无外网、全部图片/视频/字幕，以及 normal/reduced motion 直达状态。组件通用音轨合同归包内 browser 测试，不混入作品回归。

## 素材与事实边界

来源和授权见 [assets/NOTICES.md](assets/NOTICES.md)，实际录制条件见 [assets/recording.json](assets/recording.json)。两张图均 2200×1400，PNG 3,634,345 bytes，JPEG 68,426 bytes；有损细节不同，不把这个比例推广为所有图片的规律。

估算 `seconds = bytes × 8 ÷ (Mbit/s × 1,000,000)` 使用十进制单位，只代表未缓存、固定吞吐的纯传输时间，忽略延迟、解码、服务器和变化。12 秒静音 VP8 录屏来自浏览器真实本地请求；服务器每 70ms 发送 32KiB，是受控说明，不是公网性能基准。英文字幕和常显说明保留。字体使用系统 sans-serif，不下载外部字体。

```sh
bun examples/image-loading/scripts/generate-images.ts
bun examples/image-loading/scripts/record-transfer.ts
```

生成/重录是维护工具，不在观众端运行；录屏需要已有 Playwright Chromium 与 FFmpeg。改素材后必须重测字节并更新事实，不能拿旧记录冒充新测量。records/iteration.md 和 revision.json 绑定原检查点及旧路径，故原样保存 hash；现行结构以本 README 为准。

## 观众产物与可编辑源分开

普通 build 只输出 dist/ 中的浏览器资源、manifest、来源和启动说明，不再复制整个源码、测试夹具和 workspace 锁文件。静态 HTTP 可提供该目录；没有验证双击 file URL。

需要单独交付可编辑快照时显式运行：

```sh
bun examples/image-loading/scripts/export-source.ts
```

工具按明确源清单输出到忽略目录 artifacts/image-loading-source/，保留有价值的素材制作与测试工具，跳过 dist、测试结果和旧导出。workspace-reference 仅记录同版本根 package.json/bun.lock；快照需放回同版本 checkout，不冒充独立 npm 工程。
