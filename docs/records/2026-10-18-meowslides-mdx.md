# Meowslides 拆包与 MDX 创作回执

源码提交：`7f277580d093f8c3178099f737504e19a0ca5eaa`。本地候选为 `meowslides@0.1.0-slides.20261018.1`（private）和 `meowtail@0.2.0-slides.20261018.1`。没有推送、npm 发布或部署，不承诺 npm 名称可用性。

## 最终变化

- 新包拥有演示播放器、步骤/活动 Context、Reveal、媒体、专用内容布局与主题。Meowtail 保留通用 UI、布局和标准应用主题；旧根演示导出与 `meowtail/presentation` 移除，不反向转导新包。
- 通用 token/fragment/options 保持同一身份；演示注册独立，宿主同时安装通用 UI 与演示插件。浏览器 runtime/theme/mdx 与 Bun compiler/build/CLI 分离。
- 默认作者入口是 `slides.mdx`：顶层 AST 分页、标题只写一次、可选静态页元信息、明确列分组、Markdown 图片、Reveal 和导入的 MeowJSX 互动。编译为单一 ESM 模块，页面惰性渲染，显式会话工厂每场一次。
- CLI 统一生成宿主、注册、主题、资源和清理，提供 dev/build。dev 自动重建并整页 reload，错误保留上次有效页面、修复后恢复；不冒充 HMR。
- `examples/presentation` 提供九行两页起步稿与七页能力示例；原复杂作品完整留在 `examples/presentation-lab`。Sunshine、Panda 和故事消费新包，正文、既有构图与整体配色保持；Showcase 增加独立演示展板。

用法和支持集见 [新包 README](../../packages/meowslides/README.md)；播放生命周期与布局合同分别见 [PRESENTATION](../../packages/meowslides/PRESENTATION.md)、[PRESENTATION-LAYOUTS](../../packages/meowslides/PRESENTATION-LAYOUTS.md)。起步文稿不要求作者维护 main、build、serve、registry、theme 或媒体声明。

## 两轮实质闭环与独立审查

第一轮从作者负担与官方 MDX 编译目标开始，验证 `jsxImportSource: "meowjsx"`，再独立评审拆包、分页、状态和信任边界。真实迁移后复现了主题层叠回归：演示标题样式覆盖普通 CardTitle，导致展开内容溢出。恢复原层叠顺序后保留全部几何/焦点/身份断言，组件回归重新通过。

第二轮用真正的 MDX 七页作品和原有复合作品验收。发现并修复：

- 重复页声明、动态标题误解析、引用图片漏资源图，以及带 import 的真实稿编译失败。
- 虚拟模块无法解析 extensionless TSX imports；修为真实模块解析，外部 TSX 也编译到 MeowJSX，而不是 React。
- 图片加普通说明超出正文预算；共享 MDX flow 保留文字自然高度，只让直属媒体收缩，仍 contain，不改课件字号或逐页补像素。
- 普通 Button 在 MDX 画布内太小；用共享主题的画布限定默认，继承正文尺度和 em 间距，外围控件与通用 UI 不受影响。
- 生成宿主需真正使用安装插件的 Web renderer；错误诊断需包含源文件名与行列。
- pagehide 无条件清理会令真实 BFcache 返回空白。最终保护 persisted 页面，最终离开才清理。独立 Chrome 导航观察到 `pageshow.persisted=true`；只在临时响应中移除保护的负对照确实恢复空白，没有修改正式文件。

独立审查覆盖 runtime/theme/registry、compiler/build/CLI、桥接、消费者和新增测试，收敛后没有新增 P0/P1。普通实现与独立质疑者分离；没有以删除断言或缩小测试期望处理真实失败。

## 验证结果与范围

| 类别           | 实际结果                                                                                       | 覆盖/界限                                                                                       |
| -------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 构建           | 六包 `bun run build` 通过；最后 compiler 修正后定向重建 Meowslides；作者 README build 七页成功 | 公开产物，不使用 TS source alias 冒充安装                                                       |
| 类型           | `bun run typecheck` 通过；新包完整检查、严格公共类型正负例、浏览器与五个消费者/app 配置通过    | 不等于 MDX 内完整 TS props 检查                                                                 |
| 单测           | `bun run test`：356 通过，0 失败，2295 断言，74 文件                                           | 包含 MDX/compiler/build 11 项与新包 runtime 19 项；浏览器另列                                   |
| lint/fmt       | 已跟踪文件及本轮新增源/文档完整定向范围通过，`git diff --check` 通过                           | 显式跳过未知 data/ 与无关原型；不是对未知目录执行根命令                                         |
| 锁文件         | `bun install --frozen-lockfile --offline --ignore-scripts` 通过                                | 仅既有缓存，未联网下载或执行安装脚本                                                            |
| 播放器浏览器   | 33/33 通过                                                                                     | 多实例、键盘、signals、步骤、隐藏/focus、活动、真实媒体与清理                                   |
| 组件组合浏览器 | 22/22 通过                                                                                     | 背景、动态诊断、两/三栏、长列表、图片、受控 Reveal 与媒体                                       |
| MDX 作者浏览器 | 8/8 通过                                                                                       | 简单页、双栏、图片、渐显/AX、课堂选择/重做/跨页状态、媒体离页暂停、缓存事件、真实改稿与错误恢复 |
| 原消费者浏览器 | lab 全套 5/5；Sunshine 定向 3/3；Panda 定向 5/5                                                | Sunshine/Panda 不是整套矩阵；具体 grep 见事实文件                                               |
| Meowbook       | 独立演示展板 check 8 场景与 build 通过                                                         | 普通 MDX 作者无须先使用 Meowbook                                                                |
| 打包/安装      | 六包本地 pack 完成；新包/相关 peers 另做仓库外安装验收                                         | 见下文精确输入与安装说明；不等于发布                                                            |

