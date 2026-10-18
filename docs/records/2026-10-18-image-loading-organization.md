# 图片加载作品整理

原 `examples/presentation-lab` 已按真实主题整理为 [examples/image-loading](../../examples/image-loading/README.md)：一件五页、约 3–5 分钟的图片加载互动讲解，而非通用组件杂项集。MDX 起手稿仍在 examples/presentation，Panda 完整课件仍在 examples/protecting-pandas，Sunshine 也独立保留；没有复制或修改教学内容。

## 归属与依据

| 原混合职责                              | 现行位置                                                                             | 处理理由                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| talk.tsx 中五页叙事/会话                | image-loading/deck.tsx                                                               | 编码比较、调网速、录屏依据、总结构成完整作品；页 id、内容与状态规则保留          |
| 专用 RAF 传输条                         | image-loading/transfer-estimate.tsx                                                  | 属本作品的估算可视化，独立可读但不升为通用组件                                   |
| talk.styles 中作品与宿主样式混合        | styles.ts / index.html / tests/preview/preview.ts                                    | 内容视觉、浏览器根样式与审阅门控样式各归实际宿主；不重做构图配色                 |
| Opening/Experiment/Evidence/Interactive | image-loading/tests/preview/                                                         | 四个场景只审阅同一作品；不是另一套播放器或通用组件库                             |
| 独立两页音乐作品、WAV 与音乐回归        | meowslides/stories/presentation-audio.stories.tsx、stories/assets、包内 browser spec | 演示的是通用根音轨跨页能力，与图片加载主题无关；许可、字节和有价值行为保留       |
| build 默认复制所有源码和根锁文件        | scripts/export-source.ts 显式命令                                                    | 普通 build 只交付观众产物；导出工具用清单保留可编辑源，排除 dist/测试结果/旧导出 |
| 素材生成/录制/交付验证                  | 原 scripts、tests                                                                    | 工具保留，不放进观众入口；录制条件就近移至 assets/recording.json                 |
| 历史迭代/hash                           | records/                                                                             | 绑定当时检查点的旧路径与 hash 原样保留，README 说明不能当当前目录清单            |

正式 main 不再有 `?demo=music` 分支，assets.ts 不再引入测试音频；通用 Reveal 媒体夹具也改为使用包内 WAV，不依赖具体作品。正式宿主复用已验证的 persisted pagehide 保护，避免浏览器缓存返回后空白。

当前 README 先讲作品目标、五页线索和阅读源码顺序，再列审阅/素材/导出工具。根导航、工程检查、作者 skill、来源链接和真实重排夹具均指向新入口，历史设计/回执保持当时证据。examples 索引及 MDX 作者 README 明确给出 Panda 链接、build/serve 命令和 13014 地址。

## 实际验证

- 独立结构审查在实施前收敛归属，实施后核对五页工厂：规范化标识更名与格式后与旧主体相同。PNG/JPEG/WebM/VTT 逐字节相同，移走的 WAV 也保留字节。
- 新作品 build 成功，七个输出资源不含 WAV；确认 dist/source 不存在。显式源码导出成功，包含 deck、专用动画及审阅源，不包含 dist 或测试结果。
- 新位置的 Meowbook check：四个场景通过；实际 capture 并打开 experiment 原图，原构图和停止态动画成立。
- 作品四项完整浏览器交付回归通过：参数跨页/结论、滑杆键盘、视频时间恢复/结束不翻页、真实本地资源/字幕与无外网冷启动、normal/reduced motion 直达状态。
- 迁移引用后的 33 项播放器浏览器合同通过，包括真实作品重排、宽/窄/短窗口。
- 独立音频 story 新增两项真实播放回归，加原 Reveal 媒体资源用例，共三项通过；覆盖跨页元素身份/连续播放、用户与宿主暂停及恢复不自动续播。
- `bun run typecheck`、作品/测试/包故事的相关类型检查、修改范围 lint/fmt 和 `git diff --check` 通过。未因目录整理重复运行无关全套单测、MDX 作者浏览器或安装/发布矩阵；没有公共运行时/主题 API 改动。

主协调者实际看过新的正式开场、移位后的实验审阅、独立音频 story 三张图；截图位于 artifacts/meowslides-review 与作品忽略目录中的 capture 报告。验证限本机 Chrome/Chromium，不将截图、合成事件或目录整理当作所有引擎验收。

本次自建 13009 服务及测试自动服务已关闭；既有 Panda/Sunshine 预览未动。未知 data/、其他临时原型、Rossovia/iOS 未读取或修改。仅本地提交，没有推送、发布或部署。
