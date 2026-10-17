# 浏览器交互演示首期实施回执

日期：2026-10-17。用户在设计收敛后授权实施；范围是浏览器演示、创作 skill 与一个完整样例。本轮只做本地提交、构建和验收，没有推送、npm 发布、部署、PPT/PDF 导出或 Rossovia 改造。起点 `main@1cf4011`，粗稿检查点 `9caeff43c0a5594a54a8144cfe283123c1fc2036`。未跟踪的 `data/` 没有读取、格式化、修改或加入提交。

## 已实现的最小闭环

- [创作 skill](../../.agents/skills/presentation-authoring/SKILL.md)：粗内容与字体/颜色/布局共同形成可运行稿；围绕预览修改文稿、素材和互动，保留稳定页 id、输入与步骤反馈，允许明确占位与局部 patch。
- [Meowtail 公共合同](../../packages/meowtail/README.md)：`meowtail/presentation` 提供 `Presentation`、`Reveal`、`PresentationVideo`、`PresentationAudio`、`usePresentationActivity` 与公共类型；根入口重导同一实现，`meowtail/theme` 提供主题 tokens。没有新包、core 扩展、通用 store、资产服务、编辑器或 JSON DSL。
- 位置只有一个可写 `{slideId, step}` Signal；每场作品自己创建跨页实验 signals。步骤是直接可呈现的状态，换页清理 DOM/媒体/计时器，回退不撤销实验。宿主、可见性、用户暂停、祖先 Reveal 共同决定协作副作用许可，媒体时钟独立。
- [完整作品](../../examples/presentation/README.md)：五页、约 3–5 分钟的图片传输演示，共享网速输入、简化公式、原创两种编码、真实本地加载录屏/字幕、可重播交互动画；音乐另设可选场景。正式入口和 Meowbook 审阅消费同一作品源，各自创建会话。
- 正式 `dist/` 包含 HTML、运行脚本、实际媒体、notices、清单与可编辑作品源快照。源快照明确要求放回同版本 Meowland checkout；没有伪装成可独立安装未发布 API 的工程。

## 实际创作与独立质疑

设计阶段由包边界、创作流程、媒体/交互三个独立角色与高级模型审查收敛；实施由组件、作品、skill 三个 owner 分工，测试作者独立。最后内容/视觉复核也独立于作品作者。

粗稿检查点之后真实执行了一次局部改稿：保留左右布局、所有页 id、步骤和实验 state，只修原图岸线、替换同路径 PNG/JPEG、修改总结标题和一条结论，随后重测 bytes、重录依据。前后 SHA-256 与原图证据位置见[修订记录](../../examples/presentation/records/iteration.md)及 [revision.json](../../examples/presentation/records/revision.json)。没有补造 b1、用户选过 B 或可复查的早期图片占位历史；图片占位替换流程由 skill 规定，但本作品没有保留下来的早期占位版可供验收。

真实检查发现并修复：嵌套 Reveal 泄漏、首页重复挂载、系统深色偏好导致作品对比不足、正常媒体仍显示重试按钮，以及录屏画面错误显示 0 bytes。最后两项说明浏览器断言与元数据不能代替看实际画面；旧粗稿的 11 + 5 项通过不作为最终验收。

当前作品版本 `image-waiting-b3`，PNG **3,634,345 bytes**、JPEG **68,426 bytes**；均为同一原创程序插画的 2200×1400 编码，JPEG 有损。新 WebM 是 VP8 / 960×600 / 12 秒 / 静音，实际 loopback 条件为每 70ms 一个 32KiB chunk、无缓存；PNG 约 8.08s、JPEG 约 0.30s，不是公网基准。主作者与独审实际观看完成帧和中间帧，计数、进度、图片与文件一致。

## 同版工程和浏览器结果

最终功能源码冻结后执行五包 build，再构建 b3 正式作品。后续仅格式化录屏 JSON、更新回执/审查文档；最终正式目录重新生成源快照，不改变观众代码或媒体。

