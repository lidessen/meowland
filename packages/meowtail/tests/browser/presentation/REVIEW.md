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
