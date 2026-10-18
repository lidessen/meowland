# 2026-10-18 拆包与 MDX 作者入口复验

本轮浏览器测试归属从 Meowtail 迁到 MeowSlides；下方 2026-10-17 与工具带回执保留为历史记录，旧包路径不再是当前执行入口。

## 本轮输入与结果

实际消费 `meowslides`、`meowslides/theme` 公共入口，运行时同时安装通用 MeowUI 与演示插件，主题只加载完整的 `presentationTheme`。旧复杂图片作品由 `examples/image-loading/build.ts` 使用当前包重新构建；新作者入口直接消费 `examples/presentation/slides.mdx` 和其真实 QuickCheck 组件。

- 独立播放器合同 33 / 33 通过（32.7 s）：跨页 signals、多实例、步骤、键盘、隐藏与焦点、活动许可、原生媒体、迟到播放、清理、重排、窄短窗外围控件。
- Meowbook 组件组合 22 / 22 通过（6.0 s）：背景、有限区域、动态诊断、两/三栏、长列表、图片完整显示与显式裁切、controlled Reveal、原生媒体。
- MDX 作者入口 8 / 8 通过（7.7 s）：标题只出现一次、原生列表、双栏、真实本地图、渐显 AX/inert、会话选择跨页保留、重做、媒体离页暂停、pagehide 缓存事件合同、真实源文件编辑与错误恢复，以及三个视口。
- 测试代码的定向格式、lint 和 `tests/browser/tsconfig.json` 类型检查通过。

最终 MDX 修复仅影响作者内容 flow 与生成宿主；33 项播放器与 22 项组件使用的 runtime/普通主题未变，因此没有为这两项局部修复重复无关矩阵。

当前从仓库根执行：

```sh
PLAYWRIGHT_CHANNEL=chrome bun node_modules/@playwright/test/cli.js test --config packages/meowslides/tests/browser/presentation/playwright.config.ts
PLAYWRIGHT_CHANNEL=chrome bun node_modules/@playwright/test/cli.js test --config packages/meowslides/playwright.config.ts
PLAYWRIGHT_CHANNEL=chrome bun node_modules/@playwright/test/cli.js test --config packages/meowslides/tests/browser/authoring/playwright.config.ts
bun node_modules/typescript/bin/tsc --noEmit -p packages/meowslides/tests/browser/tsconfig.json
```

lab 服务占 13009；独立合同服务 13019、组件 gallery 13027、真实 MDX 作者服务 13039、临时改稿服务 13040。当前独立合同配置自行构建并启动 lab，同时管理 13019；其余配置自行启动各自服务。所有服务只监听回环地址，不复用已有进程，测试完成后退出。历史本轮验收时 lab 曾由执行者先启动；2026-10-18 发布就绪审查修复了这一手动前置，避免干净环境中两个外框用例连接失败。

## 实际发现的两个组合缺陷

首轮组件测试 21 过、1 失败。拆包后的主题把演示标签样式排在通用组件样式之后，画布 h2 默认覆盖 CardTitle，使展开内容溢出并触发整体缩放。实现 owner 恢复原样式优先关系后，保留原几何/焦点/输入身份断言，22 项重新通过；没有放宽断言隐藏问题。

首次真实 MDX 测试发现，单张 Markdown 图片加一段普通说明就超过正文区域，两项测试因此失败。实际原图显示说明压到画布底缘。实现 owner 在共享 MDX flow 中保留普通正文自然高度，并让直属图片/视频承担有限余量收缩；图片仍 contain，没有修改讲稿、全局图片默认、字体或 Panda。最终图和全组回归均通过。另一个首次 watch 失败是测试标题定位同时命中围台与画面，测试随后明确限定 article，不计作实现缺陷。

独立设计审查另外提出生成宿主的 BFcache 事件风险。修复后新增 `persisted: true` pagehide 事件验证：选择保留且 Check 仍可用；最终非缓存 pagehide 才清空挂载。这是实际 PageTransitionEvent 合同验证，不等同所有浏览器真实 BFcache 导航验收。

## 实际视觉与开发循环