| 检查                | 实际结果与边界                                                                                                                                              |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun run build`     | 通过；五包 ESM/声明与资源；不代表发布                                                                                                                       |
| `bun run typecheck` | 通过；包括新作品工程和既有平台隔离/public types                                                                                                             |
| `bun run test`      | 318 项通过，0 失败，1,968 断言，64 文件                                                                                                                     |
| 格式                | 对 Git 已跟踪/本次新增的支持文本文件显式传路径，排除 `data/`，全部通过                                                                                      |
| lint                | `bun node_modules/oxlint/bin/oxlint --deny-warnings --ignore-pattern 'data/**' .` 通过                                                                      |
| 检查命令负例        | 仓库外副本在新作品目录植入类型错误，实际 `bun run typecheck` 返回 1，并准确报该文件 TS2322；负例未进入产品源码                                              |
| 组件/同源集成浏览器 | **13/13** 通过，包括真实作品重排与真实 HTTP 404 → loading → ready 重试可见性                                                                                |
| 正式目录浏览器      | **5/5** 通过；新 context 冷启动、阻断外部请求，外部请求和非预期缺资产均为 0                                                                                 |
| 原生媒体与动画      | 真实视频解码/时间/继续/重播、字幕资源、WAV 播放/暂停/跨页、后台与失活清理；拒播和迟到 promise 竞态用必要模拟隔离                                            |
| 视觉                | 主作者与独审查看 b3 开场/总结及录屏原图；作品 owner 查看五页无溢出，深色系统偏好下作品保持选定浅色。另有 390px contain/原尺寸滚动与 reduced motion 行为检查 |

独立测试的完整命令、观察与范围见[审查记录](../../packages/meowtail/tests/browser/presentation/REVIEW.md)。正式浏览器用例命令为：

```sh
PLAYWRIGHT_CHANNEL=chrome bun run test:presentation
PLAYWRIGHT_CHANNEL=chrome bun node_modules/@playwright/test/cli.js test --config examples/presentation/tests/playwright.config.ts
```

## 包外安装态

只对本轮受影响 Meowtail 生成候选 tarball；原已发布的 JSX/CSS 0.1.0 tgz 只读取并复制作为 peers，没有重打或覆盖。候选 `meowtail@0.1.1-presentation.20261017.1` 位于本机忽略目录 `artifacts/presentation-review/packages/b3/`，SHA-256：

```text
eb9e26a113f248a55eb98411bd4020ba418a66bfba1fd6a68c576b2330e6f2f5
```

tarball 有 444 个条目，包含新的 JS/types 子路径、LICENSE/notices，不包含测试、workspace 源码兜底或 node_modules。在仓库外空目录 `/tmp/meowland-presentation-consumer-vCU88y` 用 `bun install --offline --ignore-scripts` 安装该候选及冻结的 JSX/CSS 0.1.0 peers，52 个包成功；第三方依赖使用本机 Bun 缓存，没有网络下载。依赖 realpath 均留在该目录的 node_modules，无源码 alias、父工作区依赖或逃逸 symlink。

该消费者独立类型检查 `skipLibCheck=false` 通过，再由其本地依赖构建浏览器应用。本机 Chrome 155.0.8059.85 实际检查根/子路径组件身份相等、跨入口 Signal/Context、注册主题与 1280×720 舞台、Reveal、滑杆键盘、跨页参数、真实 PCM 音频、暂停时计时器停止及卸载清理；页面错误与外部请求均为 0。机器可读结果与截图保留在同一 artifacts 子目录；验收代码也保留为 `installed-consumer.tsx`。临时测试先修正了 fixture 对布尔 data 属性的期待，不涉及产品修补。

## 运行与未覆盖边界

在仓库根、已安装锁定依赖的环境：

```sh
bun run build
bun examples/presentation/build.ts
bun examples/presentation/serve.ts
```

打开 `http://127.0.0.1:13009/`；真实实验定位 `/?slide=experiment&step=3&speed=71`，可选音乐 `/?demo=music`。修改后重新构建并刷新；没有 HMR。启动、素材来源、Meowbook 审阅与可编辑源恢复方法见作品 README。

未运行全部既有展板浏览器矩阵、Firefox/Safari、多设备/OS 字体矩阵、实体音响测量、双击 `file://` 或任意部署子目录验收。当前支持目标是桌面 Chrome 的本地静态 HTTP；窄屏观察不等于完成移动创作产品。未实现 PPTX/PDF、可视化编辑、持久化或发布。已验证浏览器运行和可编辑 TSX 源，不承诺动态能力未来能无损映射到可编辑 PPTX。用户视觉接受与后续产品取舍仍由用户反馈决定。
