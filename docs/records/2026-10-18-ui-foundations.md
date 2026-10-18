# UI 基础与演示能力复验

本轮从 `190d721` 扩大检查当前 `meowtail` UI 库；用户口中的 meowface 没有触发改名。既有演示工具带合同继续沿用。用户随后补充演示动画、常见内容布局与现代标题排印；未修改两份既有作品的正文、课程状态或整体配色。

## 两轮闭环

第一轮分布局模型、尺寸与内容边界、键盘交互、文档和实际消费者四个方向盘点并真实复现。改变机制前由独立审查者核对反例和更小替代；实现按文件 owner 分工。

- 180px 高度内的嵌套 Stack / LayoutItem 被自动最小高度撑到 2376px，阅读体没有取得自己的滚动空间。四个布局根补齐 `min-height:0`，不默认添加 overflow、不重置任意子元素。数值 `basis={120}` 原先被浏览器丢弃，现按 px 序列化；字符串保留原样。
- 280px 局部容器中的 CardHeader 动作列可把标题挤至零宽，ResourceCard / ListRow 的固定状态与动作可越出边缘，Field 的连续长词可把输入撑至约 1103px。分别在所属组件收紧网格最小轨道、分配文字余量、允许状态和动作自然换行；长词由内容 part 换行，不用宿主补丁掩盖。
- Menu 聚焦“移除”后按 Tab 原先会执行该操作。改为关闭菜单链并沿原生 Tab / Shift+Tab 顺序离开；没有激活操作或提交表单。独立覆盖同步接受和拒绝关闭的受控 owner，以及嵌套菜单。

第二轮由非实现者重新检查内容边界与复合工作区：固定 PageFrame 页头和 Toolbar、嵌套 Grid / Card / Field、动态追加段落、正文滚动、Popover、末尾动作，以及调整窗口后的输入草稿和节点身份。自然无界 Stack 仍完整展开，有限高度才分配滚动余量；`shrink={false}` 的固定区不会被当作可裁切内容。

第二轮还实际发现图文 recipe 的图片按宽度取高后，图注与来源区重叠约 17.5px；改用已有 Stack / LayoutItem 分配有限媒体区，图片 contain 领取余量，图注保持自然高度。流程 recipe 去掉与原生 ol 重复的手写序号。固定画布内动态追加内容未触发原 ResizeObserver，诊断不更新的问题也继续追至 Presentation，而非删除失败断言。

新场景只挂载公开组件、传入内容和驱动状态；共享实现仍归库。没有读取或修改未知 `data/`，没有修改 Rossovia。

## 演示补充

- Presentation 与 Reveal 共用 `transition`：none、fade、slide、zoom，方向和速度使用有限预设。切页只装饰新页入场，旧页立即失活并卸载；Reveal 的隐藏、焦点和活动合同先成立，动画不改变叙事位置。没有为了 push 保留第二个可交互页面。独立检查推动补齐动画 API 失败后的 clip 恢复，以及尚未开始的下一帧在失活后取消、不补播的竞态。
- 单个 `PresentationLayout` 提供可替换 header/footer 与 single/equal/wide-start/wide-end 内容区；列比为一列、1:1、2:1、1:2。标题、图文、对比、数字、流程、引用总结只作六种轻量 recipes，不建立六套模板组件或 JSON 文档引擎。选用说明在包内 `PRESENTATION-LAYOUTS.md`，创作 skill 指向相同合同。
- 单个 `PresentationText` 保留真实 DOM 文本，plain 为默认，只增加 editorial 和 marker 两种克制排印。字号与字体沿用演示体系，marker 仅轻底部标记；没有彩虹渐变、厚描边、立体阴影或字体下载。明暗原图经过实施者和协调者分别查看后保留这两种，不以效果数量作为验收。

## 有界取舍

280px 卡片内放五个图标动作时，标题虽不再归零，长英文仍可能碎行、卡片增高。此轮保留简单的动作列占用上限，没有为了压力例新增 Card DOM 合同或隐式容器尺寸；实际作者可用已有 Menu 收拢低频动作。

布局根的最小尺寸不替代内容策略。任意原生 wrapper、明确的 Grid auto 行轨道和固定尺寸媒体仍归调用方；自然文流、局部滚动和外层滚动须分别选择 owner。演示的逻辑画布按 contain 缩放，不因手机宿主而重排讲义内容；动作可达不等于小屏正文适合阅读。

## 验证与交付

完整检查曾暴露两项既有遗漏：两个 story 的三个输入缺少真实标签关联；Assistant 的深色摄影测试在显式 light 预览下错误期待系统媒体切换重写主题属性。前者补 `htmlFor/id`（明暗场景 id 独立），后者改用真实外观选择器选择 dark，保留严格属性断言。没有放宽展板检查或浏览器断言。