最终原图位于 `artifacts/meowslides-review/mdx-authoring/`：opening、compare、image、steps、check 五种状态，各有 1440×900、390×844、844×390，共 15 张；`geometry.json` 记录三个视口的七页画布。已实际打开 compare/image/check 宽屏、check 窄窗和 image/steps 短窗原图：双栏对齐，课堂按钮与画布正文协调，图片完整并给说明留出空间，控制带可达。窄短窗是固定逻辑画布的缩放概览，不声称手机正文充分可读。

真实开发循环使用自有临时 MDX 与 TSX 文件：点击后计数为 1，修改标题后浏览器自动重载且会话回到 0；无闭合 JSX 触发错误后，旧页面仍能操作；修复后自动恢复；再修改导入的 TSX 组件也触发重载。没有用手动刷新或 revision API 返回值代替浏览器事实。

验证浏览器限本机 Chrome/Chromium；未验证实体触摸、人工屏幕阅读器、物理音响、其他浏览器或部署。工程全量、包外安装、Library 上传与提交由父任务回执记录。本记录不表示已发布。

---

# 演示能力独立行为审查

日期：2026-10-17。测试作者与生产、作品作者分离；本记录只覆盖本轮浏览器实现，不表示发布或全部平台验收。

## 本轮发现与修复

- 嵌套 Reveal 的内层 `visibility: visible` 覆盖外层隐藏，可能泄漏未推进内容。生产作者改为继承显现；独立浏览器用例同时验证视觉隐藏、AX、焦点返回与祖先活动许可。
- 首次入页前赋值的 page Signal 在订阅后再投递，导致首页面重复挂载。生产作者以初始 CurrentSlide 构造 Signal；独立浏览器用例保护入页次数、步骤切换不重建、宿主活动切换不重建。
- 迟到播放测试只模拟拒播和异步竞态；真实浏览器原生媒体另行验证，没有用 mock 证明视频编码、位置恢复或音频播放。
- 父任务实际视觉检查发现正常媒体仍显示 Retry loading：Button 的 display 覆盖了 UA 的 hidden 样式。生产作者仅修共享媒体 actions 的 hidden 规则。新增实际可见性回归先对旧 dist 稳定失败，再对修复版验证正常 ready 隐藏、真实 HTTP 404 后显示、重试加载期间隐藏、真实 WAV 恢复后隐藏；不是仅断言 hidden 属性。
- 父任务直接看录屏发现画面显示 0 bytes，尽管外侧元数据正确。作品作者修录制脚本并重录。独立审查从新 WebM 抽取 2、5、10 秒帧实际观看：PNG 显示 557,056 → 1,933,312 → 3,634,345 bytes，JPEG 显示 68,426 bytes / decoded 0.3 s，最终 PNG decoded 8.1 s；进度条与两图完成态相符。该检查不能由解码成功或 JSON 元数据替代。

## 冻结输入的实际结果

早期检查点 `9caeff43` 与首轮 11 + 5 项通过不作为最终验收。父任务最终全包 build 与正式作品 build 完成后，独立测试使用该公开 `meowtail/presentation` 入口和冻结 `image-waiting-b3` 资源，重新运行 13 + 5 项浏览器检查。实际命令：

```sh
bun test packages/meowtail/tests/unit/presentation
bun node_modules/typescript/bin/tsc --noEmit -p packages/meowtail/tsconfig.types.json
bun node_modules/typescript/bin/tsc --noEmit -p examples/presentation/tests/tsconfig.json
PLAYWRIGHT_CHANNEL=chrome bun node_modules/@playwright/test/cli.js test --config packages/meowtail/tests/browser/presentation/playwright.config.ts
PLAYWRIGHT_CHANNEL=chrome bun node_modules/@playwright/test/cli.js test --config examples/presentation/tests/playwright.config.ts
```

结果：单测 3 项 / 16 断言通过；类型检查通过；最终组件/集成浏览器 13 项通过（7.3 s）；最终正式作品浏览器 5 项通过（3.7 s）。测试服务器只监听 loopback，浏览器为本机 Chrome。定向 lint 与格式检查覆盖本轮测试文件。新增测试的真实 HTTP 错误与恢复不使用资源 mock，只有播放拒绝/迟到 promise 竞态使用隔离模拟。

组件测试包括位置 Signal、跨页输入和多实例隔离、直接步骤与线性导航、滑杆按键、嵌套 Reveal、焦点与 AX、活动门、卸载计时器清理、真实原生 ref/媒体事件、视频位置恢复和 ended 不翻页、真实音频停止、迟到播放、拒播重试、Retry loading 正常/失败/恢复可见性、inert 后台 iframe，以及 390px contain / 原尺寸切换后的实际横向滚动范围。