工具日志在 `artifacts/meowslides-verification/`；浏览器细节见 [REVIEW](../../packages/meowslides/tests/browser/presentation/REVIEW.md)。消费者最终事实与限定场景在 `artifacts/meowslides-consumer-regression/facts.json`。

### 精确本地产物

| 文件                                   | SHA256                                                             |
| -------------------------------------- | ------------------------------------------------------------------ |
| meowslides-0.1.0-slides.20261018.1.tgz | `3ae238b1d7f788f2be208c179b13f075d3f644e07734e72bf7f35bbb5ff02633` |
| meowtail-0.2.0-slides.20261018.1.tgz   | `1da3056d9188f178063906822734f868fb625b9c039aff5ddb574b5b23b959d9` |
| meowjsx-0.1.0.tgz                      | `f7364f05333d2bee25095b3e0b21b95a93389b24972863f179f7fb017c1e7628` |
| meowcss-0.1.0.tgz                      | `b67fabcab43ddeb6defc729c3a363ab7a1b74794959ae5be97723472f967179e` |

安装验收使用仓库外干净目录、精确本地 tgz 和既有缓存；没有仓库源码别名、逃逸 symlink 或网络回退。运行时入口和类型、单一 JSX/CSS 解析、共享主题原件、旧入口拒绝、非根 cwd 的外部 MDX/TSX/SVG/WAV 构建与浏览器由独立验收者核对。最后纯错误定位与 README 更新不改变有效讲稿的运行时字节，复用时按实际 dist 字节核对。

最终包在第三个全新消费者目录离线安装，161 个依赖只用既有缓存。安装文件逐项匹配 tgz：JSX 52、CSS 21、Tail 435、Slides 61 文件；所有打包 dist/README 与冻结源一致，manifest 的 workspace 到候选版本转换另核对。Bun 对本地 file prerelease peer 的 registry 元数据查询提示没有作为匹配证据；实际安装版本和单一解析图已直接核实，没有联网回退。

外部三页稿的正式 CLI/API 构建通过；缺陷稿的公共 compile API 和 CLI 都输出原 invalid.mdx 文件名、重复 id 与 `(5:1)`，CLI 返回非零。包外浏览器在 1440×900、390×700、1280×460 dark 检查通用 Button/Signal 跨包使用、Reveal、跨页会话、SVG、音频 ready/play 与缓存事件，未见 pageerror、404 或水平溢出。它使用的前一份候选与最终 tgz 精确只差 README、build/compiler.js，runtime/theme/mdx/生成宿主字节相同，因此复用该浏览器证据；最终编译器的 CLI/API 另行重建通过。完整包外证据在 `artifacts/meowslides-package-acceptance/`，13088 临时服务已关闭。

## 实际视觉与 Library

新作者稿对 1440×900、390×844、844×390 三视口检查七页几何，并保存十五张代表状态图。主协调者实际打开宽屏双栏/图片/问答、窄屏问答、短窗图片五张原图；独立作者与审查者另看相关图，不宣称每人看完全部图片。

宽屏正文与课堂按钮尺度协调，双栏同轴；图片完整且普通说明在 body 内，窄短窗控制带可达。窄屏仍是固定逻辑画布的缩放概览，不能说手机正文已充分可读。原课件另有宽/窄/短截图回看，未改原整体配色。

以下五图已上传 Library，均成功，无 external connector 访问；版本属性已写回本地截图。完整 Library ID：

| 图                   | Library ID                                 |
| -------------------- | ------------------------------------------ |
| compare-1440x900.png | `libfile_327319cbefc4819193706416372c7b08` |
| image-1440x900.png   | `libfile_37e7dd63930c8191b1bf098bc22d8500` |
| check-1440x900.png   | `libfile_d25b6c5437a08191af35834677a73c81` |
| check-390x844.png    | `libfile_4dfd2dbac0248191ad8fad0d18e91776` |
| image-844x390.png    | `libfile_4db3c6f1b8548191bbfbe5792a0bed14` |

原图与上传返回位于 `artifacts/meowslides-review/mdx-authoring/` 和 `artifacts/meowslides-verification/library.json`。

## 剩余限制与停止范围

MDX 是可信本地可执行代码，不能把模型生成/上传文本或 JSON 默认执行；本轮没有建立沙箱。状态由明确会话工厂或组件生命周期管理，未实现任意模块变量的自动隔离。

首期只做单文件多页；无 YAML deck 配置、主题插件协议、多文件分页、保留状态 HMR、完整 source maps 或 MDX 内完整 TS props 检查。编译器依赖不进入浏览器模块图，但仍是工具安装依赖。Meowbook 的 MDX 适配没有新增自动 discovery 协议。

验证限本机 Chrome/Chromium；未做 Safari/Firefox、实体触摸、人工屏幕阅读器、物理音响或部署验收。包外用户需明确迁移旧 Meowtail 演示入口；仓库外 Rossovia/iOS 未改。未知 data/、其他 B+C 临时原型均未读取或修改。自建测试与审查服务已关闭，既有 13012/13014 用户预览未动。
