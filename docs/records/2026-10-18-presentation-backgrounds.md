# 演示背景合同与复验

本轮在 UI 基础检查的 `f466c38` 上补充用户明确要求的逐页背景能力，代码提交为 `a946924`。沿用正式包名 Meowtail，没有改名、修改既有课件正文或整体配色，也没有读取或修改未知 `data/`、Rossovia。

## 公共合同

`Presentation.background` 设置整套默认背景，`SlideDefinition.background` 设置单页背景，两者都接受整个值的 signal。单页 `undefined` 继承整套默认值；整套值也为 `undefined` 时使用主题。显式 `"theme"` 恢复当前主题的纸面、正文与次要文字。

对象支持 CSS 颜色或渐变 `fill`、图片 `image`、颜色或渐变 `overlay`，以及文字颜色预设 `foreground: "light" | "dark"`。图片提供 `cover` / `contain` 和九种有限位置；默认 cover、center。单页对象整体替换整套对象，不逐字段合并；省略 fill 使用主题纸面。foreground 表示文字颜色，仅覆盖演示局部的 ink / muted，不切换嵌套控件的完整主题。

背景铺满画布，原有内容安全边距不变。独立背景层裁切图片，不遮蔽正文溢出诊断。背景为 inert、aria-hidden 的装饰，图片空 alt、不参与焦点导航。加载失败只隐藏失败图片，保留 fill、overlay 和 foreground；作者应让无图片时的底色、遮罩与文字仍可读，不进行自动图片对比度推断。

背景变化仅替换装饰层，不重新挂载同页内容、不启动切页动画。切页时背景和内容在同一 article 内共同入场，旧页仍立即卸载并结束媒体生命周期。没有新增背景视频、资源管理器、预加载系统或任意 JSON 执行合同。

指南在 `packages/meowtail/PRESENTATION-LAYOUTS.md`，七页真实场景为 `presentation-backgrounds`；stories 只驱动公开组件和状态，未复制实现或添加消费者 CSS 修补。

## 独立审查与两轮验证

实现前由独立质疑者确认继承、显式恢复主题、对象替换、失败回退、局部文字 token 和媒体生命周期边界。第一轮通过单测、类型正负例、真实浏览器压力场景完成实现闭环。第二轮由非实现者在最终构建上复验复合页面、动态输入、实际媒体播放、快速切页与安装态，未发现新的关键缺陷。

- 宽屏、390px 窄屏、短窗口实际截图均已打开检查，覆盖 cover、contain、整套渐变、主题恢复、暗色宿主和故意失败的图片。背景与画布边缘几何差为零，背景裁切没有误报内容溢出。
- 同页连续背景更新保持输入节点、焦点、草稿和内容挂载次数；独立音频场景实际播放且时间继续前进。切页后旧音频暂停、脱离文档并清除 src。延迟到达的旧图片错误只影响已卸载的旧节点，新背景继续可见。
- 同页背景更新在两帧后没有 article 动画；正常切页只有共享 article 的一次入场，只有新页内容和背景。五轮快速切换后仍只有一份活动内容和背景；浏览器 pageerror 为零。
- 独立证据位于 `artifacts/presentation-review/backgrounds-20261018/independent-background-results.json` 与 `independent-background-transition-results.json`。安装态只宣称媒体节点连续性；实际播放证据来自前述独立音频检查。

## 最终同版本检查

所有源码检查均针对 `a946924` 中的同一实现，完成构建后没有再修改产品源码。

| 层级         | 检查                                                                | 结果                                       |
| ------------ | ------------------------------------------------------------------- | ------------------------------------------ |
| 构建         | 根 build 五包；两份 presentation 示例；showcase build               | 全部通过                                   |
| 类型         | 根 typecheck；Meowtail 完整 tsc                                     | 全部通过，含公共背景类型正负例             |
| 格式与 lint  | Oxfmt 全仓 check，显式排除 `data/**`；Oxlint deny-warnings 同样排除 | 659 个格式输入通过，lint 零警告            |
| 单测         | 根 `bun run test`                                                   | 323 项、66 文件、1999 断言通过             |
| 组件浏览器   | Meowtail 标准配置，3 workers                                        | 157/157                                    |
| 演示浏览器   | `bun run test:presentation`                                         | 32/32                                      |
| 消费者浏览器 | showcase、图片示例、Sunshine                                        | 2/2、5/5、11/11；合计 207 项浏览器测试通过 |
| 展板         | showcase check                                                      | 113 个 stories 通过                        |

没有执行会扫描未知目录的原样根 check；使用上表等价的显式排除命令。没有重复运行代码未变的 Meowbook 工具全部专用浏览器矩阵，实际 capture 路径已使用。

## 本地安装态与交付边界

新批次回执为 `artifacts/presentation-backgrounds/consumer-Odgs12/receipt.json`。从最终 dist 打包三个真实 tgz，在全新 `/tmp` 消费者离线安装，禁用安装脚本，不使用源码 aliases 或包根 symlink；核对当前、打包与安装后 dist 字节一致。根与 presentation 子路径身份、背景公共类型正负例、无 DOM 的 core 类型、浏览器打包、宽窄视口实际组合与卸载全部通过。

Meowtail tarball SHA256 为 `9bcdb4833e89fdf3d263eeae4d15972eecf5d3d401a09377275301086d1ff4a3`；版本仍为 `0.1.1-presentation.20261017.1`，没有版本升级或覆盖历史发行资产。这是本地安装验收，不是 registry 安装或发布。

四张最终代表图保留在 `artifacts/presentation-background-review/`：`final-cover-wide.png`、`final-deck-wide.png`、`final-fallback-wide.png`、`final-cover-narrow.png`，由最终构建拍摄并实际查看。Library 保存未成功：恢复独立临时运行环境后，当前 Library 上传流程仍报告该执行环境不可用；未产生写入，也没有可交付的 Library ID。未绕过要求的保存流程；本地截图为剩余交付物。

当前没有剩余关键代码缺陷。尚未验证 Safari/Firefox、真实移动硬件、人工屏幕阅读器或浏览器 UI 缩放；已验证 Chromium/Chrome、模拟窄短窗口、既有画布缩放与背景组合。背景本身不提供自动对比度、视频、导出或预加载保证。本轮不推送、不发布 npm、不部署。