真实重排夹具直接调用作品 `createImageTalk`，复用其全部原始页 render 函数、同一个位置 Signal 与实验 signals，仅将 experiment 页移到数组首。实际检查重排后按稳定 id 直达第 3 步、71 Mbit/s 输入、总结读取、返回实验与 opening 页定位；没有复制作品内容或为测试新增生产 option。

正式作品测试使用本地真实 12 秒 VP8 WebM、英文 VTT 与独立 6 秒 WAV，验证 Q&A 返回、参数同步到总结、原生视频帧/位置/继续/重播、音乐跨页保留、用户暂停后不自动续播、正常与 reduced motion 的直接步骤。冷启动使用新浏览器 context，从正式构建目录通过独立端口服务，阻断所有外部请求；外部请求与非预期资源失败均为零。已解码视频离页时主动取消的本地请求属于清理预期，不当作缺资产。

本轮新资源为 PNG 3,634,345 bytes、JPEG 68,426 bytes、WebM 498,896 bytes。独立 ffprobe 确认 VP8 / 960 × 600 / 12.000 秒；WebM SHA-256 为 `0ed55b10cb794a63b2e1ac0f8dd00a67a906da40f7681a8fd805c837a41271f5`。临时帧证据位于 `/tmp/meowland-presentation-final-review/recording-02.png`、`recording-05.png`、`recording-10.png`，不是需要观众依赖的交付资源。

## 范围限制

- “保留 B 排版，仅局部改结论与图”的创作迭代与整场原图视觉审查由父任务和作品作者的实际记录承接；页重排已增加同源浏览器夹具。没有用源码词句断言代替创作验收。
- 离线证据是冷浏览器、外部请求阻断与正式目录服务；没有声称双击 `file://`、任意部署子目录或未安装 runtime 的机器可用。
- 样例使用系统字体；未验证自带 Web 字体。媒体验证包括真实解码、时间推进与暂停事实，不包括物理音响输出测量。
- 根工程全量检查、安装态、实际视觉与发布分别由父任务记录；测试通过不等于已发布。

## 演示外围主题复审

本轮只改外围主题，作品源文件未改。独立审查发现两处真实接线问题：桌面目录的 flex basis 使工具不必要换行；`partSelector` 的零 specificity 使后面的 Button 基础规则覆盖了 chrome 的 44px 目标、字号和颜色。生产作者分别限制桌面不换行、仅提高 chrome 内真实 button 的选择器 specificity。新增触控目标回归先在旧构建失败（实际高 36px），在父任务重新构建后的版本通过；同时比较舞台内 `Open evidence` 与外部同 variant Button 的 computed 样式，避免外围规则污染作品按钮。

同一最终构建重新运行组件浏览器全部 19 项（原 13 项 + 新 chrome 6 项，11.1 s）及正式作品 5 项（3.6 s），全部通过。新增覆盖真实 light/dark 主题绑定、键盘到达与操作、390px / 844×390 触控操作、原尺寸滚动时的控件可达、44px 目标、控件不遮舞台、原生宿主 Fullscreen API。定向 lint 与包 TypeScript 检查通过。没有把截图相等或颜色像素常量写成审美测试。

最后一次仅在已有短窗断点减少外围 padding/gap；父任务重建后补跑 chrome 全部 6 项（4.1 s）通过，并重新生成全部 `final-*` 原图和 JSON。该变动不改作品、导航或媒体状态，未重复上一轮 13 + 5 项。

实际 computed：导航按钮 44×44px、13px 字号；390px 下工具高 44px、12px 字号、左右 padding 8px，两工具宽 93.02 / 77.36px，在 198.89px 容器同排。正式 390px 页脚从 137px 降到 107px；844×390 夹具页脚从 106px 降到 58px，舞台从约 238×134px 恢复为最终 384×216px。浅色页眉文字对合成背景约 4.78:1，深色约 8.95:1；页脚辅助文字约 5.27:1 / 7.35:1，未使用叠加 opacity。

