# 演示能力独立行为审查

日期：2026-10-17。测试作者与生产、作品作者分离；本记录只覆盖本轮浏览器实现，不表示发布或全部平台验收。

## 本轮发现与修复

- 嵌套 Reveal 的内层 `visibility: visible` 覆盖外层隐藏，可能泄漏未推进内容。生产作者改为继承显现；独立浏览器用例同时验证视觉隐藏、AX、焦点返回与祖先活动许可。
- 首次入页前赋值的 page Signal 在订阅后再投递，导致首页面重复挂载。生产作者以初始 CurrentSlide 构造 Signal；独立浏览器用例保护入页次数、步骤切换不重建、宿主活动切换不重建。
- 迟到播放测试只模拟拒播和异步竞态；真实浏览器原生媒体另行验证，没有用 mock 证明视频编码、位置恢复或音频播放。

## 冻结输入的实际结果

父任务最终全包 build 完成后，独立测试使用该公开 `meowtail/presentation` 入口；正式作品再由该版本构建。实际命令：

```sh
bun test packages/meowtail/tests/unit/presentation
bun node_modules/typescript/bin/tsc --noEmit -p packages/meowtail/tsconfig.types.json
bun node_modules/typescript/bin/tsc --noEmit -p examples/presentation/tests/tsconfig.json
PLAYWRIGHT_CHANNEL=chrome bun node_modules/@playwright/test/cli.js test --config packages/meowtail/tests/browser/presentation/playwright.config.ts
PLAYWRIGHT_CHANNEL=chrome bun node_modules/@playwright/test/cli.js test --config examples/presentation/tests/playwright.config.ts
```

结果：单测 3 项 / 16 断言通过；两项类型检查通过；组件浏览器 11 项通过；正式作品浏览器 5 项通过。测试服务器只监听 loopback，浏览器为本机 Chrome。定向 lint 与格式检查覆盖本轮测试文件。

组件测试包括位置 Signal、跨页输入和多实例隔离、直接步骤与线性导航、滑杆按键、嵌套 Reveal、焦点与 AX、活动门、卸载计时器清理、真实原生 ref/媒体事件、视频位置恢复和 ended 不翻页、真实音频停止、迟到播放、拒播重试、inert 后台 iframe，以及 390px contain / 原尺寸切换后的实际横向滚动范围。

正式作品测试使用本地真实 12 秒 VP8 WebM、英文 VTT 与独立 6 秒 WAV，验证 Q&A 返回、参数同步到总结、原生视频帧/位置/继续/重播、音乐跨页保留、用户暂停后不自动续播、正常与 reduced motion 的直接步骤。冷启动使用新浏览器 context，从正式构建目录通过独立端口服务，阻断所有外部请求；外部请求与非预期资源失败均为零。已解码视频离页时主动取消的本地请求属于清理预期，不当作缺资产。

## 范围限制

- “保留 B 排版，仅局部改结论与图”的创作迭代、页重排与原图视觉审查由父任务和作品作者的实际记录承接；没有用源码词句断言代替创作验收。
- 离线证据是冷浏览器、外部请求阻断与正式目录服务；没有声称双击 `file://`、任意部署子目录或未安装 runtime 的机器可用。
- 样例使用系统字体；未验证自带 Web 字体。媒体验证包括真实解码、时间推进与暂停事实，不包括物理音响输出测量。
- 根工程全量检查、安装态、实际视觉与发布分别由父任务记录；测试通过不等于已发布。