隔离安装态还发现 reduced-motion 下导航、在下一帧前恢复偏好会补播旧入场。旧候选保留为失败证据；修复为排队时即检查偏好、收到 reduce 事件取消待播，恢复不补播，也不把动态偏好混入作品活动许可。回归在两个动画帧后检查，而非以即时零动画作为通过；实施者和独立审查者分别验证五次真实切换及同帧事件窗口。

最终实现与测试输入为 `e6b1ec1`（含 `f04efd6`、`bf11214`、`f228ea6`）；后续回执提交不改变运行代码或包内文件。Bun 1.4.2，macOS arm64，Playwright 1.63.0。

| 层级         | 最终实际执行                                                       | 结果                                                                |
| ------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------- |
| 构建         | `bun run build`；两份 `examples/*/build.ts`；showcase build        | 五包、两作品、展板均通过                                            |
| 类型         | 根 `bun run typecheck`；Meowtail 完整 tsc；两作品 tests/tsconfig   | 全部通过，含源码、stories、公共类型与浏览器测试                     |
| 格式 / lint  | Oxfmt 全仓 check 显式排除 `data/**`；Oxlint deny-warnings 同样排除 | 655 个格式输入通过，lint 零警告；未执行会读取未知目录的原样根 check |
| 单测         | 根 `bun run test`                                                  | 320 项、65 文件、1982 断言通过                                      |
| 组件浏览器   | Meowtail 标准配置，3 workers                                       | 154/154，通过明暗 390/1100 全场景矩阵和新增组合                     |
| 演示浏览器   | `bun run test:presentation`，另启动本版正式图片入口 13009          | 32/32，含原合同、工具带及 10 项动画检查                             |
| 消费者浏览器 | showcase、图片作品、Sunshine 各自 Playwright 配置                  | 2/2、5/5、11/11，浏览器合计 204 项通过                              |
| 展板静态检查 | showcase check                                                     | 112 个公开 gallery 场景；最终 batch 零可访问性提示                  |

最终截图由重新构建的 Meowbook capture 服务拍摄，清单在忽略目录
`artifacts/foundation-review/final/captures.json`；另拍两份正式浏览器入口。
实际查看宽屏、390px 窄屏、330–390px 短窗、固定操作与阅读体、浮层、图文构图、明暗排印和长标题原图。
12 张代表图与 `transitions-demo.webm` 已成功保存至 Library；完整 ID 与本地路径对应在
`artifacts/foundation-review/final/library-uploads.json`，交付消息直接提供 ID。
录屏为最终本版正常动态的真实 fade/slide/zoom 和分步 Reveal，1280×900、25fps、8.72 秒；已抽帧查看。
独立动画审查的快速跳页、媒体卸载、暂停/隐藏、原尺寸滚动、动态诊断和待播竞态证据另在
`artifacts/presentation-review/transitions-20261018/`，不把静态图当作动画验证。

## 本地安装态

最终隔离回执为 `artifacts/final-ui-consumer-KduV6o/receipt.json`。
在全新 staging 打包实际三包 dist 与包文件（不复制源码或 node_modules），空 `/tmp` 消费者从本机缓存离线安装真实 tgz，禁用 install scripts；不使用源码 aliases、相邻 checkout 或逃逸 symlink。
运行时 root / presentation 子路径身份、公开类型正负例、无 DOM 的 JSX/CSS core 类型、浏览器构建、指南和许可证均通过。
最终新包重测五轮 reduced-motion 导航恢复、正常入场、取消、卸载与零浏览器异常；未变的布局/排印三视口证据按字节一致的声明和实际 dist 比对有界复用，回执明确列出。

最终 Meowtail tarball SHA256 为
`4e58f4ca9cdf752043813e97e27291b132bccfe070ace53d14d44769ec414345`，包内版本仍为
`0.1.1-presentation.20261017.1`，未改源版本。旧 `SvquPl` 候选与 reduced-motion 失败记录保留，没有覆盖旧 tarball 或既有发行资产。此证据仅是本地安装验收，不是 registry 安装或发布。

没有剩余关键缺陷。尚未验真实移动硬件、Safari/Firefox、人工屏幕阅读器与浏览器 UI 缩放；已验证的是 Chromium/Chrome、模拟窄短视口、画布缩放及原尺寸模式。未重跑代码未变的 Meowbook 工具自身全部专用浏览器矩阵，相关工具单测及实际 capture 路径已运行。
动态诊断观察内容增删、文字、资源加载与尺寸变化，不承诺任意纯样式改变或发现画布内部所有区域重叠；后者由 recipe 的实际几何与原图验证。历史原产品设计外链未成功取得，本轮以当前库合同、已有实现与第三方 notices 为依据。

源码观察、自动检查、实际浏览器行为、本地安装态与正式发布分别记录；本轮不推送、不发布 npm、不部署。