证据目录为 `artifacts/presentation-review/chrome-20261017/`，`final-*` 是最后一次统一重建后重新生成，`baseline-*` 为前版。已亲自打开并观看正式 opening 宽屏/390px、短窗、深色宽/窄、深色键盘焦点、作品内容置于深色宿主，以及原生 fullscreen 原图：控件完整可达，无舞台覆盖，焦点环可辨。优先交付 `final-formal-opening-wide-light.png`、`final-formal-opening-narrow-light.png`；诊断原值见 `final-computed.json`。

Fullscreen 结果仅表示本机无头 Chrome 允许宿主对真实容器调用原生 API 并保留控件，不表示新增播放器全屏功能或完成物理显示器验收。正式作品始终使用浅色；深色测试实际绑定主题于夹具，验证外围独立配色与作者指定的纸色/标题，不声称强制作者全部内容控件跨主题视觉恒定。未发现本轮剩余行为阻断。

## 2026-10-18 工具带局部优化复审

本轮改为固定导航、可伸缩的原生目录、常显选项触发按钮；低频暂停/尺寸 toggle 放入既有 Popover，使用有可读名称的非模态 dialog 和原生 Button，而未扩展公共 Menu。初期独立试验确认现有 Menu 的 Tab 会选择当前项，与本轮 toggle 场景不符；方案调整后已删除临时探针，未保留无关失败门禁或修改 Menu。

已授权测试夹具只给真实 Presentation props 添加长中英标题、无空格长目录标题和 390px 宿主，没有复制工具栏。测试沿用 public exports。验证覆盖 320/390/479/480/481/513/514/515/700/701px 窗口、844×390 短窗、390×320 极短窗，以及 1280px 宽窗口内的 390px 窄宿主。目录在实际容器内容宽度 479/480px 时位于第二行、481px 时回同排，所有样本横向溢出为零；完整选项名称和选中项 title 保留，目录跳转到第 0 步。

父任务在原 13 项合同测试发现一次真实回归：将 root min-height 置 0 后，没有明确高度的双实例宿主舞台塌缩，导致滑杆/Reveal 不可见，出现 2 项失败并停止该轮。生产作者恢复默认 `min-height:min(480px,100dvh)`、短窗 `min-height:min(320px,100dvh)`，父任务重新运行 13 项通过（8.1 s）。此发现属于父任务，不记为独立测试作者发现。另一个父任务实拍发现的通用 Popover 样式覆盖由 chrome 局部选择器修复；独立测试比较选项弹层与控制带 computed 背景一致，验证公共样式接线，未固定具体配色。

上述最后统一重建后，独立执行 `chrome.spec.ts` 全部 9 项，通过（12.3 s）；定向 lint、测试类型与格式检查通过。新测试验证：Enter/Space 打开并聚焦首项；Tab/Shift+Tab 不触发 toggle，离开弹层会关闭；Space/Enter 才改变对应 aria-pressed；Escape 回触发；外部点击保留实际外部目标焦点。原尺寸模式实际发生横向滚动后选项仍可达，已打开弹层在窗口缩小后重新定位。双实例 aria-controls 唯一，开关状态互不串，退出移除打开的 top-layer。可见性同时检查 viewport 几何和实际中心命中，触控目标在入场动画完成后测量，避免把中途缩放的 43.34px 当最终 44px 布局缺陷。

已亲自打开最终正式宽/窄图、长标题窄屏、宽窗口窄宿主、短窗弹层、窗口缩小后的弹层和深色焦点原图；未发现剩余遮挡或行为阻断。短窗夹具舞台约 366.22×206px，桌面控制带 720×62px，窄屏控制带约 374×123px，选项触发按钮 44×44px。弹层打开时临时覆盖部分舞台或目录属于既定浮层行为，可由 Escape/外部点击关闭；未承诺浮层与全部底层内容同时可见。

本轮证据独立保留于 `artifacts/presentation-review/toolbar-20261018/` 的 `final-*`；关键原图为 `final-formal-opening-wide-light.png`、`final-formal-opening-narrow-light.png`、`final-options-844x390.png`、`final-options-resized-open.png` 和 `final-options-keyboard-dark.png`，几何原值见 `final-container-boundaries.json` / `final-computed.json`。旧 2026-10-17 数值和通过结果只描述上一轮，不能代替本轮。实体触摸、人工屏幕阅读器和完整 fullscreen 弹层交互未单独验收；原生 fullscreen 检查仍仅覆盖宿主进入/退出与主控件保留。
