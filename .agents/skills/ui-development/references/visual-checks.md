# Meowbook 视觉与交互取证

只在需要实际查看、截图或交互证据时读本页。完整 CLI 与摄影合同由 [Meowbook README](../../../../packages/meowbook/README.md) 持有，不在技能里复制全部参数。

## 建立可比场景

确认本次源码/安装产物、真实组件、配置与容器；已有服务不等于本版已重建。通用展板配置是 `apps/showcase/meowbook.config.ts`，包自己的 MeowUI 配置也可用。先发现实际 story id，例如从仓库根调用当前源码 CLI：

```sh
bun packages/meowbook/src/cli.ts list --config apps/showcase/meowbook.config.ts --query assistant --json
```

源码 CLI 取证不代替打包后已安装 CLI 验收；根 workspace 不保证存在 `meowbook` bin。安装态任务按[开发检查](../../../../docs/development-checks.md)准备精确产物，在消费者目录调用其已安装 CLI，不让 `bunx` 隐式去 registry 下载另一个同名版本。再从发现结果选本次对象，用 README 的 `capture` 或 `serve --capture` 进入需要的状态；一个控件不默认拍全目录。

相同内容、主题、视口、DPR 和前置状态有助于比较。先看整屏阅读轴、区域比例和累计留白，再看原图里的细节；窄/短窗、明暗与展开状态按问题选择。画布 padding、受约束高度和宿主临时样式会改变结果，不能把场景补丁当组件默认效果。

## 取证与解释

`capture` 是初始态；键盘、输入、展开、滚动后的状态用实际浏览器路径，再在同一 Page 调用 `meowbook/playwright` 的 `capturePage`。需要就绪时等待 `story-state` 的 ready 属性/attached 状态，标记就绪后会隐藏，不能等它可见。不要用强制点击绕过实际不可达控件。

从回执的目录、manifest 和实际图片路径取证，不猜“最新截图”。真实打开原图；测量、ARIA、组件树和 guides 用来解释疑点，图片数量或无溢出不等于视觉通过。完整图、局部裁图和 full-page 各有范围，内部滚动、懒加载、原生 popup 与 iframe 不能靠一张长图外推。

reduced-motion 和模拟设备只支持相应观察；暗色媒体参数不证明页面采用了暗色主题。focus 加工图不证明原图对比度，浏览器截图不证明原生窗口/系统控件体验。

工具或环境缺失时报告具体未验部分并继续不受影响的工作，不用源码推断视觉通过，不换路绕过工具拒绝。产物放本次临时/忽略目录；只清理经身份确认由本次启动的预览，不影响现有服务或真实数据。
